function footer() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    // 设置 footer 样式
    footer.style.position = 'relative';
    footer.style.overflow = 'hidden';

    // 页脚文字层提升
    const footerContent = footer.querySelector('.footer-other');
    if (footerContent) {
        footerContent.style.position = 'relative';
        footerContent.style.zIndex = '1';
    }

    // 添加鱼动画容器
    let container = document.getElementById('jsi-flying-fish-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'jsi-flying-fish-container';
        footer.appendChild(container);
    }

    // 容器样式
    Object.assign(container.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: '0'
    });

    // canvas 设置为容器大小
    const canvas = container.querySelector('canvas');
    if (canvas) {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        Object.assign(canvas.style, {
            display: 'block',
            width: '100%',
            height: '100%'
        });
    }

    // === 颜色设置 ===
    const WATER_TOP_COLOR = 'rgba(210, 235, 255, 0.35)';   // 浅水
    const WATER_MIDDLE_COLOR = 'rgba(140, 200, 240, 0.45)'; // 中水
    const WATER_BOTTOM_COLOR = 'rgba(70, 130, 180, 0.55)';   // 深水
    // 鱼体背部颜色
    const FISH_BODY_TOP_COLOR = '#ff6ec7';
    // 鱼体腹部颜色
    const FISH_BODY_BOTTOM_COLOR = '#ffd166';
    // 鱼鳍颜色（只存 rgb）
    const FISH_FIN_COLOR = '255, 255, 255';
    // 鱼尾颜色
    const FISH_TAIL_COLOR = 'rgba(255, 128, 0, 0.8)';

    // 加载鱼动画脚本
    (function () {
        var RENDERER = {
            POINT_INTERVAL: 5,
            FISH_COUNT: 3,
            MAX_INTERVAL_COUNT: 50,
            INIT_HEIGHT_RATE: 0.5,
            THRESHOLD: 50,
            init: function () { this.setParameters(); this.reconstructMethods(); this.setup(); this.bindEvent(); this.render(); },
            setParameters: function () {
                this._window = window;
                this._container = document.getElementById('jsi-flying-fish-container');
                this._canvas = document.createElement('canvas');
                this.context = this._canvas.getContext('2d');
                this._container.appendChild(this._canvas);
                this.points = [];
                this.fishes = [];
                this.watchIds = [];
            },
            createSurfacePoints: function () {
                var count = Math.round(this.width / this.POINT_INTERVAL);
                this.pointInterval = this.width / (count - 1);
                this.points.push(new SURFACE_POINT(this, 0));
                for (var i = 1; i < count; i++) {
                    var point = new SURFACE_POINT(this, i * this.pointInterval), previous = this.points[i - 1];
                    point.setPreviousPoint(previous);
                    previous.setNextPoint(point);
                    this.points.push(point);
                }
            },
            reconstructMethods: function () {
                this.watchWindowSize = this.watchWindowSize.bind(this);
                this.jdugeToStopResize = this.jdugeToStopResize.bind(this);
                this.startEpicenter = this.startEpicenter.bind(this);
                this.moveEpicenter = this.moveEpicenter.bind(this);
                this.reverseVertical = this.reverseVertical.bind(this);
                this.render = this.render.bind(this);
            },
            setup: function () {
                this.points.length = 0;
                this.fishes.length = 0;
                this.watchIds.length = 0;
                this.intervalCount = this.MAX_INTERVAL_COUNT;
                this.width = this._container.offsetWidth;
                this.height = this._container.offsetHeight;
                this.fishCount = this.FISH_COUNT * this.width / 500 * this.height / 500;
                this._canvas.width = this.width;
                this._canvas.height = this.height;
                this.reverse = false;
                this.fishes.push(new FISH(this));
                this.createSurfacePoints();
            },
            watchWindowSize: function () {
                this.clearTimer();
                this.tmpWidth = window.innerWidth;
                this.tmpHeight = window.innerHeight;
                this.watchIds.push(setTimeout(this.jdugeToStopResize, this.WATCH_INTERVAL));
            },
            clearTimer: function () {
                while (this.watchIds.length > 0) { clearTimeout(this.watchIds.pop()); }
            },
            jdugeToStopResize: function () {
                var width = window.innerWidth, height = window.innerHeight, stopped = (width == this.tmpWidth && height == this.tmpHeight);
                this.tmpWidth = width;
                this.tmpHeight = height;
                if (stopped) { this.setup(); }
            },
            bindEvent: function () {
                window.addEventListener('resize', this.watchWindowSize);
                if (this._container) {
                    this._container.addEventListener('mouseenter', this.startEpicenter);
                    this._container.addEventListener('mousemove', this.moveEpicenter);
                    this._container.addEventListener('click', this.reverseVertical);
                }
            },
            getAxis: function (event) {
                var rect = this._container.getBoundingClientRect();
                return {
                    x: event.clientX - rect.left + window.scrollX,
                    y: event.clientY - rect.top + window.scrollY
                };
            },
            startEpicenter: function (event) { this.axis = this.getAxis(event); },
            moveEpicenter: function (event) {
                var axis = this.getAxis(event);
                if (!this.axis) { this.axis = axis; }
                this.generateEpicenter(axis.x, axis.y, axis.y - this.axis.y);
                this.axis = axis;
            },
            generateEpicenter: function (x, y, velocity) {
                if (y < this.height / 2 - this.THRESHOLD || y > this.height / 2 + this.THRESHOLD) return;
                var index = Math.round(x / this.pointInterval);
                if (index < 0 || index >= this.points.length) return;
                this.points[index].interfere(y, velocity);
            },
            reverseVertical: function () {
                this.reverse = !this.reverse;
                for (var i = 0, count = this.fishes.length; i < count; i++) { this.fishes[i].reverseVertical(); }
            },
            controlStatus: function () {
                for (var i = 0, count = this.points.length; i < count; i++) this.points[i].updateSelf();
                for (var i = 0, count = this.points.length; i < count; i++) this.points[i].updateNeighbors();
                if (this.fishes.length < this.fishCount) {
                    if (--this.intervalCount == 0) {
                        this.intervalCount = this.MAX_INTERVAL_COUNT;
                        this.fishes.push(new FISH(this));
                    }
                }
            },
            render: function () {
                requestAnimationFrame(this.render);
                this.controlStatus();

                this.context.clearRect(0, 0, this.width, this.height);

                // ===== 水面渐变 =====
                const water_gradient = this.context.createLinearGradient(
                    0,
                    this.reverse ? this.height : 0,
                    0,
                    this.reverse ? 0 : this.height
                );

                water_gradient.addColorStop(0, WATER_TOP_COLOR);
                water_gradient.addColorStop(0.5, WATER_MIDDLE_COLOR);
                water_gradient.addColorStop(1, WATER_BOTTOM_COLOR);

                this.context.fillStyle = water_gradient;
                // ===== 画鱼 =====
                for (let i = 0; i < this.fishes.length; i++) {
                    this.fishes[i].render(this.context);
                }

                // ===== 画水面 =====
                this.context.save();
                this.context.globalCompositeOperation = 'xor';
                this.context.beginPath();
                this.context.moveTo(0, this.reverse ? 0 : this.height);

                for (let i = 0; i < this.points.length; i++) {
                    this.points[i].render(this.context);
                }

                this.context.lineTo(this.width, this.reverse ? 0 : this.height);
                this.context.closePath();
                this.context.fill();
                this.context.restore();

                // === 水面阳光高光（叠加层）===
                this.context.save();
                this.context.globalCompositeOperation = 'lighter';

                // 水面高度
                const surfaceY = this.height * this.INIT_HEIGHT_RATE;

                // 轻微闪动
                const shimmer = Math.sin(Date.now() * 0.0015) * 8;

                // 垂直渐变（决定“分层次光照”）
                const gradient = this.context.createLinearGradient(
                    0,
                    surfaceY - 30 + shimmer,
                    0,
                    surfaceY + 30 + shimmer
                );

                gradient.addColorStop(0, 'rgba(255,255,255,0)');
                gradient.addColorStop(0.35, 'rgba(255,255,255,0.12)');
                gradient.addColorStop(0.5, 'rgba(255,255,255,0.25)');
                gradient.addColorStop(0.65, 'rgba(255,255,255,0.12)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');

                this.context.fillStyle = gradient;

                // 沿水面画「一整条路径」
                this.context.beginPath();
                this.context.moveTo(0, this.reverse ? 0 : this.height);

                for (let i = 0; i < this.points.length; i++) {
                    const p = this.points[i];
                    this.context.lineTo(p.x, this.height - p.height);
                }

                this.context.lineTo(this.width, this.reverse ? 0 : this.height);
                this.context.closePath();
                this.context.fill();

                this.context.restore();
            }
        };

        var SURFACE_POINT = function (renderer, x) { this.renderer = renderer; this.x = x; this.init(); };
        SURFACE_POINT.prototype = {
            SPRING_CONSTANT: 0.03,
            SPRING_FRICTION: 0.9,
            WAVE_SPREAD: 0.3,
            ACCELARATION_RATE: 0.01,

            init: function () {
                this.initHeight = this.renderer.height * this.renderer.INIT_HEIGHT_RATE;
                this.height = this.initHeight;
                this.fy = 0;
                this.force = { previous: 0, next: 0 };
            },
            setPreviousPoint: function (previous) {
                this.previous = previous;
            },
            setNextPoint: function (next) {
                this.next = next;
            },
            interfere: function (y, velocity) {
                this.fy = this.renderer.height * this.ACCELARATION_RATE * ((this.renderer.height - this.height - y) >= 0 ? -1 : 1) * Math.abs(velocity);
            },
            updateSelf: function () {
                this.fy += this.SPRING_CONSTANT * (this.initHeight - this.height);
                this.fy *= this.SPRING_FRICTION;
                this.height += this.fy;
            },
            updateNeighbors: function () {
                if (this.previous) {
                    this.force.previous = this.WAVE_SPREAD * (this.height - this.previous.height);
                }
                if (this.next) {
                    this.force.next = this.WAVE_SPREAD * (this.height - this.next.height);
                }
            },
            render: function (context) {
                if (this.previous) {
                    this.previous.height += this.force.previous;
                    this.previous.fy += this.force.previous;
                }
                if (this.next) {
                    this.next.height += this.force.next;
                    this.next.fy += this.force.next;
                }
                context.lineTo(this.x, this.renderer.height - this.height);
            }
        };
        var FISH = function (renderer) { this.renderer = renderer; this.init(); };
        FISH.prototype = {
            GRAVITY: 0.4,

            init: function () {
                this.direction = Math.random() < 0.5;
                this.x = this.direction ? (this.renderer.width + this.renderer.THRESHOLD) : -this.renderer.THRESHOLD;
                this.previousY = this.y;
                this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1);

                if (this.renderer.reverse) {
                    this.y = this.getRandomValue(this.renderer.height * 1 / 10, this.renderer.height * 4 / 10);
                    this.vy = this.getRandomValue(2, 5);
                    this.ay = this.getRandomValue(0.05, 0.2);
                } else {
                    this.y = this.getRandomValue(this.renderer.height * 6 / 10, this.renderer.height * 9 / 10);
                    this.vy = this.getRandomValue(-5, -2);
                    this.ay = this.getRandomValue(-0.2, -0.05);
                }
                this.isOut = false;
                this.theta = 0;
                this.phi = 0;
            },
            getRandomValue: function (min, max) {
                return min + (max - min) * Math.random();
            },
            reverseVertical: function () {
                this.isOut = !this.isOut;
                this.ay *= -1;
            },
            controlStatus: function () {
                this.previousY = this.y;
                this.x += this.vx;
                this.y += this.vy;
                this.vy += this.ay;

                if (this.renderer.reverse) {
                    if (this.y > this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
                        this.vy -= this.GRAVITY;
                        this.isOut = true;
                    } else {
                        if (this.isOut) {
                            this.ay = this.getRandomValue(0.05, 0.2);
                        }
                        this.isOut = false;
                    }
                } else {
                    if (this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
                        this.vy += this.GRAVITY;
                        this.isOut = true;
                    } else {
                        if (this.isOut) {
                            this.ay = this.getRandomValue(-0.2, -0.05);
                        }
                        this.isOut = false;
                    }
                }
                if (!this.isOut) {
                    this.theta += Math.PI / 20;
                    this.theta %= Math.PI * 2;
                    this.phi += Math.PI / 30;
                    this.phi %= Math.PI * 2;
                }
                this.renderer.generateEpicenter(this.x + (this.direction ? -1 : 1) * this.renderer.THRESHOLD, this.y, this.y - this.previousY);

                if (this.vx > 0 && this.x > this.renderer.width + this.renderer.THRESHOLD || this.vx < 0 && this.x < -this.renderer.THRESHOLD) {
                    this.init();
                }
            },
            render: function (context) {
                context.save();
                context.translate(this.x, this.y);
                context.rotate(Math.PI + Math.atan2(this.vy, this.vx));
                context.scale(1, this.direction ? 1 : -1);
                context.beginPath();
                context.moveTo(-30, 0);
                context.bezierCurveTo(-20, 15, 15, 10, 40, 0);
                context.bezierCurveTo(15, -10, -20, -15, -30, 0);
                let gradient = context.createLinearGradient(0, -15, 0, 15);
                gradient.addColorStop(0, FISH_BODY_TOP_COLOR);
                gradient.addColorStop(1, FISH_BODY_BOTTOM_COLOR);
                context.fillStyle = gradient;
                context.fill();

                context.save();
                context.translate(40, 0);
                context.scale(0.9 + 0.2 * Math.sin(this.theta), 1);
                const tailGradient = context.createLinearGradient(0, 0, 22, 0);
                tailGradient.addColorStop(0, FISH_TAIL_COLOR);
                tailGradient.addColorStop(0.6, 'rgba(255,255,255,0.4)');
                tailGradient.addColorStop(1, 'rgba(255,255,255,0)');
                context.beginPath();
                context.moveTo(0, 0);
                context.quadraticCurveTo(5, 10, 20, 8);
                context.quadraticCurveTo(12, 5, 10, 0);
                context.quadraticCurveTo(12, -5, 20, -8);
                context.quadraticCurveTo(5, -10, 0, 0);
                context.fillStyle = tailGradient;
                context.fill();
                context.restore();

                context.save();
                context.translate(-3, 0);
                context.rotate((Math.PI / 3 + Math.PI / 10 * Math.sin(this.phi)) * (this.renderer.reverse ? -1 : 1));

                context.beginPath();

                if (this.renderer.reverse) {
                    context.moveTo(4, 0);
                    context.bezierCurveTo(8, 8, 8, 18, 0, 24);
                    context.bezierCurveTo(-7, 15, -5, 6, 0, 0);
                } else {
                    context.moveTo(-4, 0);
                    context.bezierCurveTo(-8, -8, -8, -18, 0, -24);
                    context.bezierCurveTo(7, -15, 5, -6, 0, 0);
                }
                context.closePath();
                const finGradient = context.createLinearGradient(0, 0, 0, this.renderer.reverse ? 24 : -24);
                finGradient.addColorStop(0, `rgba(${FISH_FIN_COLOR}, 0.9)`);
                finGradient.addColorStop(0.6, `rgba(${FISH_FIN_COLOR}, 0.45)`);
                finGradient.addColorStop(1, `rgba(${FISH_FIN_COLOR}, 0.2)`);
                context.fillStyle = finGradient;
                context.fill();
                context.restore();
                context.restore();
                this.controlStatus(context);
            }
        };

        // 防止重复初始化
        if (window._fishInited) return;
        window._fishInited = true;
        // 自动初始化
        RENDERER.init();
    })();
}

// 初始化
document.addEventListener('DOMContentLoaded', footer);
document.addEventListener('pjax:complete', function () {
    // PJAX 后 DOM 变了，允许重新初始化
    window._fishInited = false;
    footer();
});
