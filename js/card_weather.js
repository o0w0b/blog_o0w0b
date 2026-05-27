// card_weather.js
(() => {
  let hourlyPage = 0;

  let ITEMS_NUM = 8; // 小时预报总数量，实际显示数量由ITEMS_PER_PAGE控制
  let ITEMS_PER_PAGE = 4; // 每页显示的小时预报最大数量，实际显示数量根据窗口宽度动态计算
  const DAILY_DAYS = 6; // 每日预报的最大天数，包含当天

  let hourlyData = [];
  let timezoneOffset = 0;

  // =========================
  // Meteocons icon
  // =========================

  function getWeatherIcon(weatherId, iconCode, description = "") {
    const entry = window.WEATHER_ICON_MAP[String(weatherId)];

    if (!entry) {
      return "";
    }

    const isNight = iconCode.endsWith("n");

    const iconName = isNight ? entry.night : entry.day;

    return `
        <img
            src="https://cdn.meteocons.com/3.0.0-next.10/svg/fill/${iconName}.svg"
            alt="${description}"
            title="${description}"
            class="ow-icon"
            loading="lazy"
        />
    `;
  }

  // =========================
  // 天气严重程度评分（0-100）
  // =========================

  function getWeatherSeverity(id) {
    if (id >= 900 && id <= 906) return 100;
    if (id === 781) return 95;
    if (id === 771) return 90;
    if (id === 762) return 88;
    if (id === 602) return 85;
    if (id === 504) return 80;
    if (id === 503) return 78;
    if (id === 502 || id === 622) return 75;
    if (id === 511) return 70;
    if (id === 501) return 65;
    if (id === 621) return 60;
    if (id === 500) return 55;
    if (id >= 520 && id <= 531) return 50;
    if (id >= 300 && id <= 321) return 40;
    if (id >= 200 && id <= 232) return 35;
    if (id === 600 || id === 601) return 30;
    if (id >= 701 && id <= 761) return 25;
    if (id === 804) return 15;
    if (id === 803) return 12;
    if (id === 802) return 10;
    if (id === 801) return 8;
    if (id === 800) return 5;
    return 0;
  }

  // =========================
  // 时间格式化
  // =========================

  function formatHour(dt, tz = 0) {
    const d = new Date((dt + tz) * 1000);

    return `${String(d.getUTCHours()).padStart(2, "0")}:00`;
  }

  function formatDate(dt, tz = 0) {
    const d = new Date((dt + tz) * 1000);

    const weekdays = [
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ];

    return {
      date: `${d.getUTCMonth() + 1}月${d.getUTCDate()}日`,
      week: weekdays[d.getUTCDay()],
    };
  }

  // =========================
  // hourly render
  // =========================

  function updateHourlyItemsPerPage() {
    const hourlyCol = document.querySelector(".hourly-col");

    if (!hourlyCol) return;

    // 每个hour-item实际占用宽度
    const itemWidth = 46;

    ITEMS_PER_PAGE = Math.max(1, Math.floor(hourlyCol.clientWidth / itemWidth));
  }

  function renderHourly() {
    const track = document.getElementById("hourlyTrack");

    if (!track) return;

    const visible = hourlyData.slice(hourlyPage, hourlyPage + ITEMS_PER_PAGE);

    track.innerHTML = visible
      .map(
        (item) => `
        <div class="hour-item">

            <div class="hour-time">
                ${formatHour(item.dt, timezoneOffset)}
            </div>

            <div class="hour-icon">
                ${getWeatherIcon(item.weather[0].id, item.weather[0].icon, `${item.weather[0].description}、${Math.round(item.pop * 100)}%`)}
            </div>

            <div class="hour-temp">
                ${Math.round(item.main.temp)}°C
            </div>

        </div>
    `,
      )
      .join("");

    const prevArrow = document.getElementById("prevArrow");

    const nextArrow = document.getElementById("nextArrow");

    if (prevArrow) {
      prevArrow.disabled = hourlyPage === 0;
    }

    if (nextArrow) {
      nextArrow.disabled = hourlyPage >= hourlyData.length - ITEMS_PER_PAGE;
    }
  }

  function nextHourly() {
    if (hourlyPage < hourlyData.length - ITEMS_PER_PAGE) {
      hourlyPage++;

      renderHourly();
    }
  }

  function prevHourly() {
    if (hourlyPage > 0) {
      hourlyPage--;

      renderHourly();
    }
  }

  // =========================
  // 加载天气
  // =========================

  async function loadWeather(location) {
    const weather_widget = document.getElementById("weather_widget");

    if (!weather_widget) return;

    try {
      const lat = location.data.lat;

      const lon = location.data.lon;

      const [currentRes, forecastRes] = await Promise.all([
        fetch(
          `https://weather-api.o0w0b.top/weather?lat=${lat}&lon=${lon}&units=metric&lang=zh_cn`,
        ),

        fetch(
          `https://weather-api.o0w0b.top/forecast?lat=${lat}&lon=${lon}&units=metric&lang=zh_cn`,
        ),
      ]);

      const current = await currentRes.json();

      const forecast = await forecastRes.json();

      // =========================
      // API错误处理
      // =========================

      if (!current.main) {
        throw new Error(current.message || "当前天气获取失败");
      }

      if (!forecast.list) {
        throw new Error(forecast.message || "天气预报获取失败");
      }

      // =========================
      // hourly
      // =========================

      hourlyData = forecast.list.slice(0, ITEMS_NUM);

      // =========================
      // daily
      // =========================

      const dailyMap = new Map();

      timezoneOffset = forecast.city.timezone;

      forecast.list.forEach((item) => {
        const localDt = (item.dt + timezoneOffset) * 1000;
        const d = new Date(localDt);
        const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

        if (!dailyMap.has(key)) {
          dailyMap.set(key, {
            dt: item.dt,
            temps: [],
            weatherList: [],
          });
        }

        const day = dailyMap.get(key);
        day.temps.push(item.main.temp);
        day.weatherList.push({
          id: item.weather[0].id,
          icon: item.weather[0].icon,
          pop: item.pop,
          description: item.weather[0].description,
          hour: d.getUTCHours(),
        });
      });

      const daily = Array.from(dailyMap.values())
        .slice(0, DAILY_DAYS)
        .filter((day) => day.temps.length >= 1)
        .map((day) => {
          const worstWeather = day.weatherList.reduce((worst, current) => {
            return getWeatherSeverity(current.id) > getWeatherSeverity(worst.id)
              ? current
              : worst;
          });

          // 修正白天黑夜图标
          let icon = worstWeather.icon;
          const isActuallyNight =
            worstWeather.hour < 6 || worstWeather.hour >= 18;
          if (isActuallyNight && icon.endsWith("d")) {
            icon = icon.slice(0, -1) + "n";
          } else if (!isActuallyNight && icon.endsWith("n")) {
            icon = icon.slice(0, -1) + "d";
          }

          // 时段范围处理
          const startHourNum = worstWeather.hour;
          const endHourNum = startHourNum + 3;
          const startHour = String(startHourNum).padStart(2, "0") + ":00";
          const endHour =
            endHourNum >= 24
              ? String(endHourNum - 24).padStart(2, "0") + ":00"
              : String(endHourNum).padStart(2, "0") + ":00";
          const worstTime =
            endHourNum >= 24
              ? `${startHour}~${endHour}(次日)`
              : `${startHour}~${endHour}`;

          return {
            dt: day.dt,
            temps: day.temps,
            id: worstWeather.id,
            icon: icon,
            worstWeatherTime: worstTime,
            pop: Math.round(worstWeather.pop * 100),
            description: worstWeather.description,
          };
        });

      // =========================
      // render
      // =========================

      weather_widget.innerHTML = `

            <div class="main-row">

                <div class="weather-left">

                    <div class="location">

                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="12" viewBox="0 0 10 12" style="transform: scale(1.08);filter: drop-shadow(0 0 .35px currentColor);">
                            <path fill-rule="nonzero" d="M9 5c0-2.265-1.757-4-4-4-2.243 0-4 1.735-4 4 0 1.16 1.32 3.094 4 5.636C7.68 8.094 9 6.16 9 5zm-4 7C1.667 8.967 0 6.634 0 5c0-2.851 2.239-5 5-5s5 2.149 5 5c0 1.634-1.667 3.967-5 7zm0-6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"></path>
                        </svg>

                        <span>
                            ${location.data.city}
                        </span>

                    </div>

                    <div class="temp-big">
                        ${Math.round(current.main.temp)}°C
                    </div>

                </div>

                <div class="weather-right">

                    <div class="weather-icon-large">
                        ${getWeatherIcon(current.weather[0].id, current.weather[0].icon, current.weather[0].description)}
                    </div>

                    <div class="weather-desc">
                        ${current.weather[0].description}
                    </div>

                </div>

            </div>

            <div class="detail-hourly-row">

                        <div class="details-col">

                            <div title="风" class="detail-item">

                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 14 12" style="transform: scale(1.08);filter: drop-shadow(0 0 .35px currentColor);">
                                    <path d="M5.919 1.53a.615.615 0 0 1 .77-.108.68.68 0 0 1 .296.752.642.642 0 0 1-.617.493H.636c-.351 0-.636.298-.636.666C0 3.702.285 4 .636 4h5.729c.863.004 1.623-.603 1.849-1.479.225-.875-.14-1.8-.89-2.254A1.845 1.845 0 0 0 5.016.59a.69.69 0 0 0 .003.943c.249.26.652.258.9-.003zm1.006 9.88c.61.643 1.558.776 2.308.323.75-.453 1.116-1.379.89-2.254C9.897 8.603 9.138 7.996 8.272 8H.636C.285 8 0 8.298 0 8.667c0 .368.285.666.636.666h7.638a.643.643 0 0 1 .62.493.68.68 0 0 1-.296.752.615.615 0 0 1-.77-.108.616.616 0 0 0-.9-.003.69.69 0 0 0-.003.943zm4.173-7.785a.923.923 0 0 1 1.152-.158c.374.227.556.688.444 1.124a.963.963 0 0 1-.92.742H.636C.285 5.333 0 5.632 0 6c0 .368.285.667.636.667h11.139c1.009-.002 1.89-.712 2.15-1.731.26-1.02-.166-2.095-1.039-2.623a2.153 2.153 0 0 0-2.687.368.69.69 0 0 0-.001.943c.248.26.651.261.9.001z"></path>
                                </svg>

                                <span>
                                    ${current.wind.speed.toFixed(1)}
                                    米/秒
                                </span>

                            </div>

                            <div title="气压" class="detail-item">

                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" style="transform: scale(1.08);filter: drop-shadow(0 0 .35px currentColor);">
                                    <path d="M9.193 5.707a2.545 2.545 0 1 1-.9-.9l1.252-1.252a.636.636 0 1 1 .9.9L9.193 5.707zm-2.83 6.985v-.601a.636.636 0 0 1 1.273 0v.601a5.73 5.73 0 0 0 5.056-5.056h-.601a.636.636 0 0 1 0-1.272h.601a5.73 5.73 0 0 0-5.056-5.056v.601a.636.636 0 0 1-1.272 0v-.601a5.73 5.73 0 0 0-5.056 5.056h.601a.636.636 0 0 1 0 1.272h-.601a5.73 5.73 0 0 0 5.056 5.056zM7 14A7 7 0 1 1 7 0a7 7 0 0 1 0 14zm0-5.727a1.273 1.273 0 1 0 0-2.546 1.273 1.273 0 0 0 0 2.546z"></path>
                                </svg>

                                <span>
                                    ${current.main.pressure}
                                    百帕
                                </span>

                            </div>

                            <div  title="湿度" class="detail-item">

                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" style="transform: scale(1.08);filter: drop-shadow(0 0 .35px currentColor);">
                                    <path d="M2.701 4.838a4.547 4.547 0 0 0-1.013 5.01c.723 1.718 2.424 2.839 4.312 2.839 1.888 0 3.59-1.12 4.312-2.839a4.547 4.547 0 0 0-1.013-5.01L5.997 1.586 2.701 4.838zM6.468.192l3.773 3.717a5.846 5.846 0 0 1 1.302 6.442C10.615 12.56 8.427 14 6 14S1.385 12.56.457 10.35a5.846 5.846 0 0 1 1.301-6.44L5.525.193a.674.674 0 0 1 .943 0z"></path>
                                </svg>

                                <span>
                                    ${current.main.humidity} %
                                </span>

                            </div>

                        </div>

                <div class="hourly-wrapper">

                    <button
                        class="hour-arrow"
                        id="prevArrow">

                        ‹

                    </button>

                    <div class="hourly-col">

                        <div
                            class="hourly-track"
                            id="hourlyTrack">

                        </div>

                    </div>

                    <button
                        class="hour-arrow"
                        id="nextArrow">

                        ›

                    </button>

                </div>

            </div>

            <div class="daily-section">

                ${daily
                  .map((day, index) => {
                    const f = formatDate(day.dt, timezoneOffset);

                    const max = Math.round(Math.max(...day.temps));

                    const min = Math.round(Math.min(...day.temps));

                    return `
                        <div class="daily-item">

                            <div class="daily-left">

                                <div class="daily-date">
                                    ${f.date}
                                </div>

                                <div class="daily-week">
                                    ${(() => {
                                      // 当前本地日期
                                      const now = new Date(
                                        Date.now() + timezoneOffset * 1000,
                                      );

                                      // 明天
                                      const tomorrow = new Date(now);
                                      tomorrow.setUTCDate(
                                        tomorrow.getUTCDate() + 1,
                                      );

                                      const tomorrowText = `${tomorrow.getUTCMonth() + 1}月${tomorrow.getUTCDate()}日`;

                                      // 第一项如果是明天
                                      if (
                                        index === 0 &&
                                        f.date === tomorrowText
                                      ) {
                                        return "明天";
                                      }

                                      // 第一项否则默认今天
                                      if (index === 0) {
                                        return "今天";
                                      }

                                      return f.week;
                                    })()}
                                </div>

                            </div>

                            <div class="daily-icon">
                                ${getWeatherIcon(day.id, day.icon, `${day.description} - ${day.worstWeatherTime}、${day.pop}%`)}
                            </div>

                            <div class="daily-temps">

                                <div class="temp-max">
                                    ${max}°C
                                </div>

                                <div class="temp-min">
                                    ${min}°C
                                </div>

                            </div>

                        </div>
                    `;
                  })
                  .join("")}

            </div>
        `;

      // =========================
      // bind
      // =========================

      const prevArrow = document.getElementById("prevArrow");

      const nextArrow = document.getElementById("nextArrow");

      if (prevArrow) {
        prevArrow.addEventListener("click", prevHourly);
      }

      if (nextArrow) {
        nextArrow.addEventListener("click", nextHourly);
      }

      updateHourlyItemsPerPage();

      renderHourly();
    } catch (err) {
      weather_widget.innerHTML = `
            <div class="error">
                获取天气失败：${err.message}
            </div>
        `;

      console.error(err);
    }
  }

  // =========================
  // 初始化
  // =========================

  function initWeather() {
    getLocationSmart()
      .then((location) => {
        loadWeather(location);
      })
      .catch((err) => {
        weather_widget.innerHTML = `
                <div class="error">
                    定位失败：${err.message}
                </div>
            `;

        console.error(err);
      });
  }

  // =========================
  // 首次加载
  // =========================

  document.addEventListener("DOMContentLoaded", initWeather);

  // =========================
  // PJAX
  // =========================

  document.addEventListener("pjax:complete", initWeather);

  let lastWidth = window.innerWidth;

  window.addEventListener("resize", () => {
    const currentWidth = window.innerWidth;
    if (currentWidth === lastWidth) return; // 宽度没变，不处理
    lastWidth = currentWidth;

    updateHourlyItemsPerPage();
    renderHourly();
  });
})();
