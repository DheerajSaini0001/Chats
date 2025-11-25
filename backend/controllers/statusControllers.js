const asyncHandler = require("express-async-handler");
const Status = require("../models/statusModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//@description     Create New Status
//@route           POST /api/status
//@access          Protected
const createStatus = asyncHandler(async (req, res) => {
    const { mediaUrl, mediaType, caption } = req.body;

    if (!mediaUrl || !mediaType) {
        res.status(400);
        throw new Error("Please provide mediaUrl and mediaType");
    }

    try {
        const status = await Status.create({
            user: req.user._id,
            mediaUrl,
            mediaType,
            caption,
        });

        const fullStatus = await Status.findOne({ _id: status._id }).populate("user", "name pic");

        res.status(201).json(fullStatus);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

//@description     Get Status Feed (Friends + My Status)
//@route           GET /api/status
//@access          Protected
const getStatusFeed = asyncHandler(async (req, res) => {
    try {
        // 1. Find all accepted 1-on-1 chats to identify friends
        const chats = await Chat.find({
            isGroupChat: false,
            isAccepted: true,
            users: { $elemMatch: { $eq: req.user._id } }
        });

        // 2. Extract friend IDs
        const friendIds = chats.reduce((acc, chat) => {
            const friend = chat.users.find(u => u.toString() !== req.user._id.toString());
            if (friend) acc.push(friend);
            return acc;
        }, []);

        // 3. Find statuses from friends and self
        // We rely on TTL index for expiration, but we can also filter for safety
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const statuses = await Status.find({
            user: { $in: [...friendIds, req.user._id] },
            createdAt: { $gt: twentyFourHoursAgo }
        })
            .populate("user", "name pic")
            .sort({ createdAt: -1 });

        res.json(statuses);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { createStatus, getStatusFeed };
