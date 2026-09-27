/**
 * Geocoding Utility
 * Converts address to latitude/longitude using OpenStreetMap Nominatim API (free, no API key required)
 */

const https = require('https');

/**
 * Geocode an address to get latitude and longitude
 * @param {Object} addressParts - Address components
 * @param {string} addressParts.village - Village name
 * @param {string} addressParts.taluka - Taluka name
 * @param {string} addressParts.district - District name
 * @param {string} addressParts.state - State name (default: Maharashtra)
 * @param {string} addressParts.country - Country name (default: India)
 * @returns {Promise<Object>} - { lat, lng, formatted_address } or null if failed
 */
async function geocodeAddress({ village, taluka, district, state = 'Maharashtra', country = 'India' }) {
  try {
    // Build address string from components
    const addressParts = [village, taluka, district, state, country].filter(Boolean);
    
    if (addressParts.length < 2) {
      console.log('Geocoding: Insufficient address information');
      return null;
    }

    const addressString = addressParts.join(', ');
    
    // URL encode the address
    const encodedAddress = encodeURIComponent(addressString);
    
    // OpenStreetMap Nominatim API (free, no API key required)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&addressdetails=1`;
    
    console.log(`Geocoding address: ${addressString}`);
    
    const result = await makeHttpsRequest(url);
    
    if (result && result.length > 0) {
      const location = result[0];
      const geocoded = {
        lat: parseFloat(location.lat),
        lng: parseFloat(location.lon),
        formatted_address: location.display_name || addressString
      };
      
      console.log(`Geocoding successful: ${geocoded.lat}, ${geocoded.lng}`);
      return geocoded;
    }
    
    console.log('Geocoding: No results found for address');
    return null;
    
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
}

/**
 * Make HTTPS request to geocoding API
 * @param {string} url - API URL
 * @returns {Promise<Object>} - Parsed JSON response
 */
function makeHttpsRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'KrushiSevak-AgriculturePlatform/1.0'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (e) {
          reject(new Error('Failed to parse geocoding response'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} - Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

module.exports = {
  geocodeAddress,
  calculateDistance
};
