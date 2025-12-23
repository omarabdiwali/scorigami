import getGameData from "@/utils/fetchGames";

export default async function handler(req, res) {
    const games = await getGameData();
    return res.status(200).json({ games });
}