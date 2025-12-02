const mongoose = require("mongoose");

const TenantSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: String,
    cccd: String,
    hometown: String,

    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null }, // Ngày khách rời phòng

    hasLeft: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tenant", TenantSchema);
