import { getRequest, getNestedProperty, validateData } from './global';

const getGameData = async () => {
    try {
        const keys = ["date", "teams", "status"];
        const games = [];
        const url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
        const data = await getRequest(url);

        for (const event of data.events) {
            const date = getNestedProperty(event, ["date"]);
            const currentGame = {};
            currentGame.date = date;
            currentGame.teams = [];

            for (const team of getNestedProperty(event, ["competitions", 0, "competitors"])) {
                const teamData = {};
                const dataKeys = ["name", "score", "logo", "record"];
                teamData.name = getNestedProperty(team, ["team", "shortDisplayName"]);
                teamData.score = getNestedProperty(team, ["score"]);
                teamData.logo = getNestedProperty(team, ["team", "logo"]);
                teamData.record = getNestedProperty(team, ["records", 0, "summary"])
                validateData(teamData, dataKeys);
                currentGame.teams.push(teamData);
            }

            currentGame.status = getNestedProperty(event, ["status", "type", "shortDetail"]);
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