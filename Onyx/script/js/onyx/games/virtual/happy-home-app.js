import OnyxVirtualBrain from "./virtual-brain-bridge.js";

const $ = selector => document.querySelector(selector);
const transcript = $("#onyx-transcript");
const form = $("#onyx-chat-form");
const input = $("#onyx-message");
const send = $("#onyx-send");
const statusText = $("#onyx-status-text");
const statusDot = $("#onyx-status-dot");

function addMessage(role, text) {
  const row = document.createElement("article");
  row.className = `onyx-message onyx-message--${role}`;
  const label = document.createElement("strong");
  label.textContent = role === "user" ? "You" : "Onyx";
  const body = document.createElement("p");
  body.textContent = String(text || "");
  row.append(label, body);
  transcript.append(row);
  row.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

function setBusy(busy) {
  input.disabled = busy;
  send.disabled = busy;
  send.textContent = busy ? "Thinking…" : "Send";
}

OnyxVirtualBrain.subscribe(status => {
  const ready = status.online && status.authenticated;
  statusDot.dataset.state = ready ? "ready" : status.online ? "public" : "offline";
  statusText.textContent = ready
    ? "Onyx Core connected"
    : status.online
      ? "Backend online — sign in through OurSpace to chat"
      : status.lastError || "Checking Onyx Core…";
});

OnyxVirtualBrain.observe("virtual.room.enter", { room: "base-room", source: "happy-home-runtime-harness" });

form?.addEventListener("submit", async event => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  addMessage("user", message);
  input.value = "";
  setBusy(true);
  try {
    const result = await OnyxVirtualBrain.talk(message, {
      room: "base-room",
      gameState: { mode: "chat", shell: "happy-home" }
    });
    addMessage("onyx", result.response || "I’m here, but I did not receive a text response.");
  } catch (error) {
    addMessage("onyx", /session|sign.?in|auth/i.test(String(error?.message || error))
      ? "I can see the house, but I need your existing OurSpace sign-in before I can use my full brain."
      : "My brain link hit a snag. Please try that again in a moment.");
  } finally {
    setBusy(false);
    input.focus();
  }
});

OnyxVirtualBrain.connect({ includeCapabilities: true }).catch(() => {});
