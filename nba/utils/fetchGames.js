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
                const dataKeys = ["name", "score", "logo", "record"];
                const record = getNestedProperty(team, ["records", 0, "summary"], true);
                teamData.name = getNestedProperty(team, ["team", "shortDisplayName"]);
                teamData.score = getNestedProperty(team, ["score"]);
                teamData.logo = getNestedProperty(team, ["team", "logo"]);
                teamData.record = record ? record : "";
                validateData(teamData, dataKeys);
                currentGame.teams.push(teamData);
            }

            currentGame.status = getNestedProperty(event, ["status", "type", "state"]);
            currentGame.detail = getNestedProperty(event, ["status", "type", "shortDetail"]);
            currentGame.gameDetail = getNestedProperty(event, ["competitions", 0, "notes", 0, "headline"], true);
            
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