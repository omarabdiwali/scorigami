import { getRequest, getNestedProperty, validateData } from './global.js';

const getBoxScoreData = async (gameId, teamOrder) => {
    try {
        const boxScore = { 'teams': [] };
        const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`;
        const data = await getRequest(url);

        const teamsInfo = getNestedProperty(data, ['header', 'competitions', 0, 'competitors']);
        const clock = getNestedProperty(data, ['header', 'competitions', 0, 'status', 'type', 'shortDetail']);
        const status = getNestedProperty(data, ['header', 'competitions', 0, 'status', 'type', 'state']);
        const possessionId = getNestedProperty(data, ["header", "competitions", 0, "situation", "possession"], true);
        const downDistance = getNestedProperty(data, ["header", "competitions", 0, "situation", "downDistanceText"], true);

        boxScore.clock = clock;
        boxScore.status = status;
        boxScore.downDistance = downDistance;

        for (const team of getNestedProperty(data, ['boxscore', 'players'])) {
            const teamKeys = ['id', 'team', 'score', 'data'];
            const teamId = getNestedProperty(team, ['team', 'id'])
            const teamName = getNestedProperty(team, ['team', 'shortDisplayName']);
            const teamData = [];
            const teamIndex = getNestedProperty(teamsInfo, [0, 'team', 'id']) == teamId ? 0 : 1
            const teamScore = getNestedProperty(teamsInfo, [teamIndex, 'score']);

            for (const stats of getNestedProperty(team, ['statistics'])) {
                const positionStats = {};
                const labels = getNestedProperty(stats, ['labels']);
                const desc = getNestedProperty(stats, ['descriptions']);
                const heading = getNestedProperty(stats, ['text']);

                positionStats.heading = heading;
                positionStats.labels = labels;
                positionStats.descriptions = desc;
                positionStats.players = [];

                for (const athlete of getNestedProperty(stats, ['athletes'])) {
                    const keys = ['id', 'name', 'jersey', 'stats'];
                    const id = getNestedProperty(athlete, ['athlete', 'id'])
                    const name = getNestedProperty(athlete, ['athlete', 'displayName']);
                    const jersey = getNestedProperty(athlete, ['athlete', 'jersey']);
                    const stats = getNestedProperty(athlete, ['stats']);
                    const playerData = { id, name, jersey, stats };
                    validateData(playerData, keys);
                    positionStats.players.push(playerData);
                }

                teamData.push(positionStats);
            }

            if (status == "in" && boxScore.possession == undefined) {
                boxScore.possession = possessionId != undefined ? possessionId == teamId ? teamName : undefined : undefined;
            }

            const teamObj = { id: teamId, team: teamName, score: teamScore, data: teamData };
            validateData(teamObj, teamKeys);
            
            if (teamName == teamOrder[0]) {
                boxScore.teams.unshift(teamObj);
            } else {
                boxScore.teams.push(teamObj);
            }
        }

        boxScore.downDistance = '4th and Long';
        return boxScore;
    } catch (error) {
        console.error("Error fetching box score data:", error.message || error);
        return {};
    }
}

export default getBoxScoreData;