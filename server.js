const express = require("express");
const path = require("path");
require("dotenv").config();
const clientRoutes = require("./routes/clientRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/clients", clientRoutes);

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Inuuka Loan Tracker API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// Start server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
