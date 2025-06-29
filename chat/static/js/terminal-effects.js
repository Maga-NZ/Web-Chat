
const keySound = new Audio("/static/chat/sounds/key.wav");
const enterSound = new Audio("/static/chat/sounds/enter.wav");

document.getElementById("chat-message-input").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") {
    keySound.currentTime = 0;
    keySound.play();
  }
});

document.getElementById("chat-form").addEventListener("submit", (e) => {
  enterSound.currentTime = 0;
  enterSound.play();
});
