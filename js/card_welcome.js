// 获取用户位置（优先 GPS，其次 IP）
async function getLocationSmart() {
    let lat = null;
    let lon = null;

    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        lat = pos.coords.latitude;
        lon = pos.coords.longitude;

    } catch (e) {
        console.warn("GPS失败，切换IP定位", e);
    }

    let addr = {};
    let geoData = {};

    if (lat !== null && lon !== null) {
        try {
            const geoRes = await fetch(
                `https://loc-api.o0w0b.top/?lat=${lat}&lon=${lon}`
            );

            geoData = await geoRes.json();
            addr = geoData.address || {};
        } catch (e) {
            console.warn("Nominatim失败", e);
        }
    }

    let ipData = null;
    try {
        const ipRes = await fetch("https://ip-api.o0w0b.top/?lang=zh-CN");
        ipData = await ipRes.json();
    } catch (e) {
        console.warn("IP定位失败", e);
    }

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

// 计算两点距离函数（用 Haversine）
function getDistance(lat1, lon1, lat2, lon2) {
    function toRad(d) { return d * Math.PI / 180; }
    const R = 6371; // 地球半径 km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2); // 返回保留两位小数的公里数
}

// 显示欢迎信息
function showWelcome(location) {
    if (!location || !location.data) {
        console.error('location data is not available.');
        return;
    }

    let lon = location.data.lon;
    let lat = location.data.lat;
    let dist = getDistance(lat, lon, -90, 0);
    let pos = location.data.prov + " " + location.data.city + " " + location.data.district;
    let ip = location.ip;
    let posdesc;

    // 以下的代码需要根据新API返回的结果进行相应的调整
    switch (location.data.country) {
        case "日本":
            posdesc = "こんにちは！<br>日本樱花盛开，景色如画";
            break;
        case "美国":
            posdesc = "Hello! <br>美国大地辽阔，城市风光各异";
            break;
        case "英国":
            posdesc = "Hello! <br>伦敦塔桥与泰晤士河相映成景";
            break;
        case "俄罗斯":
            posdesc = "Привет! <br>俄罗斯广袤土地，冬日雪景迷人";
            break;
        case "法国":
            posdesc = "Bonjour! <br>法国乡村与巴黎街景交相辉映";
            break;
        case "德国":
            posdesc = "Hallo! <br>德国古堡林立，啤酒节热闹非凡";
            break;
        case "澳大利亚":
            posdesc = "G’day! <br>澳大利亚海岸与内陆风光壮丽";
            break;
        case "加拿大":
            posdesc = "Hey! <br>加拿大枫叶红遍，湖光山色宜人";
            break;
        case "韩国":
        case "大韩民国":
        case "韩国 / 南韓":
            posdesc = "안녕하세요! <br>韩国泡菜、辣炒年糕色香味俱全";
            break;
        case "中国":
            switch (location.data.prov) {
                case "北京市":
                    posdesc = "北京故宫庄严，天安门广场宏伟";
                    break;
                case "天津市":
                    posdesc = "天津海河蜿蜒，古文化街风情浓";
                    break;
                case "河北省":
                    posdesc = "河北长城蜿蜒，群山连绵";
                    break;
                case "山西省":
                    posdesc = "山西古建筑众多，历史厚重";
                    break;
                case "内蒙古自治区":
                    posdesc = "内蒙古草原辽阔，风吹草低见牛羊";
                    break;
                case "辽宁省":
                    posdesc = "辽宁沿海风光秀丽，城市与海岸交错";
                    break;
                case "吉林省":
                    posdesc = "吉林冬季雪景壮丽，松花江蜿蜒";
                    break;
                case "黑龙江省":
                    posdesc = "黑龙江冰雪世界，松花江静谧";
                    break;
                case "上海市":
                    posdesc = "上海外滩璀璨，高楼林立";
                    break;
                case "江苏省":
                    switch (location.data.city) {
                        case "南京市":
                            posdesc = "南京古都，秦淮河夜色迷人";
                            break;
                        case "苏州市":
                            posdesc = "苏州园林精美，水乡小桥流水";
                            break;
                        default:
                            posdesc = "江苏江南水乡，河流纵横";
                            break;
                    }
                    break;
                case "浙江省":
                    switch (location.data.city) {
                        case "杭州市":
                            posdesc = "杭州西湖烟雨，山水如画";
                            break;
                        default:
                            posdesc = "浙江山水秀丽，文化底蕴深厚";
                            break;
                    }
                    break;
                case "河南省":
                    switch (location.data.city) {
                        case "郑州市":
                            posdesc = "郑州古今交融，城中绿地广阔";
                            break;
                        case "信阳市":
                            posdesc = "信阳茶园连片，绿意盎然";
                            break;
                        case "南阳市":
                            posdesc = "南阳河流纵横，历史遗迹丰富";
                            break;
                        case "驻马店市":
                            posdesc = "驻马店平原开阔，田园景色宜人";
                            break;
                        case "开封市":
                            posdesc = "开封古都，古建筑保存完好";
                            break;
                        case "洛阳市":
                            posdesc = "洛阳牡丹盛开，花城景色优美";
                            break;
                        default:
                            posdesc = "河南自然与历史景观丰富";
                            break;
                    }
                    break;
                case "安徽省":
                    posdesc = "安徽黄山云海，奇峰异石层出";
                    break;
                case "福建省":
                    posdesc = "福建山海相连，海岸风光秀丽";
                    break;
                case "江西省":
                    posdesc = "江西庐山高耸，江河环绕";
                    break;
                case "山东省":
                    posdesc = "山东泰山雄伟，沿海城市风光美";
                    break;
                case "湖北省":
                    switch (location.data.city) {
                        case "黄冈市":
                            posdesc = "黄冈江河交错，山水相依";
                            break;
                        case "武汉市":
                            posdesc = "武汉江滩开阔，城市景色壮丽";
                            break;
                        default:
                            posdesc = "湖北山水秀丽，河湖众多";
                            break;
                    }
                    break;
                case "湖南省":
                    posdesc = "湖南岳麓山秀美，江河湖泊环绕";
                    break;
                case "广东省":
                    switch (location.data.city) {
                        case "广州市":
                            posdesc = "广州珠江两岸，城市天际线壮观";
                            break;
                        case "深圳市":
                            posdesc = "深圳高楼林立，现代都市景观丰富";
                            break;
                        default:
                            posdesc = "广东沿海城市众多，风光秀丽";
                            break;
                    }
                    break;
                case "广西壮族自治区":
                    posdesc = "桂林山水甲天下，漓江蜿蜒";
                    break;
                case "海南省":
                    posdesc = "海南海岸线长，沙滩与蓝天相映";
                    break;
                case "四川省":
                    posdesc = "四川群山环绕，江河纵横";
                    break;
                case "贵州省":
                    posdesc = "贵州喀斯特地貌奇特，山水秀丽";
                    break;
                case "云南省":
                    posdesc = "云南高山湖泊众多，彩云之南美景";
                    break;
                case "西藏自治区":
                    posdesc = "西藏高原辽阔，雪山与草原交错";
                    break;
                case "陕西省":
                    posdesc = "陕西古城众多，历史遗迹丰富";
                    break;
                case "甘肃省":
                    posdesc = "甘肃戈壁广阔，丝路文化厚重";
                    break;
                case "青海省":
                    posdesc = "青海湖碧水环山，景色壮丽";
                    break;
                case "宁夏回族自治区":
                    posdesc = "宁夏黄河蜿蜒，沙漠与绿洲交错";
                    break;
                case "新疆维吾尔自治区":
                    posdesc = "新疆天山雪峰，高原风光辽阔";
                    break;
                case "台湾省":
                    posdesc = "台湾岛屿纵横，山海景色独特";
                    break;
                case "香港特别行政区":
                    posdesc = "香港维多利亚港，城市天际线迷人";
                    break;
                case "澳门特别行政区":
                    posdesc = "澳门滨海风光与历史建筑交相辉映";
                    break;
                default:
                    posdesc = "欢迎欢迎！";
                    break;
            }
            break;
        default:
            posdesc = "Hello! 欢迎来自国外的朋友";
            break;
    }

    // 根据本地时间切换欢迎语
    let timeChange;
    let date = new Date();
    if (date.getHours() >= 5 && date.getHours() < 11)
        timeChange = "<span>🌅 早安！新的一天开始啦，记得吃早餐哦~</span>";
    else if (date.getHours() >= 11 && date.getHours() < 13)
        timeChange = "<span>🍴 中午好！吃点好吃的补充能量吧~</span>";
    else if (date.getHours() >= 13 && date.getHours() < 17)
        timeChange = "<span>☕ 下午好！来杯茶，继续加油吧~</span>";
    else if (date.getHours() >= 17 && date.getHours() < 19)
        timeChange = "<span>🌇 傍晚好！今天辛苦了，放松一下吧~</span>";
    else if (date.getHours() >= 19 && date.getHours() < 24)
        timeChange = "<span>🌙 晚上好！属于自己的时间到啦，随心享受吧~</span>";
    else
        timeChange = "<span>🌌 夜深了，早点休息，明天继续加油！</span>";

    let welcomeInfoElement = document.getElementById("welcome-info");

    if (welcomeInfoElement) {
        welcomeInfoElement.innerHTML = `
        <p>Hey~ 来自 <span class="user-location">${pos}</span> 的来访者！😝</p>
        <p>${posdesc} 🏞️</p>
        <!-- <p>目前距南极企鹅约 <span class="distance">${dist}</span> 公里！</p>
        <p>纬度：<span class="distance">${lat}</span><br>经度：<span class="distance">${lon}</span></p>
        <p>网络 IP：<span class="ip-address">${ip}</span></p> -->
        <p class="time-greeting">${timeChange}</p>
    `;
    } else {
        console.log("Pjax无法获取元素");
    }
}

// 判断是否存在 "welcome-info" 元素
function isWelcomeInfoAvailable() {
    let welcomeInfoElement = document.getElementById("welcome-info");
    return welcomeInfoElement !== null;
}

// Pjax 完成后调用的处理函数
function handlePjaxComplete(location) {
    if (isWelcomeInfoAvailable()) {
        showWelcome(location);
    }
}

// 加载时调用
function onLoad() {
    getLocationSmart().then(location => {
        if (isWelcomeInfoAvailable()) {
            showWelcome(location);
        }
        document.addEventListener("pjax:complete", () => handlePjaxComplete(location));
    });
}

// 绑定 window.onload 事件
window.onload = onLoad;
