const express = require("express");

const router = express.Router();

const {
  showRegistrationForm,
  registerClient,
} = require("../controllers/clientController");

// Display registration form
router.get("/register", showRegistrationForm);

// Process registration
router.post("/register", registerClient);

module.exports = router;
