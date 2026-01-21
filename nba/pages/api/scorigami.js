import getScorigamiData from "@/utils/fetchScores";
import { TwitterApi } from "twitter-api-v2";

const checkNewGames = async () => {
  try {
    return await getScorigamiData();
  } catch (e) {
    return {
      status: "error",
      error: `Error checking new games: ${e.message}`,
      tweets: []
    };
  }
}

const tweetScores = async (tweets) => {
  let newTweets = 0;
  const twitterClient = new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_KEY_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_TOKEN_SECRET
  })

  try {
    for (const tweet of tweets) {
      await twitterClient.v2.tweet(tweet);
      newTweets += 1;
    }
    return {
      status: "success",
      error: null,
      response: `${newTweets}/${tweets.length} new tweets posted!`
    };
  } catch (e) {
    return {
      status: "error",
      error: `Error posting tweets: ${e.message}. Missing tweets: ${tweets.slice(newTweets)}`,
      response: `${newTweets}/${tweets.length} new tweets posted!`
    };
  }
}

export default async function handler(req, res) {
  const { token } = req.body;
  if (token !== process.env.LAMBDA_TOKEN) {
    res.status(200).json({ result: "Invalid authentication..." });
    return;
  }
  
  const responseData = await checkNewGames();
  if (responseData.status === "error") {
    res.status(500).json({ result: responseData.error });
    return;
  }

  if (responseData.tweets.length > 0) {
    const newTweets = await tweetScores(tweetData);
    if (newTweets.status === "success") {
      res.status(200).json({ result: newTweets.response });
    } else {
      res.status(500).json({ result: newTweets.error + '\n' + newTweets.response });
    }
  } else {
    res.status(200).json({ result: "Nothing new..." });
  }
}