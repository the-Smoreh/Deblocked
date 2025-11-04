(function ghostOverlay() {
  if (window.__ghostOverlayActive) {
    window.__ghostOverlayCleanup();
  }

  window.__ghostOverlayActive = true;

  let state = {
    opacity: 0.7,
    iframe: null,
    ui: null,
    clicksEnabled: true
  };

  const style = document.createElement("style");
  style.textContent = `
    @keyframes ghostFadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    #ghostOverlayUI {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 2147483647;
      background: rgba(18,18,18,0.9);
      color: #fff;
      padding: 24px 28px;
      border-radius: 16px;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 10px 50px rgba(0,0,0,0.6);
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      animation: ghostFadeIn 0.25s ease;
      width: min(400px, 90vw);
    }

    #ghostOverlayUI h2 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
      letter-spacing: 0.3px;
    }

    #ghostOverlayUI p {
      font-size: 13px;
      text-align: center;
      opacity: 0.75;
      margin: 0 0 14px 0;
    }

    #ghostOverlayUI input {
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      border: none;
      background: rgba(255,255,255,0.12);
      color: #fff;
      font-size: 14px;
      outline: none;
      transition: background 0.2s;
    }
    #ghostOverlayUI input:focus {
      background: rgba(255,255,255,0.18);
    }

    #ghostOverlayUI .buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 16px;
      gap: 10px;
    }

    #ghostOverlayUI button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 8px;
      background: rgba(255,255,255,0.15);
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s, transform 0.15s;
    }

    #ghostOverlayUI button:hover {
      background: rgba(255,255,255,0.25);
      transform: translateY(-1px);
    }

    #ghostIframe {
      position: fixed;
      z-index: 2147483646;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      transition: opacity 0.2s ease;
    }
  `;
  document.head.appendChild(style);

  const ui = document.createElement("div");
  ui.id = "ghostOverlayUI";
  ui.innerHTML = `
    <h2>Ghost Overlay</h2>
    <p>Enter a website URL to overlay on top of this page.</p>
    <input type="text" id="ghostURL" placeholder="https://example.com" />
    <div class="buttons">
      <button id="ghostPlace">Ghostify</button>
      <button id="ghostCancel">Cancel</button>
    </div>
  `;
  document.body.appendChild(ui);
  state.ui = ui;

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
    iframe.style.pointerEvents = "auto"; // focus on ghost site by default
    document.body.appendChild(iframe);
    state.iframe = iframe;

    // Hide UI instantly after placing
    ui.remove();

    window.addEventListener("keydown", keyHandler);
  }

  function changeOpacity(delta) {
    state.opacity = Math.min(1, Math.max(0, state.opacity + delta));
    if (state.iframe) state.iframe.style.opacity = state.opacity;
  }

  function keyHandler(e) {
    if (!state.iframe) return;
    if (e.key === "+" || e.key === "=") changeOpacity(+0.05);
    else if (e.key === "-") changeOpacity(-0.05);
    else if (e.key === "Escape") cleanup();
  }

  function cleanup() {
    if (state.iframe) state.iframe.remove();
    if (state.ui) state.ui.remove();
    style.remove();
    window.removeEventListener("keydown", keyHandler);
    window.__ghostOverlayActive = false;
    console.log("[GhostOverlay] Removed.");
  }

  window.__ghostOverlayCleanup = cleanup;
})();
