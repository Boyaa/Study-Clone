const socket = io();

const welcome = document.getElementById("welcome");
const title = welcome.querySelector("#title");
const room = document.querySelector("#chat");
const nameForm = welcome.querySelector("#name");

room.hidden = true; // 처음엔 채팅방이 보이지 않는다

let roomName;

function addMessage(message) {
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message;
  
    li.className = 'meli';

    ul.appendChild(li);
}

function noti(message) {
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message;
    li.className = 'notili';
    ul.appendChild(li);
}

function gotNewMessage(message) {
    const ul = room.querySelector("ul")
    const li = document.createElement("li")
    li.innerText = message;
    li.className = 'youli';
    ul.appendChild(li);
}


function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`${input.value}`);
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
    msgForm.addEventListener("submit", handleMessageSubmit);
    
};


function handleRoomSubmit(event){ // 2 이 함수에서 방제와 닉네임이 변수로 만들어지고, socket에 enter_room이라는 event를 날린다. 여기에 방제와 닉네임, showroom 함수가 인자로 들어간다. 
    event.preventDefault();
    const input = title.querySelector("input");
    const entername = welcome.querySelector("input");
    socket.emit("enter_room", input.value, entername.value, showRoom);
    roomName = input.value;
    input.value = "";
}

title.addEventListener("submit", handleRoomSubmit); // 1 첫 번째로 방 제목 생성 버튼 눌러서 submit 되면 handleRoomSubmit 함수 호출됨 
1

nameForm.addEventListener("submit", handleNicknameSubmit);

socket.on("welcome", (user, newCount) => {  // 4. welcome 이벤트가 socket에 들어오면 socket.nickname이 user라는 이름의 변수에 값으로 들어간다. 
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    noti(`${user}님이 들어왔습니다 😊`);  // 이 때 addMessage라는 함수가 발동되고 그 내용은 user joined
});

socket.on("bye", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    noti(`${user}님이 나갔습니다 😥`);
});

socket.on("got_new_message", gotNewMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    //roomList.innerHTML="";
    console.log(socket.id);
    if(rooms.length === 0) {
        roomList.innerHTML = "";
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);

    })
});
