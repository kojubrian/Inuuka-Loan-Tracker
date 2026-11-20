const express = require("express");

const router = express.Router();

const {
  showRegistrationForm,
  registerLoan,
} = require("../controllers/loanController");

router.get("/register", showRegistrationForm);

router.post("/register", registerLoan);

module.exports = router;
