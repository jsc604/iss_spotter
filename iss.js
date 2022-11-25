const request = require('request');

const fetchMyIP = function(callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) return callback(error, null);
    if (response.statusCode !== 200) {
      callback(`Status code ${response.statusCode} when fetching IP: ${body}, null`);
    }

    const ip = JSON.parse(body);
    callback(null, ip.ip);
  });
};

//-----------------

const fetchCoordsByIP = function(ip, callback) {
  request(`http://ipwho.is/${ip}`, (error, response, body) => {
    if (error) return callback(error, null);

    let parsed = JSON.parse(body);

    if (!parsed.success) {
      callback(Error(error), null);
      return;
    }
    
    const latitude = parsed.latitude;
    const longitude = parsed.longitude;
    callback(null, {latitude, longitude});
  });
};

//-----------------

const fetchISSFlyOverTimes = function(coords, callback) {
  request(`https://iss-flyover.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    if (error) return callback(error, null);
    if (response.statusCode !== 200) {
      callback(Error(error), null);
    }

    let parsed = JSON.parse(body);
    callback(null, parsed.response);
  });
};

//-----------------

const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(ip, (error, coordinates) => {
      if (error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(coordinates, (error, times) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, times);
      });
    });
  });
};
// module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes };
module.exports = nextISSTimesForMyLocation;