import Game from "../models/game.js";
import mongoose from "mongoose";
const initGame = async (gameId) => {
  const GameDetail = await Game.findOne({ id: gameId });
  //GameDetail["id"] = gameId;
  console.log(GameDetail);
  const playerNum = 4;
  // GameDetail["virus1"] = new Array(48).fill(0);
  // GameDetail["virus2"] = new Array(48).fill(0);
  // GameDetail["virus3"] = new Array(48).fill(0);
  // GameDetail["virus4"] = new Array(48).fill(0);
  GameDetail["virus"] = new Array(48).fill(0);
  GameDetail["activeVirus"] = new Array(4).fill(false);
  GameDetail["discardPlayerDeck"] = [];
  GameDetail["discardVirusDeck"] = [];
  GameDetail["who"] = 0;
  GameDetail["life"] = 0;
  GameDetail["speed"] = 0;

  let arr = [...Array(53).keys()];
  arr.sort(() => Math.random() - 0.5);
  if (playerNum === 4) {
    let arr2 = [...Array(7).keys()];
    arr2.sort(() => Math.random() - 0.5);
    for (let i = 0; i < 4; i++) {
      let tmp = [];
      let a = arr.pop();
      tmp.push(a);
      GameDetail["discardPlayerDeck"].push(a);
      a = arr.pop();
      tmp.push(a);
      GameDetail["discardPlayerDeck"].push(a);
      GameDetail["players"][i] = {
        playerId: GameDetail["players"][i].playerId,
        playerHand: tmp,
        playerJob: arr2[i],
        pos: 2,
      };
    }
  }

  for (let i = 0; i < 5; i++) {
    let random = Math.floor(Math.random() * 10) + i * 10;
    arr.splice(random, 0, -1);
  }
  GameDetail["playerDeck"] = arr;
  let arr3 = [...Array(48).keys()];
  arr3.sort(() => Math.random() - 0.5);
  let city;
  for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 3; j++) {
      city = arr3.pop();
      GameDetail.virus[city] += i;
      // if (Math.floor(city / 12) == 0) {
      //   GameDetail.virus1[city] += i;
      // } else if (Math.floor(city / 12) == 1) {
      //   GameDetail.virus2[city] += i;
      // } else if (Math.floor(city / 12) == 2) {
      //   GameDetail.virus3[city] += i;
      // } else if (Math.floor(city / 12) == 3) {
      //   GameDetail.virus4[city] += i;
      // }
      GameDetail["discardVirusDeck"].push(city);
    }
  }
  GameDetail["virusDeck"] = arr3;
  //console.log(GameDetail);
  GameDetail.save();
  console.log(GameDetail);
  return GameDetail;
};
const option = {
  gameId: "123",
  playersId: ["1", "2", "3", "4"],
  playerNum: 4,
  level: "normal",
};
export default initGame;
