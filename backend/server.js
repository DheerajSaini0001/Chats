const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const streamRoutes = require("./routes/streamRoutes");
const statusRoutes = require("./routes/statusRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

connectDB();
const app = express();

app.use(express.json()); // to accept json data
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/status", statusRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "/frontend/dist")));

    app.get("*", (req, res) =>
        res.sendFile(path.resolve(__dirname1, "frontend", "dist", "index.html"))
    );
} else {
    app.get("/", (req, res) => {
        res.send("API is running..");
    });
}

// --------------------------deployment------------------------------

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

const server = app.listen(
    PORT,
    console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:5174",
        // credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing", room));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing", room));

    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved);
        });
    });

    socket.on("call started", (data) => {
        var chat = data.chat;
        var caller = data.caller;
        var callType = data.callType;

        if (!chat.users) return;

        chat.users.forEach((user) => {
            if (user._id == caller._id) return;
            socket.in(user._id).emit("incoming call", { chat, caller, callType });
        });
    });

    socket.on("message deleted", (deletedMessage) => {
        var chat = deletedMessage.chat;
        if (!chat.users) return;
        chat.users.forEach((user) => {
            if (user._id == deletedMessage.sender._id) return;
            socket.in(user._id).emit("message deleted", deletedMessage);
        });
    });

    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id);
    });
});
