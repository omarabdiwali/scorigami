import mongoose from "mongoose";

const ScorigamiSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true
  },
  date: Date,
  homeTeam: String,
  awayTeam: String,
  homeScore: String,
  awayScore: String,
  text: String
});

export default mongoose.models.Scorigami || mongoose.model("Scorigami", ScorigamiSchema);