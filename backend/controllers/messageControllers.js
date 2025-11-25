const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/message/:chatId
//@access          Protected
const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Create New Message
//@route           POST /api/message
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId, attachment } = req.body;

    // Must have either content or attachment
    if ((!content && !attachment) || !chatId) {
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        chat: chatId,
    };

    // Add content if provided
    if (content) {
        newMessage.content = content;
    }

    // Add attachment if provided
    if (attachment) {
        newMessage.attachment = attachment;
    }

    // Check for chat request status
    const chatData = await Chat.findById(chatId);
    if (!chatData) {
        res.status(404);
        throw new Error("Chat not found");
    }

    if (!chatData.isGroupChat && chatData.isAccepted === false) {
        // If sender is the requester
        if (chatData.requestedBy.toString() === req.user._id.toString()) {
            const messageCount = await Message.countDocuments({ chat: chatId });
            if (messageCount >= 1) {
                res.status(400);
                throw new Error("Wait for request acceptance to send more messages");
            }
        } else {
            // If sender is the receiver (they must accept first)
            res.status(400);
            throw new Error("Please accept the request first");
        }
    }

    try {
        var message = await Message.create(newMessage);

        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const deleteMessage = asyncHandler(async (req, res) => {
    const { messageId, deleteType } = req.body; // deleteType: "me" or "everyone"

    if (!messageId || !deleteType) {
        res.status(400);
        throw new Error("Please provide messageId and deleteType");
    }

    try {
        let message = await Message.findById(messageId);

        if (!message) {
            res.status(404);
            throw new Error("Message not found");
        }

        if (deleteType === "everyone") {
            // Check if user is sender
            if (message.sender.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error("You can only delete your own messages for everyone");
            }
            message.isDeletedForEveryone = true;
        } else if (deleteType === "me") {
            // Add user to deletedBy if not already present
            if (!message.deletedBy.includes(req.user._id)) {
                message.deletedBy.push(req.user._id);
            }
        } else {
            res.status(400);
            throw new Error("Invalid deleteType");
        }

        await message.save();

        // Populate for returning updated message
        message = await message.populate("sender", "name pic email");
        message = await message.populate("chat");

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { allMessages, sendMessage, deleteMessage };
