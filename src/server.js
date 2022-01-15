import { Server } from "socket.io";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv-defaults";
import express from "express";
import init from "./init.js";
import Game from "../models/game.js";
import { User } from "../models/user.js";
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://epedemic.herokuapp.com",
    methods: ["GET", "POST"],
  },
});

const db = mongoose.connection;

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.once("open", () => {
  console.log("MongoDB connected");
  io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("getMessage", (arg) => {
      console.log(arg);
    });
    socket.on("room", async (roomId) => {
      console.log(roomId);
      socket.join(roomId);
      const game = await Game.findOne({ id: roomId });
      console.log("Hello");
      if (!game) {
        return;
      }
      const { players, difficulty } = game;
      io.emit("room", { players, difficulty });
    });
    socket.on("joinRoom", async ({ userId, roomId }) => {
      console.log("joinRoom");
      console.log(userId);
      const game = await Game.findOne({ id: roomId });
      const user = await User.findOne({ userId: userId });
      if (userId === null) {
        console.log("Player not login yet");
        io.emit("addRoom", { msg: "failed", gameId: "" });
        return;
      }
      if (game.players.length < 4) {
        if (user.gameId === "") {
          socket.join(roomId);

          console.log("successful join room");
          io.emit("addRoom", { msg: "successful", gameId: roomId });
          game.players.push({ playerId: userId, playerHand: [], playerJob: 0 });
          console.log(game);
          game.save();
          user.gameId = roomId;
          user.save();
          const { player, difficulty } = game;
          io.to(roomId).emit("room", { player, difficulty });
        } else {
          console.log("Player already in game");
          io.emit("addRoom", { msg: "failed", gameId: "" });
        }
      } else {
        console.log("Player already full");
        io.emit("addRoom", { msg: "failed", gameId: "" });
      }
    });
    socket.on("queryGame", async (gameId) => {
      console.log("data queried");
      console.log(gameId);
      const data = await Game.findOne({ id: gameId });
      if (!data) {
        return;
      }
      console.log(data);
      io.emit("gameDetail", data);
    });
    socket.on("startGame", (gameId) => {
      console.log("game has started");
      const data = init(gameId);
      io.to(gameId).emit("gameStarted");
      //io.emit("gameDetail", data);
    });
    socket.on("disconnect", (socket) => {
      console.log("a user disconnected");
    });
  });
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}.`);
  });
});
