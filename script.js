
const form = document.getElementById("weather-form");
const cityInput = document.getElementById("city-input");
const statusText = document.getElementById("status");
const weatherResult = document.getElementById("weather-result");

const cityName = document.getElementById("city-name");
const description = document.getElementById("weather-description");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const updatedTime = document.getElementById("updated-time");

function getWeatherDescription(code) {
    const descriptions = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snowfall",
        73: "Moderate snowfall",
        75: "Heavy snowfall",
        80: "Rain showers",
        81: "Moderate rain showers",
        82: "Heavy rain showers",
        95: "Thunderstorm"
    };

    return descriptions[code] || "Weather conditions unavailable";
}

async function getWeather(city) {
    statusText.textContent = "Loading weather data...";
    weatherResult.hidden = true;

    try {
        // Step 1: Find the city coordinates.
        const geoUrl =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoUrl);

        if (!geoResponse.ok) {
            throw new Error("Unable to search for the city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Please check the name.");
        }

        const place = geoData.results[0];

        // Step 2: Fetch weather using latitude and longitude.
        const weatherUrl =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + place.latitude +
            "&longitude=" + place.longitude +
            "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
            "&timezone=auto";

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to retrieve weather data.");
        }

        const weatherData = await weatherResponse.json();

        // Step 3: Read the nested JSON object.
        const current = weatherData.current;

        if (!current) {
            throw new Error("Current weather data is unavailable.");
        }

        // Step 4: Display weather information.
        cityName.textContent =
            place.name +
            (place.admin1 ? ", " + place.admin1 : "") +
            (place.country ? ", " + place.country : "");

        description.textContent =
            getWeatherDescription(current.weather_code);

        temperature.textContent =
            current.temperature_2m + " °C";

        humidity.textContent =
            current.relative_humidity_2m + "%";

        windSpeed.textContent =
            current.wind_speed_10m + " km/h";

        updatedTime.textContent =
            "Weather time: " + current.time.replace("T", " ");

        weatherResult.hidden = false;
        statusText.textContent = "Weather loaded successfully.";

    } catch (error) {
        statusText.textContent =
            error.message ||
            "Network error. Please check your internet connection.";
    }
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (city) {
        getWeather(city);
    }
});
