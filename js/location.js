// location.js

// =========================
// 定位缓存
// =========================

// 已完成的定位结果缓存
// 第一次定位成功后会存到这里
// 后续直接返回，不再重复请求GPS/IP
let locationCache = null;

// 正在进行中的定位 Promise
// 用来防止多个组件同时请求定位
// 例如 weather 和 welcome 同时调用 getLocationSmart()
let locationPromise = null;

// 获取用户位置（优先 GPS，其次 IP）
async function getLocationSmart() {
  // =========================
  // 如果已有定位缓存
  // =========================

  // 说明之前已经成功定位过
  // 直接返回缓存结果
  // 不再重新请求 GPS
  if (locationCache) {
    return locationCache;
  }

  // =========================
  // 如果正在定位
  // =========================

  // 说明已经有别的地方在请求定位了
  // 比如：
  // weather 正在定位
  // welcome 又调用了 getLocationSmart()
  //
  // 此时直接复用同一个 Promise
  // 避免多个 geolocation 同时运行
  if (locationPromise) {
    return locationPromise;
  }

  // =========================
  // 开始真正定位
  // =========================

  // 这里只会执行一次
  // 后续调用都会走上面的缓存或 Promise 复用
  locationPromise = (async () => {
    let lat = null;
    let lon = null;

    // GPS定位
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 20000,
        });
      });

      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
    } catch (e) {
      console.info("GPS失败，切换IP定位", e);
    }

    let addr = {};
    let geoData = {};

    // GPS逆地理解析
    if (lat !== null && lon !== null) {
      try {
        const geoRes = await fetch(
          `https://loc-api.o0w0b.top/?lat=${lat}&lon=${lon}`,
        );

        geoData = await geoRes.json();

        addr = geoData.address || {};
      } catch (e) {
        console.warn("逆地理解析失败", e);
      }
    }

    // IP定位
    let ipData = null;

    try {
      const ipRes = await fetch("https://ip-api.o0w0b.top/?lang=zh-CN");

      ipData = await ipRes.json();
    } catch (e) {
      console.warn("IP定位失败", e);
    }

    // 返回统一数据结构
    const result = {
      source: lat ? "gps" : "ip",

      ip: ipData?.ip || "未知",

      data: {
        country: addr.country || ipData?.country || "未知",

        prov:
          addr.state ||
          addr.province ||
          addr.region ||
          ipData?.region ||
          "未知",

        city:
          addr.city ||
          addr.town ||
          addr.village ||
          addr.region ||
          ipData?.city ||
          "未知",

        district:
          addr.district ||
          addr.borough ||
          addr.state_district ||
          addr.city_district ||
          addr.county ||
          addr.suburb ||
          "",

        lat: geoData.lat || ipData?.latitude || "未知",

        lon: geoData.lon || ipData?.longitude || "未知",
      },
    };

    // =========================
    // 写入缓存
    // =========================

    // 后续所有调用直接返回这里的数据
    // 不再重复请求定位
    locationCache = result;

    return result;
  })();

  // 返回当前正在进行中的 Promise
  return locationPromise;
}

// 挂到全局
window.getLocationSmart = getLocationSmart;
