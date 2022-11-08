const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute")
const cameraBtn = document.getElementById("camera")

let myStream;
let muted = false; // 음소거가 해제된 상태로 시작 
let cameraOff = false; //  카메라 켜져있는 상태로 시작

async function getCameras() {

}

async function getMedia() {
    try{
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        })
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