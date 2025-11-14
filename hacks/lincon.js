(function () {

    var m = "ABRAHAM LINCOLN FOUR SCORED SEVERED YOUR SOUL",
        s = [
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSm8c6PD-PerhgIz3imsVzfcLeCUJtXg--0C14u-6KNMUqrh96SPHqdWTik69c_AxMGKsE&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeZHJZWLMKjcLjdxU8Hvs4JjZOdOlKuFUZ_oKNsFc7J9EYTzTgea7j8rq2dJ6vDxIg6ps&usqp=CAU",
            "https://i.kym-cdn.com/photos/images/newsfeed/003/148/954/95c.jpeg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT83KfERnUbNSuhu5cxT3QlXpZfL2XE7URloA&s"
        ],
        saved = [],
        elmMap = new Map(),
        w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null),
        n;

    while (n = w.nextNode()) {
        var p = n.parentNode;
        if (!p || !p.tagName) continue;
        var t = n.nodeValue;
        if (!t || !t.trim()) continue;
        var tn = p.tagName.toLowerCase();
        if (/^(script|style|noscript|iframe|svg|textarea|input|select|button)$/.test(tn)) continue;
        if (p.isContentEditable) continue;

        saved.push({ n: n, v: n.nodeValue });
        if (!elmMap.has(p))
            elmMap.set(p, p.getAttribute("style"));

        n.nodeValue = m;
        p.style.color = "red";
    }

    var flicker = document.createElement("div");
    Object.assign(flicker.style, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#fff",
        opacity: 0,
        zIndex: 2147483640,
        pointerEvents: "none",
        transition: "opacity 0.2s"
    });
    document.body.appendChild(flicker);

    setTimeout(() => {
        flicker.style.opacity = 1;
        setTimeout(() => { flicker.style.opacity = 0; }, 200);
        setTimeout(() => {
            flicker.style.opacity = 1;
            setTimeout(() => { flicker.style.opacity = 0; }, 150);
        }, 400);
    }, 300);

    var ctx = new (AudioContext || webkitAudioContext)(),
        o = ctx.createOscillator(),
        g = ctx.createGain();

    o.type = "sine";
    o.frequency.value = 60 + Math.random() * 40;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 3);

    var d = document.createElement("div");
    d.textContent = m;
    Object.assign(d.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        fontSize: "3.2em",
        fontWeight: "900",
        color: "#ff0000",
        fontFamily: "Impact, Anton, 'Arial Black', sans-serif",
        zIndex: 2147483647,
        textShadow: "0 0 25px #000",
        pointerEvents: "none",
        animation: "wobble 1s infinite"
    });

    var style = document.createElement("style");
    style.textContent =
        "@keyframes wobble{0%,100%{transform:translate(-50%,-50%) rotate(-1deg);}50%{transform:translate(-50%,-50%) rotate(1deg);}}";
    document.head.appendChild(style);
    document.body.appendChild(d);

    var fall = [],
        followers = [];

    for (var i = 0; i < 20; i++) (function (i) {
        var im = document.createElement("img");
        im.src = s[Math.floor(Math.random() * s.length)];
        var size = 200 + Math.random() * 200;

        Object.assign(im.style, {
            position: "fixed",
            top: "-400px",
            left: Math.random() * innerWidth + "px",
            width: size + "px",
            height: size + "px",
            transition:
                "top " + (6 + Math.random() * 4) + "s linear, left " + (6 + Math.random() * 4) + "s ease-in-out, opacity 1s",
            zIndex: 2147483646,
            pointerEvents: "none",
            filter: "drop-shadow(0 0 15px #000)"
        });

        document.body.appendChild(im);
        fall.push(im);

        setTimeout(() => {
            im.style.top = (innerHeight - size - 20) + "px";
            im.style.left = Math.random() * (innerWidth - 200) + "px";
        }, 100 + Math.random() * 800);
    })(i);

    for (var j = 0; j < 20; j++) (function (j) {
        var f = document.createElement("img");
        f.src = s[Math.floor(Math.random() * s.length)];
        var sz = 120 + Math.random() * 120;

        Object.assign(f.style, {
            position: "fixed",
            top: "0px",
            left: "0px",
            width: sz + "px",
            height: sz + "px",
            zIndex: 2147483645,
            opacity: 0.95,
            pointerEvents: "none"
        });

        document.body.appendChild(f);
        followers.push({ el: f, x: innerWidth / 2, y: innerHeight / 2 });
    })(j);

    var mx = innerWidth / 2,
        my = innerHeight / 2;

    document.addEventListener("mousemove", e => {
        mx = e.clientX;
        my = e.clientY;
    });

    var moveInt = setInterval(() => {
        followers.forEach((f, i) => {
            f.x += (mx - f.x) * 0.05;
            f.y += (my - f.y) * 0.05;
            var ox = Math.sin(i) * 40,
                oy = Math.cos(i) * 40;
            f.el.style.transform = "translate(" + (f.x + ox) + "px," + (f.y + oy) + "px)";
        });
    }, 30);

    setTimeout(() => {
        d.style.opacity = "0";
        fall.concat(followers.map(f => f.el)).forEach(el => el.style.opacity = "0");

        setTimeout(() => {
            fall.concat(followers.map(f => f.el)).forEach(el => {
                try { el.remove(); } catch (e) { }
            });

            clearInterval(moveInt);

            saved.forEach(item => {
                try { item.n.nodeValue = item.v; } catch (e) { }
            });

            elmMap.forEach((v, k) => {
                if (v === null) k.removeAttribute("style");
                else k.setAttribute("style", v);
            });

            flicker.remove();

            var ghost = document.createElement("img");
            ghost.src = s[Math.floor(Math.random() * s.length)];
            Object.assign(ghost.style, {
                position: "fixed",
                bottom: "20px",
                right: "20px",
                width: "150px",
                height: "150px",
                opacity: "0.8",
                zIndex: 2147483647,
                transition: "opacity 5s"
            });

            document.body.appendChild(ghost);
            setTimeout(() => ghost.style.opacity = "0", 500);
            setTimeout(() => ghost.remove(), 6000);

        }, 1200);
    }, 12000);

})();
