import OnyxVirtualBrain from "./virtual-brain-bridge.js";

const $ = selector => document.querySelector(selector);
const transcript = $("#onyx-transcript");
const form = $("#onyx-chat-form");
const input = $("#onyx-message");
const send = $("#onyx-send");
const statusText = $("#onyx-status-text");
const statusDot = $("#onyx-status-dot");
let transportStatus = { online: false, authenticated: false, lastError: "" };
let llmStatus = { verified: false };

function renderStatus() {
  const ready = transportStatus.online && transportStatus.authenticated && llmStatus.verified;
  statusDot.dataset.state = ready ? "ready" : transportStatus.online ? "public" : "offline";
  statusText.textContent = ready
    ? "Onyx LLM connected"
    : transportStatus.online && transportStatus.authenticated
      ? "Backend online — LLM verification pending"
      : transportStatus.online
        ? "Backend online — sign in through OurSpace to chat"
        : transportStatus.lastError || "Checking Onyx LLM…";
}

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
  transportStatus = status;
  renderStatus();
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
    if (result.llmVerified !== true) throw new Error("Onyx response did not include LLM proof.");
    addMessage("onyx", result.response);
  } catch (error) {
    addMessage("onyx", /session|sign.?in|auth/i.test(String(error?.message || error))
      ? "I can see the house, but I need your existing OurSpace sign-in before I can use my full brain."
      : "My brain link hit a snag. Please try that again in a moment.");
  } finally {
    setBusy(false);
    input.focus();
  }
});

OnyxVirtualBrain.connect({ includeCapabilities: true, requireLLM: true })
  .then(result => { llmStatus = result.llm; renderStatus(); })
  .catch(() => {});

