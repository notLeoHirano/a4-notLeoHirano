import mongoose from "mongoose";

const shapeSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  shapeName: { type: String, required: true },
  shape: { type: String, required: true }, // Shape coordinates as string
  description: { type: String, default: "No description provided" },
  selfTitled: { type: Boolean, default: false },
});

const Shape = mongoose.models.Shape || mongoose.model("Shape", shapeSchema);

export default Shape;
