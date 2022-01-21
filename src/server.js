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
    socket.on("inviteJoinRoom", async ({ friendId, roomId }) => {
      console.log(`invite ${friendId} joinRoom`);
      //console.log(userId);
      const game = await Game.findOne({ id: roomId });
      const user = await User.findOne({ userId: friendId });
      if (friendId === null) {
        console.log("Player doesn't exist.");
        io.emit("addRoom", { msg: "failed", gameId: "" });
        return;
      }
      if (game.players.length < 4) {
        if (user.gameId === "") {
          console.log("succuessfully invite join room");
          socket.join(roomId);

          io.emit("addRoom", { msg: "successful", gameId: roomId });
          game.players.push({
            playerId: friendId,
            playerHand: [],
            playerJob: 0,
          });
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
    socket.on("move", async ({ gameId, city }) => {
      console.log("move");
      const data = await Game.findOne({ id: gameId });
      if (!data) {
        return;
      }
      console.log(data);
      if (data.leftMove === 1) {
        data.players[data.who].pos = city;
        data.leftMove = 4;
        data.who = (data.who + 1) % 4;
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.save();
        io.to(gameId).emit("gameDetail", data);
      } else {
        data.players[data.who].pos = city;
        data.leftMove = data.leftMove - 1;
        data.save();
        io.to(gameId).emit("gameDetail", data);
      }
    });
    socket.on("fly", async ({ gameId, city }) => {
      console.log("fly");
      const data = await Game.findOne({ id: gameId });
      if (!data) {
        return;
      }
      console.log(data);
      if (data.leftMove === 1) {
        data.players[data.who].pos = city;
        data.players[data.who].playerHand = data.players[
          data.who
        ].playerHand.filter((item) => item !== city);
        data.leftMove = 4;
        data.who = (data.who + 1) % 4;
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.save();
        io.to(gameId).emit("gameDetail", data);
      } else {
        data.players[data.who].pos = city;
        data.players[data.who].playerHand = data.players[
          data.who
        ].playerHand.filter((item) => item !== city);
        data.leftMove = data.leftMove - 1;
        data.save();
        io.to(gameId).emit("gameDetail", data);
      }
    });
    socket.on("flyfrom", async ({ gameId, city }) => {
      console.log("flyrom");
      const data = await Game.findOne({ id: gameId });
      if (!data) {
        return;
      }
      console.log(data);
      if (data.leftMove === 1) {
        data.players[data.who].playerHand = data.players[
          data.who
        ].playerHand.filter((item) => item !== data.players[data.who].pos);
        data.players[data.who].pos = city;
        data.leftMove = 4;
        data.who = (data.who + 1) % 4;
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.save();
        io.to(gameId).emit("gameDetail", data);
      } else {
        data.players[data.who].playerHand = data.players[
          data.who
        ].playerHand.filter((item) => item !== data.players[data.who].pos);
        data.players[data.who].pos = city;
        data.leftMove = data.leftMove - 1;
        data.save();
        io.to(gameId).emit("gameDetail", data);
      }
    });
    socket.on("lab", async ({ gameId, city }) => {
      console.log("lab");
      const data = await Game.findOne({ id: gameId });
      if (!data) {
        return;
      }
      console.log(data);
      if (data.leftMove === 1) {
        // data.players[data.who].pos = city;
        data.players[data.who].playerHand = data.players[
          data.who
        ].playerHand.filter((item) => item !== data.players[data.who].pos);
        data.lab.push(data.players[data.who].pos);
        data.leftMove = 4;
        data.who = (data.who + 1) % 4;
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.save();
        io.to(gameId).emit("gameDetail", data);
      } else {
        // data.players[data.who].pos = city;
        data.players[data.who].playerHand = data.players[
          data.who
        ].playerHand.filter((item) => item !== data.players[data.who].pos);
        data.lab.push(data.players[data.who].pos);
        data.leftMove = data.leftMove - 1;
        data.save();
        io.to(gameId).emit("gameDetail", data);
      }
    });
    socket.on("lab", async ({ gameId, city }) => {
      console.log("lab");
      const data = await Game.findOne({ id: gameId });
      if (!data) {
        return;
      }
      console.log(data);
      if (data.leftMove === 1) {
        // data.players[data.who].pos = city;
        data.players[data.who].playerHand = data.players[
          data.who
        ].playerHand.filter((item) => item !== data.players[data.who].pos);
        data.lab.push(data.players[data.who].pos);
        data.leftMove = 4;
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.who = (data.who + 1) % 4;
        data.save();
        io.to(gameId).emit("gameDetail", data);
      } else {
        // data.players[data.who].pos = city;
        data.players[data.who].playerHand = data.players[
          data.who
        ].playerHand.filter((item) => item !== data.players[data.who].pos);
        data.lab.push(data.players[data.who].pos);
        data.leftMove = data.leftMove - 1;
        data.save();
        io.to(gameId).emit("gameDetail", data);
      }
    });
    socket.on("treat", async ({ gameId, city }) => {
      console.log("treat");
      const data = await Game.findOne({ id: gameId });
      if (!data) {
        return;
      }
      console.log(data);
      if (data.leftMove === 1) {
        // data.players[data.who].pos = city;
        console.log(data.virus);
        console.log(data.players[data.who].pos);
        if (data.virus[data.players[data.who].pos] > 0) {
          data.virus[data.players[data.who].pos] =
            data.virus[data.players[data.who].pos] - 1;
        }
        data.leftMove = 4;
        data.who = (data.who + 1) % 4;
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.players[data.who].playerHand.push(data.playerDeck.pop());
        data.save();
        io.to(gameId).emit("gameDetail", data);
      } else {
        // data.players[data.who].pos = city;
        if (data.virus[data.players[data.who].pos] > 0) {
          data.virus[data.players[data.who].pos] =
            data.virus[data.players[data.who].pos] - 1;
        }
        data.leftMove = data.leftMove - 1;
        data.save();
        io.to(gameId).emit("gameDetail", data);
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
      socket.join(gameId);
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
  const PORT = process.env.port || 5000;
  server.listen(PORT, () => {
    console.log(`Server is up on port ${PORT}.`);
  });
});
