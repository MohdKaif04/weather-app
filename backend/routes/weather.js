const express = require("express");
const axios = require("axios");
const router = express.Router();

const BASE_URL = "https://api.openweathermap.org/data/2.5";

// GET /api/weather?city=Delhi
router.get("/", async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city || city.trim() === "") {
      return res.status(400).json({ error: "City name is required" });
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "API key not configured on server" });
    }

    // Current weather
    const weatherRes = await axios.get(`${BASE_URL}/weather`, {
      params: { q: city.trim(), appid: apiKey, units: "metric" },
    });

    // 5-day forecast
    const forecastRes = await axios.get(`${BASE_URL}/forecast`, {
      params: { q: city.trim(), appid: apiKey, units: "metric" },
    });

    const w = weatherRes.data;

    // Extract one reading per day from forecast (noon time slots)
    const dailyForecast = forecastRes.data.list
      .filter((item) => item.dt_txt.includes("12:00:00"))
      .slice(0, 5)
      .map((item) => ({
        date: item.dt_txt.split(" ")[0],
        temp: Math.round(item.main.temp),
        feels_like: Math.round(item.main.feels_like),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        wind_speed: item.wind.speed,
      }));

    res.json({
      city: w.name,
      country: w.sys.country,
      temperature: Math.round(w.main.temp),
      feels_like: Math.round(w.main.feels_like),
      temp_min: Math.round(w.main.temp_min),
      temp_max: Math.round(w.main.temp_max),
      humidity: w.main.humidity,
      pressure: w.main.pressure,
      visibility: w.visibility / 1000, // km
      wind_speed: w.wind.speed,
      wind_deg: w.wind.deg,
      description: w.weather[0].description,
      icon: w.weather[0].icon,
      sunrise: new Date(w.sys.sunrise * 1000).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sunset: new Date(w.sys.sunset * 1000).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      forecast: dailyForecast,
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ error: "City not found. Please check the spelling." });
    }
    if (err.response?.status === 401) {
      return res.status(401).json({ error: "Invalid API key." });
    }
    next(err);
  }
});

module.exports = router;