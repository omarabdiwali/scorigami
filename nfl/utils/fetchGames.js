import { getRequest, getNestedProperty, validateData } from './global';

const getGameData = async () => {
    try {
        const requiredKeys = ["date", "teams", "status", "detail"];
        const games = [];
        const url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
        const data = await getRequest(url);

        for (const event of data.events) {
            const date = getNestedProperty(event, ["date"]);
            const currentGame = {};
            const idToTeam = {};
            currentGame.date = date;
            currentGame.teams = [];

            for (const team of getNestedProperty(event, ["competitions", 0, "competitors"])) {
                const teamData = {};
                const dataKeys = ["name", "score", "logo", "record"];
                const teamId = getNestedProperty(team, ["id"]);
                teamData.name = getNestedProperty(team, ["team", "shortDisplayName"]);
                teamData.score = getNestedProperty(team, ["score"]);
                teamData.logo = getNestedProperty(team, ["team", "logo"]);
                teamData.record = getNestedProperty(team, ["records", 0, "summary"])
                idToTeam[teamId] = teamData.name;
                validateData(teamData, dataKeys);
                currentGame.teams.push(teamData);
            }

            currentGame.status = getNestedProperty(event, ["status", "type", "name"]);
            currentGame.detail = getNestedProperty(event, ["status", "type", "shortDetail"]);

            try {
                if (currentGame.status == "STATUS_IN_PROGRESS") {
                    const possession = getNestedProperty(event, ["competitions", 0, "situation", "possession"], true);
                    const downDistance = getNestedProperty(event, ["competitions", 0, "situation", "downDistanceText"], true);
                    currentGame.possession = possession != undefined ? idToTeam[possession] : undefined;
                    currentGame.downDistance = downDistance;
                }
            } catch (error) { }
            
            validateData(currentGame, requiredKeys);
            games.push(currentGame);
        }

        return games;
    } catch (error) {
        console.error("Error fetching game data:", error.message || error);
        return [];
    }
}

export default getGameData;