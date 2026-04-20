import { getRequest, getNestedProperty, validateData } from './global';

const getGameData = async () => {
    try {
        const keys = ["date", "teams", "status", "detail"];
        const games = [];
        const url = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
        const data = await getRequest(url);

        for (const event of data.events) {
            const date = getNestedProperty(event, ["date"]);
            const currentGame = {};
            currentGame.date = date;
            currentGame.teams = [];

            for (const team of getNestedProperty(event, ["competitions", 0, "competitors"])) {
                const teamData = {};
                const dataKeys = ["name", "score", "record"];
                const record = getNestedProperty(team, ["records", 0, "summary"], true);
                const series = getNestedProperty(team, ["record"], true);
                teamData.name = getNestedProperty(team, ["team", "shortDisplayName"]);
                teamData.score = getNestedProperty(team, ["score"]);
                teamData.logo = getNestedProperty(team, ["team", "logo"], true);
                teamData.record = record ? record : "";
                teamData.series = series ? series : "";
                validateData(teamData, dataKeys);
                currentGame.teams.push(teamData);
            }

            currentGame.status = getNestedProperty(event, ["status", "type", "state"]);
            currentGame.detail = getNestedProperty(event, ["status", "type", "shortDetail"]);
            currentGame.gameDetail = getNestedProperty(event, ["competitions", 0, "notes", 0, "headline"], true);
                        
            if (currentGame.teams[0].series && !currentGame.teams[1].series) {
                const series = currentGame.teams[0].series;
                const winsLosses = series.split('-');
                currentGame.teams[1].series = `${winsLosses[1]}-${winsLosses[0]}`;
            } else if (currentGame.teams[1].series && !currentGame.teams[0].series) {
                const series = currentGame.teams[1].series;
                const winsLosses = series.split('-');
                currentGame.teams[0].series = `${winsLosses[1]}-${winsLosses[0]}`;
            }
            
            validateData(currentGame, keys);
            games.push(currentGame);
        }

        return games;
    } catch (error) {
        console.error("Error fetching game data:", error.message || error);
        return [];
    }
}

export default getGameData;