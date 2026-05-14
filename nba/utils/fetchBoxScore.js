import { getRequest, getNestedProperty, validateData } from './global.js';

const getBoxScoreData = async (gameId, teamOrder) => {
    try {
        const boxScore = { 'teams': [] };
        const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
        const data = await getRequest(url);
        
        const teamsInfo = getNestedProperty(data, ['header', 'competitions', 0, 'competitors']);
        const clock = getNestedProperty(data, ['header', 'competitions', 0, 'status', 'type', 'shortDetail']);
        const status = getNestedProperty(data, ['header', 'competitions', 0, 'status', 'type', 'state']);
        
        boxScore.clock = clock;
        boxScore.status = status;

        for (const team of getNestedProperty(data, ['boxscore', 'players'])) {
            const teamKeys = ['id', 'team', 'score', 'linescore', 'data'];
            const teamId = getNestedProperty(team, ['team', 'id'])
            const teamName = getNestedProperty(team, ['team', 'shortDisplayName']);
            const teamStats = getNestedProperty(team, ['statistics', 0]);
            const teamIndex = getNestedProperty(teamsInfo, [0, 'team', 'id']) == teamId ? 0 : 1
            const teamScore = getNestedProperty(teamsInfo, [teamIndex, 'score']);
            const linescoreData = getNestedProperty(teamsInfo, [teamIndex, 'linescores'], true);
            const teamData = [];
            const linescore = [];
            const quarters = linescoreData != undefined ? Math.max(linescoreData.length, 4) : 4;

            for (let i = 0; i < quarters; i++) {
                if (linescoreData == undefined || i >= linescoreData.length) {
                    linescore.push('0');
                } else {
                    linescore.push(linescoreData.at(i).displayValue);
                }
            }

            linescore.push(teamScore);
            
            if (!('labels' in boxScore)) {
                const dataLabels = getNestedProperty(teamStats, ['labels']);
                const dataDesc = getNestedProperty(teamStats, ['descriptions']);
                boxScore.labels = dataLabels;
                boxScore.descriptions = dataDesc;
            }

            for (const athlete of teamStats.athletes) {
                const keys = ['id', 'shortName', 'displayName', 'jersey', 'position', 'starter', 'stats'];
                const id = getNestedProperty(athlete, ['athlete', 'id'])
                const shortName = getNestedProperty(athlete, ['athlete', 'shortName']);
                const displayName = getNestedProperty(athlete, ['athlete', 'displayName']);
                const jersey = getNestedProperty(athlete, ['athlete', 'jersey']);
                const position = getNestedProperty(athlete, ['athlete', 'position', 'abbreviation']);
                const starter = getNestedProperty(athlete, ['starter']);
                
                if (!athlete.didNotPlay) {
                    const stats = getNestedProperty(athlete, ['stats']);
                    if (stats.at(0) == '--' || stats.at(0) == '-') {
                        stats[0] = '0';
                    }
                    const playerData = { id, shortName, displayName, jersey, position, starter, stats };
                    validateData(playerData, keys);
                    teamData.push(playerData);
                }
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