import http from "http";
import SocketIO from "socket.io";
import express from "express";
import { SocketAddress } from "net";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_,res) => res.render("home"));
app.get('/*', (_,res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer)

wsServer.on("connection", (socket) => {
	socket["nickname"]="익명이";
	socket.onAny((event) => {
		console.log(`Socket Event: ${event}`)
	})
	socket.on("enter_room", (roomName, nickname, done) => {
		socket["nickname"] = nickname;
		socket.join(roomName);
		done();
		socket.to(roomName).emit("welcome", socket.nickname)
	});
	socket.on("disconnecting", () => {
		socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
	})
	socket.on("new_message", (msg, room, done) => {
		socket.to(room).emit("got_new_message", `${socket.nickname}: ${msg}`);
		done();
	})
	
});

httpServer.listen(3000, handleListen);