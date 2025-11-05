(function ghostOverlay() {
  if (window.__ghostOverlayActive) window.__ghostOverlayCleanup();
  window.__ghostOverlayActive = true;

  let state = {
    opacity: 0.7,
    iframe: null,
    mode: 2, // 1 = website, 2 = ghost, 3 = both
    accel: null
  };

  const style = document.createElement("style");
  style.textContent = `
    @keyframes ghostFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    #ghostOverlayUI {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2147483647;
      background: rgba(18,18,18,0.9);
      color: #fff;
      padding: 24px 28px;
      border-radius: 16px;
      backdrop-filter: blur(20px);
      box-shadow: 0 10px 50px rgba(0,0,0,0.6);
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      animation: ghostFadeIn 0.25s ease;
      width: min(400px, 90vw);
    }
    #ghostOverlayUI h2 {
      margin: 0 0 12px 0; font-size: 18px; font-weight: 600; text-align: center;
    }
    #ghostOverlayUI p {
      font-size: 13px; text-align: center; opacity: 0.75; margin: 0 0 14px 0;
    }
    #ghostOverlayUI input {
      width: 100%; padding: 10px 12px;
      border-radius: 8px; border: none;
      background: rgba(255,255,255,0.12);
      color: #fff; font-size: 14px; outline: none;
      transition: background 0.2s;
    }
    #ghostOverlayUI input:focus { background: rgba(255,255,255,0.18); }
    #ghostOverlayUI .buttons {
      display: flex; justify-content: space-between;
      margin-top: 16px; gap: 10px;
    }
    #ghostOverlayUI button {
      flex: 1; padding: 10px; border: none;
      border-radius: 8px; background: rgba(255,255,255,0.15);
      color: #fff; font-size: 14px; cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }
    #ghostOverlayUI button:hover {
      background: rgba(255,255,255,0.25);
      transform: translateY(-1px);
    }
    #ghostIframe {
      position: fixed;
      z-index: 2147483646;
      top: 0; left: 0; width: 100%; height: 100%;
      border: none; transition: opacity 0.2s ease;
    }
    #ghostIndicator {
      position: fixed;
      bottom: 10px; left: 12px;
      font-family: system-ui, sans-serif;
      font-size: 11px;
      color: white;
      background: rgba(0,0,0,0.5);
      padding: 4px 6px;
      border-radius: 6px;
      z-index: 2147483647;
      opacity: 0.6;
      pointer-events: none;
      user-select: none;
      transition: opacity 0.2s;
    }
  `;
  document.head.appendChild(style);

  const ui = document.createElement("div");
  ui.id = "ghostOverlayUI";
  ui.innerHTML = `
    <h2>Ghost Overlay</h2>
    <p>Enter a website URL to overlay on this page.</p>
    <input type="text" id="ghostURL" placeholder="https://example.com" />
    <div class="buttons">
      <button id="ghostPlace">Ghostify</button>
      <button id="ghostCancel">Cancel</button>
    </div>
  `;
  document.body.appendChild(ui);

  const input = ui.querySelector("#ghostURL");
  const btnPlace = ui.querySelector("#ghostPlace");
  const btnCancel = ui.querySelector("#ghostCancel");

  input.focus();
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") place();
    if (e.key === "Escape") cleanup();
  });
  btnPlace.onclick = place;
  btnCancel.onclick = cleanup;

  function place() {
    let url = input.value.trim();
    if (!url) return alert("Enter a URL!");
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    const iframe = document.createElement("iframe");
    iframe.id = "ghostIframe";
    iframe.src = url;
    iframe.style.opacity = state.opacity;
    iframe.style.pointerEvents = "auto";
    document.body.appendChild(iframe);
    state.iframe = iframe;
    ui.remove();

    createIndicator();
    updateMode();
    window.addEventListener("keydown", keyHandler);
    window.addEventListener("keyup", stopAccel);
  }

  function createIndicator() {
    const ind = document.createElement("div");
    ind.id = "ghostIndicator";
    document.body.appendChild(ind);
    state.indicator = ind;
    updateIndicator();
  }

  function updateIndicator() {
    if (!state.indicator) return;
    const modes = ["Website", "Ghost", "Both"];
    state.indicator.textContent =
      modes[state.mode - 1] +
      " • " +
      (state.opacity * 100).toFixed(2) +
      "%";
  }

  function changeOpacity(delta) {
    state.opacity = Math.min(1, Math.max(0, state.opacity + delta));
    if (state.iframe) state.iframe.style.opacity = state.opacity;
    updateIndicator();
  }

  // accelerate when holding + or -
  function startAccel(sign) {
    let speed = 0.001;
    stopAccel();
    function step() {
      changeOpacity(sign * speed);
      speed = Math.min(speed * 1.15, 0.05); // acceleration
      state.accel = requestAnimationFrame(step);
    }
    state.accel = requestAnimationFrame(step);
  }

  function stopAccel() {
    if (state.accel) cancelAnimationFrame(state.accel);
    state.accel = null;
  }

  function updateMode() {
    if (!state.iframe) return;
    switch (state.mode) {
      case 1:
        state.iframe.style.pointerEvents = "none"; // website only
        document.body.style.pointerEvents = "auto";
        break;
      case 2:
        state.iframe.style.pointerEvents = "auto"; // ghost only
        document.body.style.pointerEvents = "none";
        break;
      case 3:
        state.iframe.style.pointerEvents = "auto"; // both interactive
        document.body.style.pointerEvents = "auto";
        break;
    }
    updateIndicator();
  }

  function keyHandler(e) {
    if (!state.iframe) return;
    if (e.repeat) return; // ignore hold duplicates; accel handles that
    if (e.key === "+" || e.key === "=") startAccel(+1);
    else if (e.key === "-") startAccel(-1);
    else if (e.key === "1") { state.mode = 1; updateMode(); }
    else if (e.key === "2") { state.mode = 2; updateMode(); }
    else if (e.key === "3") { state.mode = 3; updateMode(); }
    else if (e.key === "Escape") cleanup();
  }

  function cleanup() {
    stopAccel();
    if (state.iframe) state.iframe.remove();
    if (state.indicator) state.indicator.remove();
    ui.remove();
    style.remove();
    window.removeEventListener("keydown", keyHandler);
    window.removeEventListener("keyup", stopAccel);
    window.__ghostOverlayActive = false;
  }

  window.__ghostOverlayCleanup = cleanup;
})();
