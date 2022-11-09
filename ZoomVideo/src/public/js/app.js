const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const camerasSelect = document.getElementById("cameras")
const call = document.getElementById("call");

call.hidden="true"

let myStream;
let muted = false; // 음소거가 해제된 상태로 시작 
let cameraOff = false; //  카메라 켜져있는 상태로 시작
let roomName; // value를 저장하기 위해 선언해줌 
let myPeerConnection; //누구나 stream에 접근할 수 있게 선언해줌 


// About Media

async function getCameras() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput") //video 출력하는 기기만 골라서 가져오기 
        const currentCamera = myStream.getVideoTracks()[0];

        console.log(myStream.getVideoTracks());

        cameras.forEach(camera => { //카메라 출력하는 기기 리스트 하나씩 데려와서 
            const option = document.createElement("option"); //본문에 option 태그 넣어주는 변수 생성
            option.value = camera.deviceId; //그 옵션의 value로 deviceId 넣어주기 
            option.innerText = camera.label; //그 옵션은 기기 label 값으로 보여지게 하기
            if(currentCamera.label == camera.label){
                option.selected = true; // stream의 현재 카메라와 paint 할 때의 카메라 옵션 가져오기 
            } 
            camerasSelect.appendChild(option); //본문의 option이라는 id를 가진 공간에 자식 태그들 추가
        })
    } catch (e) {
        console.log(e);
    }
} // navigator.mediaDevices.enumerateDevices() promise 이기 때문에 try, catch, console.log(e) 해줘야 함

async function getMedia(deviceId) {
    const initialConstrains = { // cameras 만들기 전 
        audio: true,
        video: { facingMode: 'user' },
    };
    const cameraConstraints = { // deviceID 있을 때 실행 
        audio: true, 
        video: { deviceId: { exact: deviceId } }, 
    }
    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId? cameraConstraints : initialConstrains
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras(); //이렇게 처리하지 않으면 카메라 Id를 바꿔줄 때마다 카메라를 실행해주므로 처음에만 실행하게 만들어준다
        }  
    } catch (e) {
        console.log(e);
    }
}


function handleMuteClick() {
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    // mystream (myFace.srcObject)의 오디오 트랙들에서 하나씩 트랙을 가져와서 만약 track이 
    // able 상태라면 enabled 상태로 만들어준다.

    if(!muted) {
        muteBtn.innerText="Unmute";
        muted = true;
    } else {
        muteBtn.innerText="Mute"
        muted = false;
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    if(cameraOff){
        cameraBtn.innerText="Turn Camera Off"
        cameraOff = false;
    } else {
        cameraBtn.innerText="Turn Camera On"
        cameraOff = true;
    }
}

async function handleCameraChange() {
    await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);



// about WelcomeForm


const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomeSubmit(event) {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    roomName = input.value;
    input.value="";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);



// socket code

socket.on("welcome", async() => { // peerA에서 돌아가는 코드 
    const offer = await myPeerConnection.createOffer(); // peerA 에서 offer 생성
    myPeerConnection.setLocalDescription(offer) //LocalDescription 만들기
    console.log("sent the offer");
    socket.emit("offer", offer, roomName); // peerB로 offer 보내기 
    console.log(offer)
});

socket.on("offer", async(offer) => { //peerB에서 돌아가는 코드 
    myPeerConnection.setRemoteDescription(offer); 
    const answer = await myPeerConnection.createAnswer();
    console.log(answer); 
    myPeerConnection.setLocalDescription(answer) //LocalDescription 만들기
    socket.emit("answer", answer, roomName);
})

socket.on("answer", answer => {
    myPeerConnection.setRemoteDescription(answer); 
});

// RTC code

function makeConnection() {
    myPeerConnection = new RTCPeerConnection();
    myStream.getTracks().forEach((track) => 
    myPeerConnection.addTrack(track, myStream)); // 영상과 오디오 데이터들을 peer Connection에 넣어줘야 한다. 
}