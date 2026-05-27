// weather-icons.js

window.WEATHER_ICON_MAP = {
  // =========================
  // 2xx Thunderstorm
  // https://openweathermap.org/weather-conditions#Thunderstorm
  // =========================

  // thunderstorm with light rain
  200: {
    day: "thunderstorms-day-rain",
    night: "thunderstorms-night-rain",
  },

  // thunderstorm with rain
  201: {
    day: "thunderstorms-overcast-day-rain",
    night: "thunderstorms-overcast-night-rain",
  },

  // thunderstorm with heavy rain
  202: {
    day: "thunderstorms-extreme-day-rain",
    night: "thunderstorms-extreme-night-rain",
  },

  // light thunderstorm
  210: {
    day: "thunderstorms-day",
    night: "thunderstorms-night",
  },

  // thunderstorm
  211: {
    day: "thunderstorms-overcast-day",
    night: "thunderstorms-overcast-night",
  },

  // heavy thunderstorm
  212: {
    day: "thunderstorms-extreme-day",
    night: "thunderstorms-extreme-night",
  },

  // ragged thunderstorm
  221: {
    day: "thunderstorms-extreme-day",
    night: "thunderstorms-extreme-night",
  },

  // thunderstorm with light drizzle
  230: {
    day: "thunderstorms-day-rain",
    night: "thunderstorms-night-rain",
  },

  // thunderstorm with drizzle
  231: {
    day: "thunderstorms-overcast-day-rain",
    night: "thunderstorms-overcast-night-rain",
  },

  // thunderstorm with heavy drizzle
  232: {
    day: "thunderstorms-extreme-day-rain",
    night: "thunderstorms-extreme-night-rain",
  },

  // =========================
  // 3xx Drizzle
  // https://openweathermap.org/weather-conditions#Drizzle
  // =========================

  // light intensity drizzle
  300: {
    day: "partly-cloudy-day-drizzle",
    night: "partly-cloudy-night-drizzle",
  },

  // drizzle
  301: {
    day: "overcast-day-drizzle",
    night: "overcast-night-drizzle",
  },

  // heavy intensity drizzle
  302: {
    day: "extreme-day-drizzle",
    night: "extreme-night-drizzle",
  },

  // light intensity drizzle rain
  310: {
    day: "partly-cloudy-day-drizzle",
    night: "partly-cloudy-night-drizzle",
  },

  // drizzle rain
  311: {
    day: "overcast-day-drizzle",
    night: "overcast-night-drizzle",
  },

  // heavy intensity drizzle rain
  312: {
    day: "extreme-day-drizzle",
    night: "extreme-night-drizzle",
  },

  // shower rain and drizzle
  313: {
    day: "overcast-day-rain",
    night: "overcast-night-rain",
  },

  // heavy shower rain and drizzle
  314: {
    day: "extreme-day-rain",
    night: "extreme-night-rain",
  },

  // shower drizzle
  321: {
    day: "overcast-day-drizzle",
    night: "overcast-night-drizzle",
  },

  // =========================
  // 5xx Rain
  // https://openweathermap.org/weather-conditions#Rain
  // =========================

  // light rain
  500: {
    day: "partly-cloudy-day-rain",
    night: "partly-cloudy-night-rain",
  },

  // moderate rain
  501: {
    day: "overcast-day-rain",
    night: "overcast-night-rain",
  },

  // heavy intensity rain
  502: {
    day: "extreme-day-rain",
    night: "extreme-night-rain",
  },

  // very heavy rain
  503: {
    day: "extreme-day-rain",
    night: "extreme-night-rain",
  },

  // extreme rain
  504: {
    day: "extreme-day-rain",
    night: "extreme-night-rain",
  },

  // freezing rain
  511: {
    day: "overcast-day-sleet",
    night: "overcast-night-sleet",
  },

  // light intensity shower rain
  520: {
    day: "partly-cloudy-day-rain",
    night: "partly-cloudy-night-rain",
  },

  // shower rain
  521: {
    day: "overcast-day-rain",
    night: "overcast-night-rain",
  },

  // heavy intensity shower rain
  522: {
    day: "extreme-day-rain",
    night: "extreme-night-rain",
  },

  // ragged shower rain
  531: {
    day: "extreme-day-rain",
    night: "extreme-night-rain",
  },

  // =========================
  // 6xx Snow
  // https://openweathermap.org/weather-conditions#Snow
  // =========================

  // light snow
  600: {
    day: "partly-cloudy-day-snow",
    night: "partly-cloudy-night-snow",
  },

  // snow
  601: {
    day: "overcast-day-snow",
    night: "overcast-night-snow",
  },

  // heavy snow
  602: {
    day: "extreme-day-snow",
    night: "extreme-night-snow",
  },

  // sleet
  611: {
    day: "partly-cloudy-day-sleet",
    night: "partly-cloudy-night-sleet",
  },

  // light shower sleet
  612: {
    day: "partly-cloudy-day-sleet",
    night: "partly-cloudy-night-sleet",
  },

  // shower sleet
  613: {
    day: "overcast-day-sleet",
    night: "overcast-night-sleet",
  },

  // light rain and snow
  615: {
    day: "overcast-day-sleet",
    night: "overcast-night-sleet",
  },

  // rain and snow
  616: {
    day: "extreme-day-sleet",
    night: "extreme-night-sleet",
  },

  // light shower snow
  620: {
    day: "partly-cloudy-day-snow",
    night: "partly-cloudy-night-snow",
  },

  // shower snow
  621: {
    day: "overcast-day-snow",
    night: "overcast-night-snow",
  },

  // heavy shower snow
  622: {
    day: "extreme-day-snow",
    night: "extreme-night-snow",
  },

  // =========================
  // 7xx Atmosphere
  // https://openweathermap.org/weather-conditions#Atmosphere
  // =========================

  // mist
  701: {
    day: "mist",
    night: "mist",
  },

  // smoke
  711: {
    day: "smoke",
    night: "smoke",
  },

  // haze
  721: {
    day: "haze-day",
    night: "haze-night",
  },

  // sand/dust whirls
  731: {
    day: "dust-day",
    night: "dust-night",
  },

  // fog
  741: {
    day: "fog-day",
    night: "fog-night",
  },

  // sand
  751: {
    day: "dust-day",
    night: "dust-night",
  },

  // dust
  761: {
    day: "dust-day",
    night: "dust-night",
  },

  // volcanic ash
  762: {
    day: "smoke-particles",
    night: "smoke-particles",
  },

  // squalls
  771: {
    day: "strong-wind",
    night: "strong-wind",
  },

  // tornado
  781: {
    day: "tornado",
    night: "tornado",
  },

  // =========================
  // 800 Clear
  // =========================

  // clear sky
  800: {
    day: "clear-day",
    night: "clear-night",
  },

  // =========================
  // 80x Clouds
  // https://openweathermap.org/weather-conditions#Clouds
  // =========================

  // few clouds: 11-25%
  801: {
    day: "partly-cloudy-day",
    night: "partly-cloudy-night",
  },

  // scattered clouds: 25-50%
  802: {
    day: "partly-cloudy-day",
    night: "partly-cloudy-night",
  },

  // broken clouds: 51-84%
  803: {
    day: "overcast-day",
    night: "overcast-night",
  },

  // overcast clouds: 85-100%
  804: {
    day: "overcast",
    night: "overcast",
  },
};
