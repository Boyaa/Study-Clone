import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_,res) => res.render("home"));
app.get('/*', (_,res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer)

wsServer.on("connection", (socket) => { // 연결되어서 socket이 생성되면 호출됨 
	socket["nickname"]="익명이";
	socket.onAny((event) => {
		console.log(`Socket Event: ${event}`)
	})
	socket.on("enter_room", (roomName, nickname, done) => { // 3 enter_room이라는 event가 socket에 들어오면 방제, 닉네임, 함수가 인자로 들어온다.
		socket["nickname"] = nickname						// socket에 nickname이라는 컬럼을 만들고 값으로 인자로 넘어온 닉네임 넣어준다 
		socket.join(roomName);								// socket이 방제에 해당하는 방으로 들어간다.
		done();												// showRoom() 함수 호출 
		socket.to(roomName).emit("welcome", socket.nickname)	// 방제에 해당하는 곳에 socket.nickname이라는 인자를 넣어서 welcome event 만들어준다.
	});
	socket.on("disconnecting", () => {
		socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));
	})
	socket.on("new_message", (msg, room, done) => {
		socket.to(room).emit("got_new_message", `${socket.nickname}: ${msg}`);
		done();
	})
	socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
	
});

httpServer.listen(3000, handleListen);