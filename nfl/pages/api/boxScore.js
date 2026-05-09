import getBoxScoreData from "@/utils/fetchBoxScore";

export default async function handler(req, res) {
    if (!req.body) {
        res.status(400).json({ result: "Invalid request." });
        return;
    }
    
    const { gameId, status, teamOrder } = JSON.parse(req.body);
    if (status == "pre") {
        return res.status(200).json({ result: {} });
    }

    const data = await getBoxScoreData(gameId, teamOrder);
    return res.status(200).json({ result: data });
}