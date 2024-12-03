const socket = new WebSocket("ws://localhost:8080/chat");

const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const logoutButton = document.getElementById("logoutButton");
const translateTo = document.getElementById("translate-to");

let username = localStorage.getItem("username");
let token = localStorage.getItem("token");

if (!username || !token) {
  window.location.href = "index.html"; // Redirect to login page if not authenticated
}

// WebSocket message handling
socket.onmessage = (event) => {
  const messageData = JSON.parse(event.data);
  const message = document.createElement("p");
  message.textContent = `${messageData.sender}: ${messageData.text}`;
  message.classList.add("message");
  messagesDiv.appendChild(message);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

// Send message with translation if selected
sendButton.addEventListener("click", async () => {
  const text = messageInput.value.trim();
  const lang = translateTo.value;

  if (text !== "") {
    let translatedText = text;

    // Simulate translation API
    if (lang !== "none") {
      const response = await axios.post("/api/translate", { text, lang });
      translatedText = response.data.translatedText;
    }

    socket.send(
      JSON.stringify({
        sender: username,
        text: translatedText,
        token,
      })
    );

    messageInput.value = ""; // Clear input field
  }
});

// Logout
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("username");
  localStorage.removeItem("token");
  socket.close();
  window.location.href = "index.html"; // Redirect to login page
});
