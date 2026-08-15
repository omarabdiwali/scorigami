import { getRequest, getNestedProperty, validateData } from './global.js';

const getBoxScoreData = async (gameId, teamOrder) => {
    try {
        const boxScore = { 'teams': [] };
        const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${gameId}`;
        const data = await getRequest(url);

        const teamsInfo = getNestedProperty(data, ['header', 'competitions', 0, 'competitors']);
        const clock = getNestedProperty(data, ['header', 'competitions', 0, 'status', 'type', 'shortDetail']);
        const status = getNestedProperty(data, ['header', 'competitions', 0, 'status', 'type', 'state']);
        const allPlays = getNestedProperty(data, ["drives", "current", "plays"], true);
        
        let downDistance = undefined;
        let possession = undefined;
        
        for (const team of teamsInfo) {
            const hasPossession = getNestedProperty(team, ["possession"], true);
            if (hasPossession) {
                possession = getNestedProperty(team, ["team", "name"]);
                break;
            }
        }

        if (allPlays) {
            const lastPlay = allPlays.at(-1);
            downDistance = lastPlay ? getNestedProperty(lastPlay, ['end', 'downDistanceText'], true) : undefined;
        }

        boxScore.clock = clock;
        boxScore.status = status;
        boxScore.downDistance = clock != "Halftime" ? downDistance : undefined;
        boxScore.possession = possession;

        for (const team of getNestedProperty(data, ['boxscore', 'players'])) {
            const teamKeys = ['id', 'team', 'score', 'data', 'linescore'];
            const teamId = getNestedProperty(team, ['team', 'id'])
            const teamName = getNestedProperty(team, ['team', 'shortDisplayName']);
            const teamData = [];
            const teamIndex = getNestedProperty(teamsInfo, [0, 'team', 'id']) == teamId ? 0 : 1
            const teamScore = getNestedProperty(teamsInfo, [teamIndex, 'score']);
            
            const linescore = [];
            const linescoreData = getNestedProperty(teamsInfo, [teamIndex, 'linescores'], true);
            const periods = linescoreData != undefined ? Math.max(linescoreData.length, 4) : 4;

            for (let i = 0; i < periods; i++) {
                if (linescoreData == undefined || i >= linescoreData.length) {
                    linescore.push('-');
                } else {
                    linescore.push(linescoreData.at(i).displayValue);
                }
            }

            linescore.push(teamScore);

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

            const teamObj = { id: teamId, team: teamName, score: teamScore, linescore, data: teamData };
            validateData(teamObj, teamKeys);
            
            if (teamName == teamOrder[0]) {
                boxScore.teams.unshift(teamObj);
            } else {
                boxScore.teams.push(teamObj);
            }
        }

        return boxScore;
    } catch (error) {
        console.error("Error fetching box score data:", error.message || error);
        return {};
    }
}

export default getBoxScoreData;