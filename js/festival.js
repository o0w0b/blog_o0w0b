/*
 * festival.js
 * 功能：
 * 1. 公祭日，节日配置
 * 2. 公历 + 农历
 * 3. 公祭日 / 喜庆节日 不同主题
 * 4. 显示策略 day / page
 * 5. 浅色 / 深色模式
 */
(function () {
    if (typeof Swal === 'undefined') return;

    // ================= 配置读取 =================
    const config = window.hexo_festival_config || {
        display_mode: 'day',
        birthday: { enable: true, month: 11, day: 20 }
    };

    /* ================= 公历日期 ================= */
    const d = new Date();
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const dd = d.getDate();
    const todayKey = `festival_${y}_${m}_${dd}`;

    function shown() {
        return localStorage.getItem(todayKey) === '1';
    }

    function markShown() {
        localStorage.setItem(todayKey, '1');
    }

    /* ================= 夜间模式判断 ================= */
    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    /* ================= 页面灰度 ================= */
    function setGray() {
        document.documentElement.style.filter = 'grayscale(60%)';
    }

    /* ================= 弹窗主题 ================= */
    const THEMES = {
        /* 🎂 生日 */
        birthday: {
            title: '🎂 生日祝福',
            background: () => isDarkMode() ? '#2a1f2d' : '#fff0f5',  // 暖粉色调
            color: () => isDarkMode() ? '#ffccdd' : '#c71585',          // 深粉
            confirmButtonColor: '#ff69b4',
        },

        /* 🎆 新春 */
        spring: {
            title: '🎆 新春祝福',
            background: () => isDarkMode() ? '#2b0f10' : '#fff5f5',
            color: () => isDarkMode() ? '#ffd6d6' : '#a40000',
            confirmButtonColor: '#d62828',
        },

        /* 🏮 元宵 */
        lantern: {
            title: '🏮 元宵节祝福',
            background: () => isDarkMode() ? '#332211' : '#fff8f0',
            color: () => isDarkMode() ? '#ffdd99' : '#ff6600',
            confirmButtonColor: '#ff8800',
        },

        /* 🌕 中秋 */
        midautumn: {
            title: '🌕 中秋祝福',
            background: () => isDarkMode() ? '#1f1f2f' : '#fffbe6',
            color: () => isDarkMode() ? '#ffeebb' : '#c48b00',
            confirmButtonColor: '#ffb400',
        },

        /* 🚣 端午 */
        dragonboat: {
            title: '🚣 端午祝福',
            background: () => isDarkMode() ? '#0f2b1a' : '#f0fff5',
            color: () => isDarkMode() ? '#a0e0b0' : '#3cb371',
            confirmButtonColor: '#2e8b57',
        },

        /* 🎉 普通节日 */
        festival: {
            title: '🎉 节日祝福',
            background: () => isDarkMode() ? '#1f1f1f' : 'var(--card-bg)',
            color: () => isDarkMode() ? '#eaeaea' : 'var(--font-color)',
            confirmButtonColor: '#49b1f5',
        },

        /* 🕯️ 公祭日 */
        memorial: {
            title: '🕯️ 公祭日',
            background: () => '#1a1a1a',
            color: () => '#e0e0e0',
            confirmButtonColor: '#555',
        }
    };

    /* ================= 弹窗入口 ================= */
    function fire(text, theme = 'festival') {
        if (config.display_mode === 'day' && shown()) return;

        const t = THEMES[theme];

        Swal.fire({
            html: text.replace(/\n/g, '<br>'),
            ...(t.icon ? { icon: t.icon } : {}),
            title: t.title,
            confirmButtonText: '我知道了',
            allowOutsideClick: false,
            background: t.background(),
            color: t.color(),
            confirmButtonColor: t.confirmButtonColor,
            customClass: {
                popup: theme
            }
        });

        if (config.display_mode === 'day') markShown();
    }

    /* ================= 节日配置表 ================= */
    const FESTIVALS = [
        // ===== 公祭日 =====
        {
            check: () => m === 9 && dd === 18,
            action: () => setGray(),
            theme: 'memorial',
            text: `九一八事变 ${y - 1931} 周年
铭记历史，警示未来`
        },
        {
            check: () => m === 7 && dd === 7,
            action: () => setGray(),
            theme: 'memorial',
            text: `卢沟桥事变 ${y - 1937} 周年
山河不忘，吾辈自强`
        },
        {
            check: () => m === 12 && dd === 13,
            action: () => setGray(),
            theme: 'memorial',
            text: `南京大屠杀国家公祭日
以史为鉴，珍爱和平`
        },

        // ===== 公历节日 =====
        {
            check: () => m === 10 && dd <= 3,
            text: `🇨🇳 国庆快乐
山河锦绣，盛世如愿`
        },
        {
            check: () => m === 1 && dd === 1,
            text: `🧨 新年快乐
愿岁月常安，所行皆坦途`
        },
        {
            check: () => m === 3 && dd === 8,
            text: `🌷 妇女节快乐
愿你温柔而有力量`
        },
        {
            check: () => m === 5 && dd === 1,
            text: `🛠️ 劳动节快乐
每一份努力都值得被尊重`
        },
        {
            check: () => m === 5 && dd === 4,
            text: `✨ 青年节快乐
心中有火，眼里有光`
        },
        {
            check: () => m === 5 && dd === 20,
            text: `❤️ 520
愿爱意坦荡，岁岁不散`
        },
        {
            check: () => m === 7 && dd === 1,
            text: `🎂 建党纪念日
初心不改，使命在肩`
        },
        {
            check: () => m === 9 && dd === 10,
            text: `📚 教师节快乐
一朝为师，终身感念`
        },
        {
            check: () => m === 12 && dd === 25,
            text: `🎄 圣诞快乐
灯火可亲，平安喜乐`
        }
    ];

    /* ================= 生日 ================= */
    if (config.birthday && config.birthday.enable) {
        FESTIVALS.push({
            check: () => m === config.birthday.month && dd === config.birthday.day,
            theme: 'birthday',
            text: `🎉 祝你生日快乐
🎈 新的一岁，快乐常伴，好运常在！`
        });
    }

    /* ================= 农历节日 ================= */
    if (typeof calendarFormatter !== 'undefined') {
        const lunar = calendarFormatter.solar2lunar();

        FESTIVALS.push(
            {
                check: () => lunar.IMonthCn === '正月' && ['初一', '初二', '初三', '初四', '初五', '初六'].includes(lunar.IDayCn),
                theme: 'spring',
                text: `🧧 新春快乐
万事顺遂，岁岁常安`
            },
            {
                check: () => lunar.IMonthCn === '正月' && lunar.IDayCn === '十五',
                theme: 'lantern',
                text: `🥣🍡 元宵节快乐
灯影阑珊，阖家安康`
            },
            {
                check: () => lunar.IMonthCn === '五月' && lunar.IDayCn === '初五',
                theme: 'dragonboat',
                text: `🍙 端午安康
风调雨顺，身心无恙`
            },
            {
                check: () => lunar.IMonthCn === '七月' && lunar.IDayCn === '初七',
                text: `💖 七夕
心有所念，皆成所愿`
            },
            {
                check: () => lunar.IMonthCn === '八月' && lunar.IDayCn === '十五',
                theme: 'midautumn',
                text: `🥮 中秋快乐
人月两圆，所念皆归`
            },
            {
                check: () => lunar.IMonthCn === '九月' && lunar.IDayCn === '初九',
                text: `🌼 重阳安康
登高望远，岁月长青`
            }
        );
    }

    /* ================= 执行 ================= */
    FESTIVALS.forEach(f => {
        if (f.check()) {
            if (f.action) f.action();
            fire(f.text, f.theme);
        }
    });
})();
