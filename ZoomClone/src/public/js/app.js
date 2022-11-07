const socket = io();

const welcome = document.getElementById("welcome");
const title = welcome.querySelector("#title");
const room = document.getElementById("room");

room.hidden = true; // 처음엔 채팅방이 보이지 않는다

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message;
    ul.appendChild(li);
}


function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${input.value}`);
        input.value="";
    });
    
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = welcome.querySelector("#name input");
    socket.emit("nickname", input.value);
}


function showRoom() {
    welcome.hidden = true;
    room.hidden = false; 
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    const nameForm = welcome.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);
};


function handleRoomSubmit(event){
    event.preventDefault();
    const input = title.querySelector("input");
    const entername = welcome.querySelector("input");
    socket.emit("enter_room", input.value, entername.value, showRoom);
    roomName = input.value;
    input.value = "";
}

title.addEventListener("submit", handleRoomSubmit);


socket.on("welcome", (user) => {
    addMessage(`${user} joined!`);
});

socket.on("bye", (user) => {
    addMessage(`${user} left! ㅜㅜ`);
});

socket.on("got_new_message", addMessage);