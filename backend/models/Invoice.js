const mongoose = require("mongoose");
const crypto = require("crypto");

const InvoiceSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: "Tenant" },
    month: { type: String, required: true },

    electricity: {
      old: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      usage: { type: Number, default: 0 },
      priceSnapshot: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },

    water: {
      old: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      usage: { type: Number, default: 0 },
      priceSnapshot: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },

    services: [
      {
        name: String,
        price: Number
      }
    ],

    additionalFees: { type: Number, default: 0 },

    // --- THÊM DÒNG NÀY ---
    roomPriceSnapshot: { type: Number, required: true, default: 0 },
    // ---------------------

    totalAmount: { type: Number, required: true, default: 0 },

    status: {
      type: String,
      enum: ["UNPAID", "PAID"],
      default: "UNPAID"
    },

    accessKey: { 
      type: String, 
      unique: true,
      default: () => crypto.randomBytes(6).toString("hex") 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);