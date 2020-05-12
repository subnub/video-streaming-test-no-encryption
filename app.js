const express = require("express");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const tempStorage = require("./tempStorage");
const getFileSize = require("./getFileSize");
const uuid = require("uuid");

const password = "hellothere";
const initVect = Buffer.from("605e9d9e27aadba7ec3c9561d02efc1d", "hex");



const app = express();
const publicPath = path.join(__dirname, "public");

app.use(express.static(publicPath));

app.get("/video/:uuid", async(req, res) => {

    const originalFileSize = await getFileSize("./bunny.mp4");
    const paramsUUID = req.params.uuid;
    const currentUUID = uuid.v4();
    tempStorage[paramsUUID] = currentUUID; 

    console.log("File Request");

    const headers = req.headers;

    const range = headers.range
    const parts = range.replace(/bytes=/, "").split("-")
    let start = parseInt(parts[0], 10)
    let end = parts[1] 
        ? parseInt(parts[1], 10)
        : originalFileSize-1
    const chunksize = (end-start)+1

    let currentIV = initVect;

    let head = {
        'Content-Range': 'bytes ' + start + '-' + end + '/' + originalFileSize,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4'}

    const readStream = fs.createReadStream("bunny.mp4", {
        start: start,
        end:  end,
    });

    res.writeHead(206, head);

    readStream.on("data", (data) => {

        //res.write(data);
        if (tempStorage[paramsUUID] !== currentUUID) {

            console.log("Old Stream Destroying...");
            readStream.destroy();
            readStream.removeAllListeners();
            res.end();
            console.log("Old Stream Destroyed");
                   
        } else {

            res.write(data);
        }
    })

    readStream.on("close", () => {
        res.end();
    })
})

app.get("*", (req, res) => {

    res.sendFile(path.join(publicPath,"index.html"))
})

app.listen(3000, "64.227.2.37", () => {
    console.log("listening")
});




