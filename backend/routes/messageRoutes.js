const express = require("express");
const {
    allMessages,
    sendMessage,
    deleteMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/delete").put(protect, deleteMessage);
router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);

module.exports = router;
