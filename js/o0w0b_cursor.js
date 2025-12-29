// 创建光标
const cursor = document.createElement("div");
cursor.id = "cursor";

document.body.appendChild(cursor);

let mouseX = 0, mouseY = 0;

// 鼠标移动更新坐标
document.addEventListener("mousemove", (e) => {
    cursor.style.opacity = "1";
    mouseX = e.clientX;
    mouseY = e.clientY;
    // 与鼠标同步
    cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) rotate(315deg)`;
});

/* 鼠标进入/离开屏幕内 */
window.addEventListener("mouseenter", () => {
    cursor.style.opacity = "1";
});
window.addEventListener("mouseout", (e) => {
    if (!e.relatedTarget && !e.toElement) {
        cursor.style.opacity = "0";
    }
});

/* 点击水波纹动画 */
document.addEventListener("click", () => {
    const ripple = document.createElement("div");
    ripple.className = "CursorClick";
    ripple.style.left = `${mouseX}px`;
    ripple.style.top = `${mouseY}px`;

    // 保证光标在动画上层
    document.body.insertBefore(ripple, cursor);

    // 动画结束删除
    ripple.addEventListener("animationend", () => ripple.remove());
});

/* 悬停状态交互 */
const hoverSelectors = `a, button, img, input, textarea, .copy-button, .code-expand-btn, .fullpage-button, .expand, 
                        .scroll-down-effects, #footer-wrap, #pagination .page-number, #site-name, #nav .site-page, 
                        .cursor-hover, .switch-btn, .switch-btn, .gt-user-inner, .gt-ico, .gt-user-name, 
                        .gt-btn, .vbtn, svg, .at_button`;

document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverSelectors)) {
        cursor.classList.add("hover");
    } else {
        cursor.classList.remove("hover");
    }
});

/* false 禁用右键 */
document.oncontextmenu = () => false;
