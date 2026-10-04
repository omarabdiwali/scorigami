import CachedEvents from '@/models/CachedEvents';
import dbConnect from './dbConnect';
import { getNestedProperty, validateData, needsRefresh, getRequest } from './global';

const getCachedData = async () => {
    await dbConnect();

    const url = "https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
    const currentTime = new Date();
    let item = await CachedEvents.findOne({ key: "nflGames" }).lean();
    let events = item ? item.events : [];
    
    if (!item || needsRefresh(currentTime, item.updatedAt)) {
        const data = await getRequest(url)
        events = data.events;
        await CachedEvents.updateOne({ key: "nflGames" }, { $set: { events: data.events } }, { upsert: true });
    }

    return events;
}

const getGameData = async () => {
    try {
        const requiredKeys = ["id", "date", "teams", "status", "detail"];
        const games = [];
        const events = await getCachedData();

        for (const event of events) {
            const id = getNestedProperty(event, ["id"]);
            const date = getNestedProperty(event, ["date"]);
            const currentGame = {};
            const idToTeam = {};
            
            currentGame.id = id;
            currentGame.date = date;
            currentGame.teams = [];

            for (const team of getNestedProperty(event, ["competitions", 0, "competitors"])) {
                const teamData = {};
                const dataKeys = ["name", "score", "record"];
                const teamId = getNestedProperty(team, ["id"]);
                const record = getNestedProperty(team, ["records", 0, "summary"], true);
                
                teamData.name = getNestedProperty(team, ["team", "shortDisplayName"]);
                teamData.score = getNestedProperty(team, ["score"]);
                teamData.logo = getNestedProperty(team, ["team", "logo"], true);
                teamData.record = record ? record : "";
                
                idToTeam[teamId] = teamData.name;
                validateData(teamData, dataKeys);
                currentGame.teams.push(teamData);
            }

            currentGame.status = getNestedProperty(event, ["status", "type", "state"]);
            currentGame.detail = getNestedProperty(event, ["status", "type", "shortDetail"]);
            currentGame.gameDetail = getNestedProperty(event, ["competitions", 0, "notes", 0, "headline"], true);

            try {
                if (currentGame.status == "in") {
                    const possession = getNestedProperty(event, ["competitions", 0, "situation", "possession"], true);
                    const downDistance = getNestedProperty(event, ["competitions", 0, "situation", "downDistanceText"], true);
                    currentGame.possession = possession != undefined ? idToTeam[possession] : undefined;
                    currentGame.downDistance = currentGame.detail != "Halftime" ? downDistance : undefined;
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