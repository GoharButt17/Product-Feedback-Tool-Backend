var express = require("express");
var router = express.Router();
require("dotenv").config();

const feedbackController = require("../controllers/FeedbackController");

// Submit Feedback

router.post("/submit", feedbackController.submitFeedback);

// Get All Feedbacks

router.get("/list", feedbackController.getAllFeedback);

// Add Comment on Feedback

router.post("/comment/submit", feedbackController.postComment);

// Get All Comments

router.get("/comment/list", feedbackController.getComments);

module.exports = router;
