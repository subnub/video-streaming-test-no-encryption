console.log("hello");

const randomUUID = Math.floor((Math.random() * 100) + 1);

const url = `http://192.241.138.205:3000/video/${randomUUID}`;

const videoElement = document.getElementById("video_player");

videoElement.src = url;