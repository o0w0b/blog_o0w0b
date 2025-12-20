class RightMenu {
    constructor() {
        this.selectTextNow = ""
        this.domhref = ""
        this.domImgSrc = ""
        this.globalEvent = null
        this.rmWidth = 0
        this.rmHeight = 0

        this.initialize()
    }

    /* ========== 初始化 ========== */

    initialize() {
        window.addEventListener("load", () => {
            this.addRightMenuClickEvent()
            document.onmouseup = document.ondbclick = this.selectText.bind(this)

            btf.addGlobalFn(
                "pjaxComplete",
                () => this.addRightMenuClickEvent(),
                "addRightMenuClickEvent"
            )
        })

        window.oncontextmenu = (e) => this.onContextMenu(e)
    }

    /* ========== 菜单点击事件 ========== */

    addRightMenuClickEvent() {
        const menuItems = {
            "rightMenu-mask": [this.hideRightMenu.bind(this)],

            // 浏览器
            "menu-backward": [() => { history.back(); this.hideRightMenu() }],
            "menu-forward": [() => { history.forward(); this.hideRightMenu() }],
            "menu-refresh": [() => { location.reload() }],
            "menu-top": [() => { btf.scrollToDest(0, 500); this.hideRightMenu() }],

            // 文章
            "menu-reading": [() => {
                const isReadMode = document.body.classList.contains("read-mode")

                if (!isReadMode) {
                    // 进入阅读模式
                    document.querySelector("#readmode")?.click()
                } else {
                    // 退出阅读模式（点击主题自带的退出按钮）
                    document.querySelector(".exit-readmode")?.click()
                }

                this.hideRightMenu()
            }],
            "menu-postlink": [this.copyPostUrl.bind(this)],

            // 文本
            "menu-copytext": [() => {
                this.rightmenuCopyText(this.selectTextNow)
                GLOBAL_CONFIG.Snackbar && btf.snackbarShow("已复制选中文本")
            }],
            "menu-pastetext": [this.pasteText.bind(this)],
            "menu-searchBaidu": [this.searchBaidu.bind(this)],

            // 链接
            "menu-newwindow": [() => {
                this.domhref && window.open(this.domhref)
                this.hideRightMenu()
            }],
            "menu-copylink": [() => {
                this.rightmenuCopyText(this.domhref)
                GLOBAL_CONFIG.Snackbar && btf.snackbarShow("已复制链接地址")
            }],

            // 图片
            "menu-copylinkimg": [() => {
                this.rightmenuCopyText(this.domImgSrc)
                GLOBAL_CONFIG.Snackbar && btf.snackbarShow("已复制图片链接")
            }],
            "menu-newwindowimg": [() => {
                this.domImgSrc && window.open(this.domImgSrc)
                this.hideRightMenu()
            }],

            // 主题 / 页面
            "menu-darkmode": [() => {
                document.querySelector("#darkmode")?.click()
                this.hideRightMenu()
            }],
            "menu-translate": [() => {
                document.querySelector("#translateLink")?.click()
                this.hideRightMenu()
            }],
            "menu-asidehide": [() => {
                document.querySelector("#hide-aside-btn")?.click()
                this.hideRightMenu()
            }]
        }

        for (const id in menuItems) {
            const el = document.getElementById(id)
            if (el) menuItems[id].forEach(fn => el.addEventListener("click", fn))
        }

        document.getElementById("rightMenu-mask")
            ?.addEventListener("contextmenu", () => {
                this.hideRightMenu()
                return false
            })
    }

    /* ========== 菜单显示控制 ========== */

    reloadrmSize() {
        const menu = document.getElementById("rightMenu")
        this.rmWidth = menu.offsetWidth
        this.rmHeight = menu.offsetHeight
    }

    showRightMenu(show, mouseY = 0, mouseX = 0) {
        const menu = document.getElementById("rightMenu")
        if (!show) {
            menu.style.display = "none"
            return
        }

        menu.style.display = "block"
        this.reloadrmSize()

        if (mouseX + this.rmWidth + 20 > window.innerWidth) {
            mouseX -= this.rmWidth + 20
        }
        if (mouseY + this.rmHeight > window.innerHeight) {
            mouseY -= mouseY + this.rmHeight - window.innerHeight + 20
        }

        menu.style.left = mouseX + "px"
        menu.style.top = mouseY + "px"
        document.getElementById("rightMenu-mask").style.display = "flex"
    }

    hideRightMenu() {
        document.getElementById("rightMenu").style.display = "none"
        document.getElementById("rightMenu-mask").style.display = "none"
    }

    /* ========== 文本处理 ========== */

    selectText() {
        this.selectTextNow = window.getSelection
            ? window.getSelection().toString()
            : ""
    }

    rightmenuCopyText(text) {
        if (!text) return
        navigator.clipboard?.writeText(text)
        this.hideRightMenu()
    }

    copyPostUrl() {
        this.rightmenuCopyText(location.href)
        GLOBAL_CONFIG.Snackbar && btf.snackbarShow("已复制本文链接")
    }

    searchBaidu() {
        if (!this.selectTextNow) return
        window.open("https://www.baidu.com/s?wd=" + this.selectTextNow)
        this.hideRightMenu()
    }

    pasteText() {
        navigator.clipboard?.readText().then(text => {
            this.insertAtCaret(this.globalEvent.target, text)
            GLOBAL_CONFIG.Snackbar && btf.snackbarShow("已粘贴剪贴板内容")
        })
        this.hideRightMenu()
    }

    insertAtCaret(input, text) {
        if (!input || !("selectionStart" in input)) return
        const start = input.selectionStart
        const end = input.selectionEnd
        input.value =
            input.value.slice(0, start) +
            text +
            input.value.slice(end)
        input.selectionStart = input.selectionEnd = start + text.length
    }

    /* ========== 右键核心逻辑 ========== */

    onContextMenu(e) {
        // 页面宽度小于768px, 显示浏览器默认右键菜单
        if (document.body.clientWidth <= 768) return true

        const target = e.target
        const mouseX = e.clientX + 12
        const mouseY = e.clientY

        this.globalEvent = e

        const hasText = !!this.selectTextNow
        const hasLink = !!target.href
        const hasImage = !!target.currentSrc
        const isInput = ["input", "textarea"].includes(target.tagName.toLowerCase())

        this.domhref = target.href || ""
        this.domImgSrc = target.currentSrc || ""

        const toggle = (id, show) => {
            const el = document.getElementById(id)
            if (el) el.style.display = show ? "block" : "none"
        }

        /* item 级 */
        toggle("menu-copytext", hasText)
        toggle("menu-searchBaidu", hasText)

        toggle("menu-newwindow", hasLink)
        toggle("menu-copylink", hasLink)

        toggle("menu-copylinkimg", hasImage)
        toggle("menu-newwindowimg", hasImage)

        toggle("menu-pastetext", isInput)

        /* group 级 */
        const postGroup = document.querySelector(".rightMenuPost")
        const pluginGroup = document.querySelector(".rightMenuPlugin")
        const otherGroup = document.querySelector(".rightMenuOther")

        const hasSpecialTarget = hasText || hasLink || hasImage
        const isPostPage = !!document.querySelector("#body-wrap.post")

        postGroup && (postGroup.style.display = !isPostPage || hasSpecialTarget ? "none" : "block")
        pluginGroup && (pluginGroup.style.display = hasSpecialTarget ? "block" : "none")
        otherGroup && (otherGroup.style.display = hasSpecialTarget ? "none" : "block")

        /* 阅读模式文案 */
        const readingItem = document.getElementById("menu-reading")
        if (readingItem) {
            const span = readingItem.querySelector("span")
            if (span) {
                span.textContent = document.body.classList.contains("read-mode")
                    ? "退出沉浸"
                    : "沉浸阅读"
            }
        }

        this.showRightMenu(true, mouseY, mouseX)
        // 阻止浏览器默认右键菜单
        e.preventDefault()
        return false
    }
}

const rightMenu = new RightMenu()
