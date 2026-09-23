import NBAScorigami from "@/models/NBAScorigami";
import dbConnect from "@/utils/dbConnect";
import { LIMIT } from "@/utils/global";

export default async function handler(req, res) {
    const { cursor } = req.query;

    await dbConnect();
    const query = {};
    const response = {};
    
    if (cursor) {
        query._id = { $lt: cursor };
    }

    const items = await NBAScorigami.find(query).sort({ _id: -1 }).limit(LIMIT + 1);
    const hasMore = items.length > LIMIT;
    response.hasMore = hasMore;
    
    if (hasMore) {
        items.pop();
        response.results = items;
        response.cursor = items.at(-1)?._id;
    } else {
        response.results = items;
        response.cursor = null;
    }

    return res.status(200).json(response);
}