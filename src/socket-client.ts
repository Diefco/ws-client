import { Manager, Socket } from "socket.io-client";

let socket: Socket;

export const connectToServer = (token: string) => {
  const manager = new Manager("http://localhost:3000/socket.io/socket.io.js", {
    extraHeaders: {
      authentication: token,
    },
  });

  socket?.removeAllListeners();
  socket = manager.socket("/"); // coneccted to root namespace

  addListeners();
};

const addListeners = () => {
  const clientsUL = document.querySelector<HTMLSpanElement>("#clients-ul")!;
  const messageForm = document.querySelector<HTMLFormElement>("#message-form")!;
  const messageInput =
    document.querySelector<HTMLInputElement>("#message-input")!;
  const messagesUL = document.querySelector<HTMLUListElement>("#messages-ul")!;
  const serverStatusLabel = document.querySelector("#server-status")!;

  socket.on("connect", () => {
    serverStatusLabel.textContent = "Online";
  });

  socket.on("disconnect", () => {
    serverStatusLabel.textContent = "Disconnected";
  });

  socket.on("clients-updated", (clients: string[]) => {
    let clientsHTML = "";
    clients.forEach((clientId) => {
      clientsHTML += `<li>${clientId}</li>`;
    });

    clientsUL.innerHTML = clientsHTML;
  });

  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (messageInput.value.trim().length === 0) return;

    socket.emit("message-from-client", {
      id: "Me:",
      message: messageInput.value,
    });

    messageInput.value = "";
  });

  socket.on(
    "message-from-server",
    (payload: { fullName: string; message: string }) => {
      const newMessage = `<li><strong>${payload.fullName}</strong>: <span>${payload.message}</span></li>`;
      const li = document.createElement("li");
      li.innerHTML = newMessage;
      messagesUL.appendChild(li);
    }
  );
};
