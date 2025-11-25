const { StreamClient } = require("@stream-io/node-sdk");
const asyncHandler = require("express-async-handler");

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Initialize Stream Client
// Note: We initialize it lazily or check if keys exist to avoid crashes if env vars are missing
const client = new StreamClient(apiKey || "placeholder", apiSecret || "placeholder");

//@description     Get Stream Video Token
//@route           GET /api/stream/token
//@access          Protected
const getToken = asyncHandler(async (req, res) => {
    if (!apiKey || !apiSecret) {
        res.status(500);
        throw new Error("Stream API Key or Secret is missing in backend .env");
    }

    const user = req.user;
    if (!user) {
        res.status(401);
        throw new Error("User not authenticated");
    }

    // Use the MongoDB _id as the Stream User ID
    const userId = user._id.toString();

    // Create the token
    // Validity is optional, defaults to 1 hour. We can set it to 24h for convenience.
    const token = client.generateUserToken({ user_id: userId, validity_in_seconds: 86400 });

    res.json({
        token,
        apiKey, // Send API key to frontend so it doesn't need to be hardcoded there too (optional, but convenient)
        user: {
            id: userId,
            name: user.name,
            image: user.pic,
        }
    });
});

module.exports = { getToken };
