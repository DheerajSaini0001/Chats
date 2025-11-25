const mongoose = require("mongoose");

const statusSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        mediaUrl: { type: String, required: true },
        mediaType: { type: String, required: true }, // "image" or "video"
        caption: { type: String, trim: true },
        viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        expiresAt: { type: Date, default: Date.now, index: { expires: '24h' } } // Auto-delete after 24h
    },
    { timestamps: true }
);

const Status = mongoose.model("Status", statusSchema);

module.exports = Status;
