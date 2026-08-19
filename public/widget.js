(function () {
  var script = document.currentScript;
  var org = script && script.getAttribute("data-org");
  if (!org) return;
  var src = script.src.replace(/\/widget\.js.*$/, "");
  var btn = document.createElement("button");
  btn.setAttribute("aria-label", "Open AI Sales Agent");
  btn.style.cssText =
    "position:fixed;right:16px;bottom:16px;z-index:2147483000;border:0;border-radius:999px;padding:12px 16px;font:600 14px system-ui;background:#14b8a6;color:#042f2e;box-shadow:0 8px 24px rgba(0,0,0,.25);cursor:pointer;";
  btn.textContent = "Chat";
  var frame = document.createElement("iframe");
  frame.src = src + "/w/" + encodeURIComponent(org);
  frame.title = "AI Sales Agent";
  frame.style.cssText =
    "position:fixed;right:16px;bottom:72px;z-index:2147483000;width:360px;height:520px;max-width:calc(100vw - 24px);max-height:70vh;border:0;border-radius:20px;box-shadow:0 16px 50px rgba(0,0,0,.4);display:none;background:#0b1018;";
  var open = false;
  btn.onclick = function () {
    open = !open;
    frame.style.display = open ? "block" : "none";
  };
  document.body.appendChild(frame);
  document.body.appendChild(btn);
})();
