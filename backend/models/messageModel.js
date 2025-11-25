const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
    {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        content: { type: String, trim: true },
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        attachment: {
            type: {
                url: { type: String, required: true },
                fileType: { type: String, required: true }, // image, document, video, audio, other
                fileName: { type: String, required: true },
                fileSize: { type: Number, required: true }, // in bytes
            },
            default: null,
        },
        deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        isDeletedForEveryone: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
