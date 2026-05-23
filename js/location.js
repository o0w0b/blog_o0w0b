// location.js

// 获取用户位置（优先 GPS，其次 IP）
async function getLocationSmart() {
    let lat = null;
    let lon = null;

    // GPS定位
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 20000
            });
        });

        lat = pos.coords.latitude;
        lon = pos.coords.longitude;

    } catch (e) {
        console.warn("GPS失败，切换IP定位", e);
    }

    let addr = {};
    let geoData = {};

    // GPS逆地理解析
    if (lat !== null && lon !== null) {
        try {
            const geoRes = await fetch(
                `https://loc-api.o0w0b.top/?lat=${lat}&lon=${lon}`
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
        const ipRes = await fetch(
            "https://ip-api.o0w0b.top/?lang=zh-CN"
        );

        ipData = await ipRes.json();

    } catch (e) {
        console.warn("IP定位失败", e);
    }

    // 返回统一数据结构
    return {
        source: lat ? "gps" : "ip",
        ip: ipData?.ip || "未知",
        data: {
            country: addr.country || ipData?.country || "未知",
            prov: addr.state || addr.province || addr.region || ipData?.region || "未知",
            city: addr.city || addr.town || addr.village || addr.region || ipData?.city || "未知",
            district: addr.district || addr.borough || addr.state_district || addr.city_district || addr.county || addr.suburb || "",
            lat: geoData.lat || ipData?.latitude || "未知",
            lon: geoData.lon || ipData?.longitude || "未知"
        }
    };
}

// 挂到全局
window.getLocationSmart = getLocationSmart;