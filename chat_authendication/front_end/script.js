const socket = new WebSocket("ws://localhost:3000/ws");

// Elements
const authContainer = document.getElementById("auth-container");
const chatContainer = document.getElementById("chat-container");
const loginButton = document.getElementById("login-button");
const signupButton = document.getElementById("signup-button");
const toggleAuth = document.getElementById("toggle-auth");
const logoutButton = document.getElementById("logout-button");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

let username = "";
let token = "";

// API URL
const API_URL = "http://localhost:3000";

// Toggle login/signup
toggleAuth.addEventListener("click", () => {
  document.getElementById("login-box").classList.toggle("hidden");
  document.getElementById("signup-box").classList.toggle("hidden");
  toggleAuth.innerHTML = toggleAuth.innerText.includes("Sign Up")
    ? "Already have an account? <span>Login</span>"
    : "Don't have an account? <span>Sign Up</span>";
});

// Login
loginButton.addEventListener("click", async () => {
  username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await axios.post(`${API_URL}/api/login`, {
      username,
      password,
    });
    if (response.data.success) {
      token = response.data.token;
      authContainer.classList.add("hidden");
      chatContainer.classList.remove("hidden");
    } else {
      alert("Invalid login credentials");
    }
  } catch (error) {
    console.error(error);
    alert("Error during login. Please try again.");
  }
});

// Signup
signupButton.addEventListener("click", async () => {
  const newUsername = document.getElementById("new-username").value;
  const newPassword = document.getElementById("new-password").value;

  try {
    const response = await axios.post(`${API_URL}/api/signup`, {
      username: newUsername,
      password: newPassword,
    });
    if (response.data.success) {
      alert("Signup successful! Please login.");
      toggleAuth.click();
    } else {
      alert(response.data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Error during signup. Please try again.");
  }
});

// Logout
logoutButton.addEventListener("click", () => {
  authContainer.classList.remove("hidden");
  chatContainer.classList.add("hidden");
  socket.close();
});

// WebSocket message handling
socket.onmessage = (event) => {
  const messageData = JSON.parse(event.data);
  const message = document.createElement("p");
  message.textContent = messageData.text;
  message.classList.add("message");
  if (messageData.sender === username) {
    message.classList.add("sender");
  }
  messagesDiv.appendChild(message);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

// Sending messages
sendButton.addEventListener("click", () => {
  const text = messageInput.value.trim();

  if (text !== "") {
    socket.send(
      JSON.stringify({
        sender: username,
        text,
        token,
      })
    );

    messageInput.value = ""; // Clear input field
  }
});
