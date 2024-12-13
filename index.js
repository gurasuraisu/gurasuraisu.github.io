
        const weatherConditions = {
            0: { description: 'Clear Sky', icon: '☀️' },
            1: { description: 'Mainly Clear', icon: '🌤️' },
            2: { description: 'Partly Cloudy', icon: '⛅' },
            3: { description: 'Overcast', icon: '☁️' },
            45: { description: 'Fog', icon: '🌫️' },
            48: { description: 'Depositing Rime Fog', icon: '🌫️' },
            51: { description: 'Light Drizzle', icon: '🌦️' },
            53: { description: 'Moderate Drizzle', icon: '🌦️' },
            55: { description: 'Dense Drizzle', icon: '🌧️' },
            56: { description: 'Light Freezing Drizzle', icon: '🌧️' },
            57: { description: 'Dense Freezing Drizzle', icon: '🌧️' },
            61: { description: 'Slight Rain', icon: '🌧️' },
            63: { description: 'Moderate Rain', icon: '🌧️' },
            65: { description: 'Heavy Rain', icon: '🌧️' },
            66: { description: 'Light Freezing Rain', icon: '🌧️' },
            67: { description: 'Heavy Freezing Rain', icon: '🌧️' },
            71: { description: 'Slight Snow', icon: '🌨️' },
            73: { description: 'Moderate Snow', icon: '❄️' },
            75: { description: 'Heavy Snow', icon: '❄️' },
            77: { description: 'Snow Grains', icon: '❄️' },
            80: { description: 'Slight Showers', icon: '🌦️' },
            81: { description: 'Moderate Showers', icon: '🌧️' },
            82: { description: 'Violent Showers', icon: '⛈️' },
            85: { description: 'Slight Snow Showers', icon: '🌨️' },
            86: { description: 'Heavy Snow Showers', icon: '❄️' },
            95: { description: 'Thunderstorm', icon: '⛈️' },
            96: { description: 'Thunderstorm with Hail', icon: '⛈️' },
            99: { description: 'Heavy Thunderstorm with Hail', icon: '🌩️' }
        };

        function updateClockAndDate() {
            const clockElement = document.getElementById('clock');
            const dateElement = document.getElementById('date');
            const now = new Date();
            
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;
            
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = now.toLocaleDateString(undefined, options);
        }

function updateTimezones() {
    const now = new Date();

    const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const tokyoTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
    const sydneyTime = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));

    document.getElementById('ny-time').textContent = `New York: ${String(nyTime.getHours()).padStart(2, '0')}:${String(nyTime.getMinutes()).padStart(2, '0')}:${String(nyTime.getSeconds()).padStart(2, '0')}`;
    document.getElementById('tokyo-time').textContent = `Tokyo: ${String(tokyoTime.getHours()).padStart(2, '0')}:${String(tokyoTime.getMinutes()).padStart(2, '0')}:${String(tokyoTime.getSeconds()).padStart(2, '0')}`;
    document.getElementById('sydney-time').textContent = `Sydney: ${String(sydneyTime.getHours()).padStart(2, '0')}:${String(sydneyTime.getMinutes()).padStart(2, '0')}:${String(sydneyTime.getSeconds()).padStart(2, '0')}`;
}

async function fetchLocationAndWeather() {
    return new Promise((resolve, reject) => {
        // Use browser's geolocation
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;

                // Attempt to get city name using reverse geocoding
                const geocodingUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
                let city = 'Unknown Location';
                try {
                    const geocodingResponse = await fetch(geocodingUrl);
                    const geocodingData = await geocodingResponse.json();
                    city = geocodingData.address.city || 
                           geocodingData.address.town || 
                           geocodingData.address.village || 
                           'Unknown Location';
                } catch (geocodingError) {
                    console.warn('Could not retrieve city name', geocodingError);
                }

                const currentWeatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
                const dailyForecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,weathercode&timezone=Europe/London`;
                const hourlyForecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&timezone=Europe/London`;

                const [currentResponse, dailyResponse, hourlyResponse] = await Promise.all([
                    fetch(currentWeatherUrl),
                    fetch(dailyForecastUrl),
                    fetch(hourlyForecastUrl)
                ]);

                const currentWeatherData = await currentResponse.json();
                const dailyForecastData = await dailyResponse.json();
                const hourlyForecastData = await hourlyResponse.json();

                resolve({
                    city,
                    current: currentWeatherData.current_weather,
                    dailyForecast: dailyForecastData.daily,
                    hourlyForecast: hourlyForecastData.hourly
                });
            } catch (error) {
                console.error('Error fetching weather data:', error);
                reject(error);
            }
        }, (error) => {
            console.error('Geolocation error:', error);
            reject(error);
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
}

        function getDayOfWeek(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { weekday: 'long' });
        }

        function getHourString(dateString) {
            const date = new Date(dateString);
            return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        }

        async function updateSmallWeather() {
            try {
                const weatherData = await fetchLocationAndWeather();
                if (!weatherData) throw new Error('Weather data not available');

                const temperatureElement = document.getElementById('temperature');
                const weatherIconElement = document.getElementById('weather-icon');
                const weatherInfo = weatherConditions[weatherData.current.weathercode] || { description: 'Unknown', icon: '❓' };
                
                document.getElementById('weather').style.display = 'block';
                temperatureElement.textContent = `${weatherData.current.temperature}°C`;
                weatherIconElement.textContent = weatherInfo.icon;
            } catch (error) {
                console.error('Error updating small weather widget:', error);
                document.getElementById('weather').style.display = 'none';
                showPopup('Could not retrieve weather information');
            }
        }

        async function displayDetailedWeather() {
            const weatherData = await fetchLocationAndWeather();
            if (!weatherData) {
                document.getElementById('detailedWeather').innerHTML = 'Failed to load weather data.';
                return;
            }

            const { city, current, dailyForecast, hourlyForecast } = weatherData;
            const currentWeather = weatherConditions[current.weathercode] || { description: 'Unknown', icon: '❓' };

            const currentTime = new Date();
            const nextDayMidnight = new Date(currentTime);
            nextDayMidnight.setHours(24, 0, 0, 0);

            const validHourlyForecast = hourlyForecast.time
                .map((time, index) => {
                    const forecastTime = new Date(time);
                    if (forecastTime > currentTime && forecastTime < nextDayMidnight) {
                        return {
                            time: time,
                            temperature: hourlyForecast.temperature_2m[index],
                            weatherCode: hourlyForecast.weathercode[index]
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            const hour = new Date().getHours();
            const isDaytime = hour >= 6 && hour <= 18;
            let backgroundColor = isDaytime ? '#2F4F4F' : '#0C0C0C';

            switch (current.weathercode) {
                case 0: backgroundColor = '#2C3539'; break; // Clear Sky
                case 1: backgroundColor = '#3E474D'; break; // Mainly Clear
                case 2: backgroundColor = '#4E5A61'; break; // Partly Cloudy
                case 3: backgroundColor = '#36454F'; break; // Overcast
                case 45: case 48: backgroundColor = '#556B2F'; break; // Fog
                case 51: case 53: case 55: backgroundColor = '#696969'; break; // Light Drizzle
                case 56: case 57: backgroundColor = '#5C5C5C'; break; // Light Freezing Drizzle
                case 61: case 63: case 65: backgroundColor = '#4F4F4F'; break; // Rain
                case 66: case 67: backgroundColor = '#4B4B4B'; break; // Freezing Rain
                case 71: case 73: case 75: backgroundColor = '#E0E0E0'; break; // Snow
                case 77: backgroundColor = '#E8E8E8'; break; // Snow Grains
                case 80: case 81: case 82: backgroundColor = '#606060'; break; // Showers
                case 85: case 86: backgroundColor = '#A9A9A9'; break; // Snow Showers
                case 95: backgroundColor = '#B8860B'; break; // Thunderstorm
                case 96: case 99: backgroundColor = '#B5651D'; break; // Thunderstorm with Hail
                default: backgroundColor = '#2F4F4F'; break; // Default
            }

            document.getElementById('detailedWeather').style.backgroundColor = backgroundColor;
            
            document.getElementById('detailedWeather').innerHTML = `
                <h2>${current.temperature}°C</h2>
                <p class="location-text">${city}</p>
                <span class="weather-icon">${currentWeather.icon}</span>
                <p>${currentWeather.description}</p>
                <p class="additional-info">Wind Speed: ${current.windspeed} km/h</p>
                <div class="hourly-forecast">
                    ${validHourlyForecast.map((hour, index) => {
                        const hourClass = index === 0 ? 'hour first' : 
                                        index === validHourlyForecast.length - 1 ? 'hour last' : 'hour';
                        const hourString = getHourString(hour.time);
                        const hourWeather = weatherConditions[hour.weatherCode] || { description: 'Unknown', icon: '❓' };

                        return `
                            <div class="${hourClass}">
                                <span>${hourString}</span>
                                <span>${hour.temperature}°C</span>
                                <span>${hourWeather.icon}</span>
                                <span>${hourWeather.description}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="forecast-container">
                    ${dailyForecast.time.slice(1, 6).map((date, index) => {
                        const dayName = getDayOfWeek(date);
                        const weatherCode = dailyForecast.weathercode[index + 1];
                        const maxTemp = dailyForecast.temperature_2m_max[index + 1];
                        const forecastWeather = weatherConditions[weatherCode] || { description: 'Unknown', icon: '❓' };

                        return `
                            <div class="forecast-day">
                                <p class="day-name">${dayName}</p>
                                <p class="forecast-icon">${forecastWeather.icon}</p>
                                <p>${maxTemp}°C</p>
                                <p>${forecastWeather.description}</p>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        const clockElement = document.getElementById('clock');
        const weatherWidget = document.getElementById('weather');
        const timezoneModal = document.getElementById('timezoneModal');
        const weatherModal = document.getElementById('weatherModal');
        const closeModal = document.getElementById('closeModal');
        const closeWeatherModal = document.getElementById('closeWeatherModal');
        const blurOverlay = document.getElementById('blurOverlay');

        clockElement.addEventListener('click', () => {
            timezoneModal.style.display = 'block';
            blurOverlay.style.display = 'block';
            setTimeout(() => {
                timezoneModal.classList.add('show');
                blurOverlay.classList.add('show');
            }, 10);
        });

        weatherWidget.addEventListener('click', () => {
            weatherModal.style.display = 'block';
            blurOverlay.style.display = 'block';
            setTimeout(() => {
                weatherModal.classList.add('show');
                blurOverlay.classList.add('show');
            }, 10);
            displayDetailedWeather();
        });

        closeModal.addEventListener('click', () => {
            timezoneModal.classList.remove('show');
            blurOverlay.classList.remove('show');
            setTimeout(() => {
                timezoneModal.style.display = 'none';
                blurOverlay.style.display = 'none';
            }, 300);
        });

        closeWeatherModal.addEventListener('click', () => {
            weatherModal.classList.remove('show');
            blurOverlay.classList.remove('show');
            setTimeout(() => {
                weatherModal.style.display = 'none';
                blurOverlay.style.display = 'none';
            }, 300);
        });

        setInterval(updateClockAndDate, 1000);
        setInterval(updateTimezones, 1000);
        updateClockAndDate();
        updateTimezones();
        updateSmallWeather();

    function showPopup(message) {
        const popup = document.createElement('div');
        popup.style.position = 'fixed';
        popup.style.top = '20px';
        popup.style.left = '50%';
        popup.style.transform = 'translateX(-50%)';
        popup.style.backgroundColor = 'rgba(51, 51, 51, 0.6)';
        popup.style.color = 'white';
        popup.style.padding = '20px';
        popup.style.borderRadius = '30px';
        popup.style.zIndex = '1000';
        popup.style.transition = 'opacity 0.5s';
        popup.style.textAlign = 'center'
        popup.innerHTML = `<div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: inherit;
            filter: blur(10px);
            z-index: -1;
            border-radius: 30px;"></div>${message}`; /* Blur the background only */
        
        document.body.appendChild(popup);

        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(popup);
            }, 500);
        }, 3000);
    }

        setInterval(() => {
            if (weatherModal.classList.contains('show')) {
                displayDetailedWeather();
            }
        }, 60000);

        function goFullscreen() {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) { // Firefox
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) { // IE/Edge
                element.msRequestFullscreen();
            }
        }
        
        function checkDeviceCompatibility() {
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            if (!isTouchDevice) {
                showPopup('For optimal experience, use a touchscreen device');
            }
        }

        const searchInput = document.getElementById('search-input');
        const searchIcon = document.getElementById('search-icon');
        const autocompleteSuggestions = document.getElementById('autocomplete-suggestions');

        const appLinks = {
            "youtube": "https://youtube.com",
            "yt": "https://youtube.com",
            "drive": "https://drive.google.com",
            "calendar": "https://calendar.google.com",
            "cal": "https://calendar.google.com",
            "docs": "https://docs.google.com",
            "photos": "https://photos.google.com",
            "notes": "https://keep.google.com",
            "keep": "https://keep.google.com",
            "calculator": "https://calculator.apps.chrome",
            "music": "https://music.apple.com",
            "notion": "https://notion.so",
            "find my": "https://www.icloud.com/find",
        };

            // Fuzzy search function to find the best match for app names
    function fuzzySearch(query, appList) {
        const threshold = 0.5;
        let bestMatch = null;
        let highestScore = 0;

        function similarity(s1, s2) {
            let longer = s1;
            let shorter = s2;
            if (s1.length < s2.length) {
                longer = s2;
                shorter = s1;
            }
            const longerLength = longer.length;
            if (longerLength === 0) return 1.0;
            const editDistance = getEditDistance(longer, shorter);
            return (longerLength - editDistance) / parseFloat(longerLength);
        }

        function getEditDistance(s1, s2) {
            const costs = [];
            for (let i = 0; i <= s1.length; i++) {
                let lastValue = i;
                for (let j = 0; j <= s2.length; j++) {
                    if (i === 0) costs[j] = j;
                    else {
                        if (j > 0) {
                            let newValue = costs[j - 1];
                            if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                                newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                            }
                            costs[j - 1] = lastValue;
                            lastValue = newValue;
                        }
                    }
                }
                if (i > 0) costs[s2.length] = lastValue;
            }
            return costs[s2.length];
        }

        Object.keys(appList).forEach(app => {
            const score = similarity(query.toLowerCase(), app.toLowerCase());
            if (score > highestScore && score >= threshold) {
                highestScore = score;
                bestMatch = app;
            }
        });

        return bestMatch;
    }

                function updateSearchIcon(query) {
            const firstWord = query.split(' ')[0].toLowerCase();
            if (firstWord === "how" || firstWord === "help" || firstWord === "ai" || firstWord === "why") {
                searchIcon.textContent = 'forum';
            } else {
                searchIcon.textContent = 'search';
            }
        }

        function handleAppRedirect(query) {
            const bestMatch = fuzzySearch(query, appLinks);
            if (bestMatch) {
                const appLink = appLinks[bestMatch];
                window.open(appLink, '_blank');
                return true;
            }
            return false;
        }

        function showAutocomplete(query) {
            autocompleteSuggestions.innerHTML = '';

            if (query.length > 0) {
                const matchedApps = Object.keys(appLinks).filter(app => app.toLowerCase().startsWith(query.toLowerCase()));
                matchedApps.forEach(app => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('autocomplete-suggestion');
                    suggestionItem.textContent = app;
                    suggestionItem.addEventListener('click', () => {
                        searchInput.value = app;
                        autocompleteSuggestions.innerHTML = '';
                    });
                    autocompleteSuggestions.appendChild(suggestionItem);
                });
            }
        }

        searchInput.addEventListener('input', (event) => {
            const query = searchInput.value.trim();
            updateSearchIcon(query);
            showAutocomplete(query);
        });

        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const query = searchInput.value.trim();
                updateSearchIcon(query);
                if (handleAppRedirect(query)) {
                    return;
                }
                const firstWord = query.split(' ')[0].toLowerCase();
                if (firstWord === "how" || firstWord === "help" || firstWord === "ai" || firstWord === "why") {
                    const bingUrl = `https://www.bing.com/search?showconv=1&sendquery=1&q=${encodeURIComponent(query)}`;
                    window.open(bingUrl, '_blank');
                } else if (query) {
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
                }
            }
        });

const customizeButton = document.getElementById('customize');
const wallpaperInput = document.getElementById('wallpaperInput');

function saveWallpaper(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageDataUrl = event.target.result;
        localStorage.setItem('customWallpaper', imageDataUrl);
        applyWallpaper();
    };
    reader.readAsDataURL(file);
}

function applyWallpaper() {
    const savedWallpaper = localStorage.getItem('customWallpaper');
    if (savedWallpaper) {
        document.body.style.backgroundImage = `url('${savedWallpaper}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
    }
}

customizeButton.addEventListener('click', () => {
    wallpaperInput.click();
});

wallpaperInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'image/png') {
        saveWallpaper(file);
    } else {
        showPopup('Please upload a PNG image');
    }
});        
        checkDeviceCompatibility();
        goFullscreen();
        applyWallpaper();
    