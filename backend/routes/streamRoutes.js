const express = require("express");
const { getToken } = require("../controllers/streamController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/token").get(protect, getToken);

module.exports = router;
