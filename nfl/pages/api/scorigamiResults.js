import Scorigami from "@/models/Scorigami";
import dbConnect from "@/utils/dbConnect";

export default async function handler(req, res) {
    const { cursor } = req.query;
    const limit = 15;

    await dbConnect();
    const query = {};
    const response = {};
    
    if (cursor) {
        query._id = { $lt: cursor };
    }

    const items = await Scorigami.find(query).sort({ _id: -1 }).limit(limit + 1);
    const hasMore = items.length > limit;
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