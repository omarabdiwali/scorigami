import mongoose from "mongoose";

const NBAScorigamiSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  date: Date,
  homeTeam: String,
  awayTeam: String,
  homeScore: Number,
  awayScore: Number,
  text: String
});

export default mongoose.models.NBAScorigami || mongoose.model("NBAScorigami", NBAScorigamiSchema);