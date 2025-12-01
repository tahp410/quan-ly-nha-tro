const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    basePrice: { type: Number, required: true },
    floor: { type: Number, default: 1 },

    status: {
      type: String,
      enum: ["EMPTY", "RENTED", "OWE"],
      default: "EMPTY",
    },

    currentTenants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tenant" }],
      default: []
    },

    lastReadings: {
      electricity: { type: Number, default: 0 },
      water: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", RoomSchema);
