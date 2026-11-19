/* LifeHelpers Arcade frontend only. Backend remains in Google Apps Script. */
(function () {
  "use strict";
  var API = "https://script.google.com/macros/s/AKfycbyxsptgvg8VnNuuqvxBbFPkGZSq2PJjEB5bvFN0R0NvorCcEpLIuKk133jVztnMJGxc/exec";
  var ROOT = "lh-arcade-cloud-v1:";
  var tokenKey = ROOT + "pairing";
  var deviceKey = ROOT + "device";
  var frame = document.getElementById("gameFrame");
  var statusEl = document.getElementById("cloudStatus");
  var codeEl = document.getElementById("pairingCode");
  var pairInput = document.getElementById("cloudPairInput");
  var savesEl = document.getElementById("cloudSaveList");
  var installButton = document.getElementById("downloadAppButton");
  var installHelp = document.getElementById("installHelp");
  var installText = document.getElementById("installHelpText");
  var pendingInstall = null;
  var activeGame = "";
  var activeState = {};
  var revisions = {};
  var flushing = false;
  var queuedTimer = null;
  var serial = 0;
  var token = "";
  try { token = localStorage.getItem(tokenKey) || ""; } catch (_) {}
  var device = "";
  try {
    device = localStorage.getItem(deviceKey) || "";
    if (!device) {
      device = "device_" + randomHex(12);
      localStorage.setItem(deviceKey, device);
    }
  } catch (_) { device = "device_" + randomHex(12); }

  function randomHex(n) {
    var a = new Uint8Array(n);
    crypto.getRandomValues(a);
    return Array.from(a, function (b) { return b.toString(16).padStart(2, "0"); }).join("");
  }
  function setStatus(message, error) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.dataset.state = error ? "error" : "ok";
  }
  function normalizedToken(input) {
    var match = String(input || "").toUpperCase().replace(/[\s-]/g, "");
    return /^ARC[A-F0-9]{32}$/.test(match) ? "ARC-" + match.slice(3) : null;
  }
  function remoteError(res) {
    return new Error((res && (res.error || res.code)) || "Cloud service did not respond.");
  }
  function read(action, params) {
    return new Promise(function (resolve, reject) {
      var name = "lhArcadeCB" + (++serial) + "_" + Date.now();
      var script = document.createElement("script");
      var complete = false;
      var timer;
      function cleanup() {
        if (complete) return false;
        complete = true;
        clearTimeout(timer);
        delete window[name];
        script.remove();
        return true;
      }
      window[name] = function (res) {
        if (!cleanup()) return;
        if (!res || !res.ok) reject(remoteError(res));
        else resolve(res);
      };
      var url = new URL(API);
      url.searchParams.set("action", action);
      url.searchParams.set("callback", name);
      Object.keys(params || {}).forEach(function (key) {
        if (params[key] != null) url.searchParams.set(key, String(params[key]));
      });
      script.referrerPolicy = "no-referrer";
      script.async = true;
      script.src = url.toString();
      script.onerror = function () { if (cleanup()) reject(new Error("Cannot reach cloud saves.")); };
      timer = setTimeout(function () { if (cleanup()) reject(new Error("Cloud request timed out.")); }, 14000);
      document.head.appendChild(script);
    });
  }
  async function write(data) {
    if (!navigator.onLine) throw new Error("Offline. Progress remains on this device.");
    await fetch(API, {
      method: "POST",
      mode: "no-cors",
      cache: "no-store",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(data)
    });
    /* Apps Script cross-origin responses are opaque: verify via a later read. */
  }
  function delay(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }
  async function readEventually(action, params, predicate) {
    var result;
    for (var n = 0; n < 4; n++) {
      try {
        result = await read(action, params);
        if (!predicate || predicate(result)) return result;
      } catch (error) { if (n === 3) throw error; }
      await delay(900 + n * 400);
    }
    throw new Error("The cloud write could not be confirmed; please retry.");
  }
  function setToken(value) {
    token = value;
    localStorage.setItem(tokenKey, token);
    showCode();
  }
  function showCode() {
    if (codeEl) codeEl.value = token || "";
    var connected = !!token;
    document.querySelectorAll("[data-cloud-connected]").forEach(function (element) {
      element.hidden = !connected;
    });
    if (!connected && savesEl) savesEl.textContent = "Link a profile to see saved games.";
  }
  async function createProfile() {
    if (token) return setStatus("This device is already linked. Unlink first to switch profiles.");
    var candidate = "ARC-" + randomHex(16).toUpperCase();
    setStatus("Creating a private save profile…");
    try {
      await write({ action: "register", token: candidate, label: "Arcade Player" });
      await readEventually("profile", { token: candidate });
      setToken(candidate);
      setStatus("Cloud saves connected. Keep your pairing code private.");
      await refreshSaves();
    } catch (error) { setStatus(error.message, true); }
  }
  async function linkProfile() {
    var candidate = normalizedToken(pairInput && pairInput.value);
    if (!candidate) return setStatus("Enter a code starting ARC- followed by 32 hexadecimal characters.", true);
    setStatus("Linking to cloud saves…");
    try {
      await read("profile", { token: candidate });
      setToken(candidate);
      if (pairInput) pairInput.value = "";
      setStatus("This device is linked. Open a game to restore compatible saves.");
      await refreshSaves();
    } catch (error) { setStatus(error.message, true); }
  }
  function unlink() {
    if (!confirm("Unlink this device? Cloud saves will remain stored, but keep your pairing code to reconnect.")) return;
    token = "";
    try { localStorage.removeItem(tokenKey); } catch (_) {}
    revisions = {};
    showCode();
    setStatus("This device is unlinked. Local game saves have not been deleted.");
  }
  async function refreshSaves() {
    if (!token) return;
    try {
      var result = await read("list", { token: token });
      if (!savesEl) return;
      savesEl.replaceChildren();
      if (!result.saves.length) {
        savesEl.textContent = "No cloud saves yet. Play a game that saves to localStorage or uses the arcade save bridge.";
        return;
      }
      result.saves.forEach(function (save) {
        var line = document.createElement("div");
        line.className = "cloud-save-row";
        var text = document.createElement("span");
        text.textContent = save.gameId + " · " + save.slot + " · rev " + save.revision;
        var remove = document.createElement("button");
        remove.type = "button";
        remove.className = "dark";
        remove.textContent = "Delete";
        remove.addEventListener("click", async function () {
          if (!confirm("Delete the cloud save for " + save.gameId + " (" + save.slot + ")?")) return;
          remove.disabled = true;
          try {
            await write({ action: "delete", token: token, gameId: save.gameId,
              slot: save.slot, expectedRevision: save.revision });
            await readEventually("list", { token: token }, function (r) {
              return !r.saves.some(function (s) {
                return s.gameId === save.gameId && s.slot === save.slot;
              });
            });
            setStatus("Cloud save deleted. Local browser data is unchanged.");
          } catch (error) { setStatus(error.message, true); }
          await refreshSaves();
        });
        line.append(text, remove);
        savesEl.appendChild(line);
      });
    } catch (error) { setStatus(error.message, true); }
  }
  function pendingKey(gameId, slot) { return ROOT + "pending:" + encodeURIComponent(gameId) + ":" + slot; }
  function getPending(gameId, slot) {
    try { return JSON.parse(localStorage.getItem(pendingKey(gameId, slot)) || "null"); }
    catch (_) { return null; }
  }
  function stage(gameId, slot, state) {
    var raw = JSON.stringify(state);
    if (raw.length > 27000) {
      setStatus("This game's save is too large for cloud storage. Local save remains available.", true);
      return;
    }
    try {
      localStorage.setItem(pendingKey(gameId, slot), JSON.stringify({
        gameId: gameId, slot: slot, state: state, writeId: "write_" + randomHex(12)
      }));
    } catch (error) {
      setStatus("Device storage is unavailable; cloud save was not queued.", true);
      return;
    }
    setStatus("Progress saved on this device; waiting to sync.");
    if (queuedTimer) clearTimeout(queuedTimer);
    queuedTimer = setTimeout(flush, 2200);
  }
  async function flush() {
    if (flushing || !token || !navigator.onLine) return;
    flushing = true;
    try {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(ROOT + "pending:") === 0) keys.push(k);
      }
      for (var j = 0; j < keys.length; j++) {
        var pending = JSON.parse(localStorage.getItem(keys[j]) || "null");
        if (!pending) continue;
        var which = pending.gameId + "|" + pending.slot;
        var cloud = await read("load", { token: token, gameId: pending.gameId, slot: pending.slot });
        var expected = Object.prototype.hasOwnProperty.call(revisions, which) ?
          revisions[which] : cloud.revision;
        /* Never force an outdated revision over newer progress from another device. */
        if (expected !== cloud.revision) {
          setStatus("Cloud progress changed on another device. Close and reopen that game to review it.", true);
          continue;
        }
        await write({ action: "save", token: token, gameId: pending.gameId,
          slot: pending.slot, state: pending.state, expectedRevision: expected,
          deviceId: device, writeId: pending.writeId });
        var verified = await readEventually("load", {
          token: token, gameId: pending.gameId, slot: pending.slot
        }, function (r) { return r.found && r.writeId === pending.writeId; });
        revisions[which] = verified.revision;
        var latest = JSON.parse(localStorage.getItem(keys[j]) || "null");
        if (latest && latest.writeId === pending.writeId) localStorage.removeItem(keys[j]);
        setStatus("Cloud save synchronized.");
      }
      await refreshSaves();
    } catch (error) {
      setStatus("Saved locally. Cloud sync needs attention: " + error.message, true);
    } finally {
      flushing = false;
    }
  }
  function gameIdAllowed(gameId) {
    return /^(Both|Desktop)\/[A-Za-z0-9 _()'.,-]+(?:\/[A-Za-z0-9 _()'.,-]+)*\.html$/.test(gameId);
  }
  function safeKey(key) {
    return typeof key === "string" && key.length < 150 &&
      !/password|passphrase|private|secret|bearer|credential|auth|token|cookie|session|jwt|api.?key/i.test(key) &&
      key.indexOf(ROOT) !== 0 && key.indexOf("lifehelpers-arcade") !== 0;
  }
  async function beforeGameLoad(gameId) {
    activeGame = gameId;
    activeState = {};
    if (!gameIdAllowed(gameId) || !token || !navigator.onLine) return;
    try {
      var cloud = await read("load", { token: token, gameId: gameId, slot: "main" });
      revisions[gameId + "|main"] = cloud.revision;
      if (getPending(gameId, "main")) {
        setStatus("Unsynced local progress exists. Preserving it instead of restoring an older save.");
        return;
      }
      if (cloud.found && cloud.state && cloud.state.kind === "localstorage-v1" &&
          cloud.state.entries && typeof cloud.state.entries === "object") {
        activeState = Object.assign({}, cloud.state.entries);
        Object.keys(activeState).forEach(function (key) {
          if (!safeKey(key)) return;
          try {
            if (activeState[key] === null) localStorage.removeItem(key);
            else if (typeof activeState[key] === "string") localStorage.setItem(key, activeState[key]);
          } catch (_) {}
        });
        setStatus("Compatible browser progress restored from cloud.");
      }
    } catch (error) { setStatus("Cloud restore unavailable: " + error.message, true); }
  }
  function onStorage(e) {
    if (!token || !activeGame || e.storageArea !== localStorage || !safeKey(e.key)) return;
    try {
      var url = new URL(e.url);
      var gameUrl = new URL(activeGame, location.href);
      if (url.origin !== location.origin || url.pathname !== gameUrl.pathname) return;
      if (e.newValue !== null && e.newValue.length > 24000) return;
      activeState[e.key] = e.newValue;
      stage(activeGame, "main", { kind: "localstorage-v1", entries: activeState });
    } catch (_) {}
  }
  async function save(gameId, state, slot) {
    slot = slot || "main";
    if (!token) throw new Error("Link a cloud profile first.");
    if (!gameIdAllowed(gameId) || !/^[A-Za-z0-9_.-]{1,48}$/.test(slot)) throw new Error("Invalid game or slot.");
    stage(gameId, slot, state);
    await flush();
  }
  async function load(gameId, slot) {
    if (!token) return null;
    var result = await read("load", { token: token, gameId: gameId, slot: slot || "main" });
    revisions[gameId + "|" + (slot || "main")] = result.revision;
    return result.found ? result.state : null;
  }
  /* Games explicitly adapted to the bridge may request/submit per-game JSON via messages. */
  window.addEventListener("message", async function (e) {
    if (e.origin !== location.origin || e.source !== frame.contentWindow) return;
    var message = e.data;
    if (!message || message.source !== "lifehelpers-arcade-save-v1" ||
        message.gameId !== activeGame || !gameIdAllowed(activeGame)) return;
    try {
      if (message.type === "save") await save(activeGame, message.state, message.slot);
      if (message.type === "load") {
        var state = await load(activeGame, message.slot);
        frame.contentWindow.postMessage({ source: "lifehelpers-arcade-save-v1",
          type: "load-result", gameId: activeGame, slot: message.slot || "main", state: state }, location.origin);
      }
    } catch (error) { setStatus(error.message, true); }
  });
  window.addEventListener("storage", onStorage);
  window.addEventListener("online", flush);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") flush();
  });
  if (frame) frame.addEventListener("load", function () {
    if (!activeGame || !token) return;
    /* Adapted games receive a signal after the iframe is ready. */
    try { frame.contentWindow.postMessage({ source: "lifehelpers-arcade-save-v1",
      type: "ready", gameId: activeGame }, location.origin); } catch (_) {}
  });

  function installInstructions() {
    var ua = navigator.userAgent || "";
    var ios = /iPhone|iPad|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    var mac = /Macintosh|Mac OS X/.test(ua) && !ios;
    var android = /Android/.test(ua);
    if (ios) return "On iPhone or iPad: open this page in Safari, tap Share, choose Add to Home Screen, then Add / Open as Web App. Tap the new Arcade icon to play.";
    if (mac) return "On Mac: in Safari choose File → Add to Dock; or in Chrome/Edge use Install app from the browser menu. Open LifeHelpers Arcade from your Dock or Applications.";
    if (android) return "On Android: open this page in Chrome or another compatible browser, tap the browser menu, then Install app or Add to Home screen. Open it from the new Arcade icon.";
    return "In Chrome or Edge on Windows or desktop: use the Install icon in the address bar, or open the browser menu and choose Install LifeHelpers Arcade / Apps → Install this site as an app. Launch from your desktop, Start menu, or app launcher.";
  }
  function toggleInstallHelp() {
    if (!installHelp) return;
    installHelp.hidden = !installHelp.hidden;
    if (installText) installText.textContent = installInstructions();
  }
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    pendingInstall = e;
    if (installButton) installButton.textContent = "Download App";
  });
  window.addEventListener("appinstalled", function () {
    pendingInstall = null;
    if (installHelp) installHelp.hidden = true;
    if (installButton) installButton.textContent = "App Installed";
  });
  if (installButton) installButton.addEventListener("click", async function () {
    if (pendingInstall) {
      var prompt = pendingInstall;
      pendingInstall = null;
      try { await prompt.prompt(); await prompt.userChoice; }
      catch (_) { toggleInstallHelp(); }
    } else toggleInstallHelp();
  });
  if (document.getElementById("installHelpClose")) {
    document.getElementById("installHelpClose").addEventListener("click", function () {
      installHelp.hidden = true;
    });
  }
  if (document.getElementById("cloudCreateButton")) document.getElementById("cloudCreateButton").addEventListener("click", createProfile);
  if (document.getElementById("cloudLinkButton")) document.getElementById("cloudLinkButton").addEventListener("click", linkProfile);
  if (document.getElementById("cloudUnlinkButton")) document.getElementById("cloudUnlinkButton").addEventListener("click", unlink);
  if (document.getElementById("cloudRefreshButton")) document.getElementById("cloudRefreshButton").addEventListener("click", refreshSaves);
  if (document.getElementById("cloudCopyButton")) document.getElementById("cloudCopyButton").addEventListener("click", async function () {
    if (!token) return;
    try { await navigator.clipboard.writeText(token); setStatus("Pairing code copied. Keep it private."); }
    catch (_) { setStatus("Select and copy the code manually.", true); }
  });
  if (document.getElementById("cloudShowButton")) document.getElementById("cloudShowButton").addEventListener("click", function () {
    if (!codeEl) return;
    codeEl.type = codeEl.type === "password" ? "text" : "password";
    this.textContent = codeEl.type === "password" ? "Show" : "Hide";
  });
  if (navigator.serviceWorker && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(function (error) {
        console.warn("Arcade app offline shell unavailable:", error);
      });
    });
  }
  window.LifeHelpersArcadeCloud = Object.freeze({
    beforeGameLoad: beforeGameLoad, save: save, load: load,
    refresh: refreshSaves, sync: flush,
    get connected() { return !!token; }
  });
  showCode();
  if (token) {
    setStatus("Cloud profile linked on this device.");
    refreshSaves();
    flush();
  } else setStatus("Cloud saves are optional. Create a profile or link another device.");
})();
