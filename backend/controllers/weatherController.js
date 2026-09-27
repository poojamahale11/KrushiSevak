const { getWeatherByLocation } = require('../services/weatherService');

/**
 * @desc    Get regional weather data and agricultural advisories
 * @route   GET /api/weather
 * @access  Public
 */
const getWeather = async (req, res, next) => {
  try {
    const { location, district } = req.query;
    const weatherData = await getWeatherByLocation(location, district);

    res.status(200).json({
      success: true,
      weather: weatherData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeather,
};
