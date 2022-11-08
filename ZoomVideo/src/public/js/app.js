const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")
const camerasSelect = document.getElementById("cameras")

let myStream;
let muted = false; // 음소거가 해제된 상태로 시작 
let cameraOff = false; //  카메라 켜져있는 상태로 시작

async function getCameras() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput") //video 출력하는 기기만 골라서 가져오기 
        cameras.forEach(camera => { //카메라 출력하는 기기 리스트 하나씩 데려와서 
            const option = document.createElement("option"); //본문에 option 태그 넣어주는 변수 생성
            option.value = camera.deviceId; //그 옵션의 value로 deviceId 넣어주기 
            option.innerText = camera.label; //그 옵션은 기기 label 값으로 보여지게 하기 
            camerasSelect.appendChild(option); //본문의 option이라는 id를 가진 공간에 자식 태그들 추가
        })
    } catch (e) {
        console.log(e);
    }
} // navigator.mediaDevices.enumerateDevices() promise 이기 때문에 try, catch, console.log(e) 해줘야 함

async function getMedia() {
    try{
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        });
        myFace.srcObject = myStream;
        await getCameras();
    } catch (e) {
        console.log(e);
    }
}

getMedia();

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

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);