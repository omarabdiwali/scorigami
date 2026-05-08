import { getRequest, getNestedProperty, validateData } from './global.js';

const getBoxScoreData = async (gameId, teamOrder) => {
    try {
        const boxScore = { 'teams': [], 'teamPoints': {} };
        const url = `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${gameId}`;
        const data = await getRequest(url);

        for (const team of getNestedProperty(data, ['boxscore', 'players'])) {
            const teamKeys = ['id', 'team', 'score', 'data'];
            const teamId = getNestedProperty(team, ['team', 'id'])
            const teamName = getNestedProperty(team, ['team', 'name']);
            const teamStats = getNestedProperty(team, ['statistics', 0]);
            const teamData = []
            let teamScore = 0;
            
            if (!('labels' in boxScore)) {
                const dataLabels = getNestedProperty(teamStats, ['labels']);
                const dataDesc = getNestedProperty(teamStats, ['descriptions']);
                boxScore['labels'] = dataLabels;
                boxScore['descriptions'] = dataDesc;
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
                    const playerData = { id, shortName, displayName, jersey, position, starter, stats };
                    validateData(playerData, keys);
                    teamData.push(playerData);
                    teamScore += parseInt(stats[1] || 0)
                }
            }

            const teamObj = { id: teamId, team: teamName, score: teamScore, data: teamData };
            validateData(teamObj, teamKeys);
            if (teamName == teamOrder[0]) {
                boxScore['teams'].unshift(teamObj);
            } else {
                boxScore['teams'].push(teamObj);
            }
        }

        return boxScore;
    } catch (error) {
        console.error("Error fetching box score data:", error.message || error);
        return {};
    }
}

export default getBoxScoreData;