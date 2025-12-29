!function (e) {
    var n,
        t = {},
        o = "jinrishici-token";

    function i() {
        return (
            document.getElementById("jinrishici-sentence") ||
            document.getElementsByClassName("jinrishici-sentence").length !== 0
        );
    }

    function c() {
        t.load(function (e) {
            var n = document.getElementById("jinrishici-sentence"),
                t = document.getElementsByClassName("jinrishici-sentence");

            if (n) {
                n.innerText = e.data.content;
            }

            if (t.length !== 0) {
                for (var o = 0; o < t.length; o++) {
                    t[o].innerText = e.data.content;
                }
            }
        });
    }

    function r(e, n) {
        var t = new XMLHttpRequest();
        t.open("get", n);
        t.withCredentials = true;
        t.send();

        t.onreadystatechange = function () {
            if (t.readyState === 4) {
                var o = JSON.parse(t.responseText);
                if (o.status === "success") {
                    e(o);
                } else {
                    console.error(
                        "今日诗词API加载失败，错误原因：" + o.errMessage
                    );
                }
            }
        };
    }

    t.load = function (n) {
        if (e.localStorage && e.localStorage.getItem(o)) {
            return r(
                n,
                "https://v2.jinrishici.com/one.json?client=browser-sdk/1.2&X-User-Token=" +
                encodeURIComponent(e.localStorage.getItem(o))
            );
        } else {
            return r(function (t) {
                e.localStorage.setItem(o, t.token);
                n(t);
            }, "https://v2.jinrishici.com/one.json?client=browser-sdk/1.2");
        }
    };

    e.jinrishici = t;

    if (i()) {
        c();
    } else {
        n = function () {
            i() && c();
        };

        if (document.readyState !== "loading") {
            n();
        } else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", n);
        } else {
            document.attachEvent("onreadystatechange", function () {
                if (document.readyState === "complete") {
                    n();
                }
            });
        }
    }
}(window);
