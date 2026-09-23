import NBAScorigami from "@/models/NBAScorigami";
import dbConnect from "@/utils/dbConnect";
import getScorigamiData from "@/utils/fetchScores";

const checkNewGames = async () => {
  try {
    return await getScorigamiData();
  } catch (e) {
    return { success: false, data: e.message };
  }
}

const addToScorigami = async (items) => {
  await dbConnect();
  try {
    const createdItems = await NBAScorigami.insertMany(items, { lean: true, ordered: false });
    return {
      status: 200,
      message: `${createdItems.length}/${items.length} games added!`
    };
  } catch (error) {
    console.error('Batch insertion failed:', error);
    
    if (error.writeErrors) {
      let message = "";
      for (const err of error.writeErrors) {
        message += err.errmsg + '\n';
      }
      
      const succeededCount = error.insertedDocs?.length || 0;
      return {
        status: 200,
        message: `${succeededCount}/${items.length} games added.\nErrors:\n${message.trim()}`
      };
    }

    return {
      status: 500,
      message: `Database connection error: ${error.message}`
    }
  }
}

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.LAMBDA_TOKEN}`) {
    return res.status(401).json({ result: "Invalid authentication..." });
  }
  
  const gamesInfo = await checkNewGames();
  if (!gamesInfo.success) {
    return res.status(500).json({ result: gamesInfo.data });
  }
  
  if (gamesInfo.data.length > 0) {
    const result = await addToScorigami(gamesInfo.data);
    return res.status(result.status).json({ result: result.message })
  } else {
    return res.status(200).json({ result: "Nothing new..." });
  }
}