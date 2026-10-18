import CachedEvents from '@/models/CachedEvents';
import dbConnect from './dbConnect';
import { getRequest, getNestedProperty, validateData, needsRefresh } from './global';

const getCachedData = async () => {
    await dbConnect();

    const url = "https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
    const currentTime = new Date();
    let item = await CachedEvents.findOne({ key: "nbaGames" }).lean();
    let events = item ? item.events : [];
    
    if (!item || needsRefresh(currentTime, item.updatedAt)) {
        const data = await getRequest(url)
        events = data.events;
        await CachedEvents.updateOne({ key: "nbaGames" }, { $set: { events: data.events } }, { upsert: true });
    }

    return events;
}

const getGameData = async () => {
    try {
        const keys = ["id", "date", "teams", "status", "detail"];
        const games = [];
        const events = await getCachedData();

        for (const event of events) {
            const id = getNestedProperty(event, ["id"]);
            const date = getNestedProperty(event, ["date"]);
            const currentGame = {};
            currentGame.id = id;
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