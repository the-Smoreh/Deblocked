(function () {
  const win = window.open("about:blank", "_blank");
  if (!win) {
    console.error("Popup blocked. Enable popups.");
    return;
  }

  // Copy the full HTML of the current page
  const html = document.documentElement.outerHTML;

  // Write it into the about:blank window
  win.document.open();
  win.document.write(html);
  win.document.close();
})();
