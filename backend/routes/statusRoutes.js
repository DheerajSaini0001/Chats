const express = require("express");
const { createStatus, getStatusFeed } = require("../controllers/statusControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, createStatus);
router.route("/").get(protect, getStatusFeed);

module.exports = router;
