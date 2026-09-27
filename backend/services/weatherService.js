/**
 * Weather service using free Open-Meteo APIs (no API key required).
 * Falls back to a small regional profile if geocoding/weather is temporarily unavailable.
 */

const REGIONAL_CLIMATES = {
  ahmednagar: { baseTemp: 29, humidity: 55, wind: 14, rainfallProb: 18, condition: 'Partly Cloudy', icon: 'partly-cloudy' },
  nashik: { baseTemp: 27, humidity: 62, wind: 16, rainfallProb: 24, condition: 'Mild Breeze', icon: 'wind' },
  pune: { baseTemp: 28, humidity: 58, wind: 12, rainfallProb: 15, condition: 'Sunny / Clear', icon: 'sun' },
  satara: { baseTemp: 26, humidity: 65, wind: 15, rainfallProb: 30, condition: 'Scattered Clouds', icon: 'cloud' },
  solapur: { baseTemp: 33, humidity: 42, wind: 18, rainfallProb: 10, condition: 'Sunny & Dry', icon: 'sun' },
  kolhapur: { baseTemp: 27, humidity: 70, wind: 14, rainfallProb: 35, condition: 'Humid & Overcast', icon: 'cloud-rain' },
  sambhajinagar: { baseTemp: 31, humidity: 48, wind: 13, rainfallProb: 12, condition: 'Warm & Sunny', icon: 'sun' },
  aurangabad: { baseTemp: 31, humidity: 48, wind: 13, rainfallProb: 12, condition: 'Warm & Sunny', icon: 'sun' },
  nagpur: { baseTemp: 34, humidity: 40, wind: 11, rainfallProb: 8, condition: 'Hot & Clear', icon: 'sun' },
  default: { baseTemp: 29, humidity: 56, wind: 14, rainfallProb: 20, condition: 'Favorable Farming Weather', icon: 'partly-cloudy' },
};

const weatherCode = (code) => {
  if ([0, 1].includes(code)) return ['Clear / Mostly Clear', 'sun'];
  if ([2].includes(code)) return ['Partly Cloudy', 'partly-cloudy'];
  if ([3].includes(code)) return ['Cloudy', 'cloud'];
  if ([45, 48].includes(code)) return ['Foggy', 'cloud'];
  if ([51, 53, 55, 56, 57].includes(code)) return ['Drizzle', 'cloud-rain'];
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return ['Rain', 'cloud-rain'];
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ['Snow', 'cloud'];
  if ([95, 96, 99].includes(code)) return ['Thunderstorm', 'cloud-rain'];
  return ['Mixed Weather', 'partly-cloudy'];
};

const generateAgriAdvisory = (temp, humidity, rainProb, windSpeed) => {
  const advisories = [];
  if (rainProb > 40) advisories.push('Rain expected: Postpone chemical spraying and fertilizer application.');
  else if (windSpeed > 20) advisories.push('High winds: Avoid foliar spraying to prevent spray drift.');
  else advisories.push('Conditions are suitable for routine crop monitoring and field work.');
  if (humidity > 70 && temp > 25) advisories.push('High humidity: Monitor crops for fungal diseases and leaf spots.');
  else if (temp > 33) advisories.push('High temperature: Prefer early-morning or evening irrigation.');
  else advisories.push('Keep monitoring soil moisture and crop growth.');
  return advisories;
};

const fallbackWeather = (location = '', district = '') => {
  const query = (location || district || 'Ahmednagar').toLowerCase().trim();
  let profile = REGIONAL_CLIMATES.default;
  for (const [key, value] of Object.entries(REGIONAL_CLIMATES)) {
    if (query.includes(key) || (district && district.toLowerCase().includes(key))) { profile = value; break; }
  }
  const currentTemp = profile.baseTemp;
  const forecast = [1, 2, 3, 4].map((offset) => ({
    day: `Day ${offset}`,
    tempMax: Math.round(profile.baseTemp + 3),
    tempMin: Math.round(profile.baseTemp - 5),
    condition: profile.condition,
    icon: profile.icon,
    rainProb: profile.rainfallProb,
  }));
  return {
    location: location || district || 'Ahmednagar, Maharashtra', district: district || 'Ahmednagar',
    temperature: currentTemp, unit: '°C', humidity: profile.humidity, windSpeed: profile.wind, windUnit: 'km/h',
    rainfallProbability: profile.rainfallProb, rainfallAmount: '0 mm', condition: profile.condition, icon: profile.icon,
    uvIndex: 'Moderate', airQuality: 'Good', soilMoistureStatus: 'Moderate', advisories: generateAgriAdvisory(currentTemp, profile.humidity, profile.rainfallProb, profile.wind),
    forecast, source: 'KrushiSevak fallback weather profile', updatedAt: new Date().toISOString(), fallback: true,
  };
};

const getWeatherByLocation = async (location = '', district = '') => {
  const query = (location || district || 'Ahmednagar').trim();
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl, { signal: AbortSignal.timeout(8000) });
    if (!geoResponse.ok) throw new Error('Geocoding request failed');
    const geo = await geoResponse.json();
    const place = geo.results?.[0];
    if (!place) return fallbackWeather(location, district);

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&forecast_days=5&timezone=auto`;
    const response = await fetch(forecastUrl, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Weather request failed');
    const data = await response.json();
    const [condition, icon] = weatherCode(data.current?.weather_code);
    const days = data.daily?.time || [];
    const forecast = days.slice(1, 5).map((date, i) => {
      const [c, ic] = weatherCode(data.daily.weather_code[i + 1]);
      return {
        day: new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short' }),
        date, tempMax: Math.round(data.daily.temperature_2m_max[i + 1]), tempMin: Math.round(data.daily.temperature_2m_min[i + 1]),
        condition: c, icon: ic, rainProb: data.daily.precipitation_probability_max?.[i + 1] ?? 0,
      };
    });
    const temp = Number(data.current?.temperature_2m ?? 0);
    const humidity = Number(data.current?.relative_humidity_2m ?? 0);
    const wind = Number(data.current?.wind_speed_10m ?? 0);
    const rainProb = Number(data.daily?.precipitation_probability_max?.[0] ?? 0);
    return {
      location: [place.name, place.admin1, place.country].filter(Boolean).join(', '), district: district || place.admin2 || place.admin1 || '',
      latitude: place.latitude, longitude: place.longitude, temperature: temp, unit: '°C', humidity, windSpeed: wind, windUnit: 'km/h',
      rainfallProbability: rainProb, rainfallAmount: `${Number(data.current?.precipitation ?? 0).toFixed(1)} mm`,
      condition, icon, uvIndex: 'Live forecast', airQuality: 'See local monitoring', soilMoistureStatus: 'Not provided by weather API',
      advisories: generateAgriAdvisory(temp, humidity, rainProb, wind), forecast,
      source: 'Open-Meteo', updatedAt: new Date().toISOString(), fallback: false,
    };
  } catch (error) {
    return fallbackWeather(location, district);
  }
};

module.exports = { getWeatherByLocation };
