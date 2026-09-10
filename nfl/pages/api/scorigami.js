import getScorigamiData from "@/utils/fetchScores";

const checkNewGames = async () => {
  try {
    return await getScorigamiData();
  } catch (e) {
    return { success: false, data: e.message };
  }
}

// const tweetScores = async (tweets) => {
//   let newTweets = 0;
//   const twitterClient = new TwitterApi({
//     appKey: process.env.API_KEY,
//     appSecret: process.env.API_KEY_SECRET,
//     accessToken: process.env.ACCESS_TOKEN,
//     accessSecret: process.env.ACCESS_TOKEN_SECRET
//   })

//   try {
//     for (const tweet of tweets) {
//       await twitterClient.v2.tweet(tweet);
//       newTweets += 1;
//     }
//     return `${newTweets}/${tweets.length} new tweets posted!`
//   } catch (e) {
//     console.log(e);
//     return `${newTweets}/${tweets.length} new tweets posted!`;
//   }
// }

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
    return res.status(200).json({ result: `Added ${gamesInfo.data.length} game(s) to the database!` })
  } else {
    return res.status(200).json({ result: "Nothing new..." });
  }
}