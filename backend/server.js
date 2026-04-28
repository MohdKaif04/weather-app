const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const weatherRoutes = require("./routes/weather");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Updated CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://192.168.1.105:3000" // your network IP
  ]
}));

app.use(express.json());

// Routes
app.use("/api/weather", weatherRoutes);

// Health check
app.get("/", (req, res) => res.json({ status: "Weather API running ✅" }));

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});