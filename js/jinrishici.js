!function (window) {
    var onReadyCallback,
        jinrishici = {},
        TOKEN_KEY = "jinrishici-token";

    // 检测页面中是否存在诗句容器
    function hasSentenceElement() {
        return (
            document.getElementById("jinrishici-sentence") ||
            document.getElementsByClassName("jinrishici-sentence").length !== 0
        );
    }

    // 自动填充诗句
    function autoRenderSentence() {
        jinrishici.load(function (response) {
            var sentenceById = document.getElementById("jinrishici-sentence"),
                sentenceByClass = document.getElementsByClassName("jinrishici-sentence");

            if (sentenceById) {
                sentenceById.innerText = response.data.content;
            }

            if (sentenceByClass.length !== 0) {
                for (var i = 0; i < sentenceByClass.length; i++) {
                    sentenceByClass[i].innerText = response.data.content;
                }
            }
        });
    }

    // 发起 API 请求
    function requestApi(callback, url) {
        var xhr = new XMLHttpRequest();
        xhr.open("get", url);
        xhr.withCredentials = true;
        xhr.send();

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                var result = JSON.parse(xhr.responseText);
                if (result.status === "success") {
                    callback(result);
                } else {
                    console.error(
                        "今日诗词API加载失败，错误原因：" + result.errMessage
                    );
                }
            }
        };
    }

    // 加载诗词数据
    jinrishici.load = function (callback) {
        if (window.localStorage && window.localStorage.getItem(TOKEN_KEY)) {
            return requestApi(
                callback,
                "https://v2.jinrishici.com/one.json?client=browser-sdk/1.2&X-User-Token=" +
                encodeURIComponent(window.localStorage.getItem(TOKEN_KEY))
            );
        } else {
            return requestApi(function (response) {
                window.localStorage.setItem(TOKEN_KEY, response.token);
                callback(response);
            }, "https://v2.jinrishici.com/one.json?client=browser-sdk/1.2");
        }
    };

    // 暴露到全局
    window.jinrishici = jinrishici;

    // DOM 就绪处理
    if (hasSentenceElement()) {
        autoRenderSentence();
    } else {
        onReadyCallback = function () {
            hasSentenceElement() && autoRenderSentence();
        };

        if (document.readyState !== "loading") {
            onReadyCallback();
        } else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", onReadyCallback);
        } else {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState === "complete") {
                    onReadyCallback();
                }
            });
        }
    }
}(window);
