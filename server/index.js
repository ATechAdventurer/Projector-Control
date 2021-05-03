'use strict';
const { json } = require('express');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;
const path = require('path')
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

const faces = new Array(10);

app.get("/api", (req, res) => {
    const data = faces.map(({operations}) => {
        return operations;
    })
    res.json(faces[0].operations);
})

// Routing
app.use(express.static(path.join(__dirname, "../", "web")));

io.on('connection', (socket) => {
    console.log("Connected");
    //const unusedFace = faces.findIndex((item) => item === undefined);
    const unusedFace = 0;
    if (typeof faces[unusedFace >= 0 ? unusedFace : 0] !== "object") {
        faces[unusedFace >= 0 ? unusedFace : 0] = {};
        faces[unusedFace >= 0 ? unusedFace : 0].participants = [socket.id];
        faces[unusedFace >= 0 ? unusedFace : 0].operations = [];
        //socket.currentPageIndex = unusedFace >= 0 ? unusedFace : 0;
    }
    socket.emit("goTo", { pageIndex: unusedFace >= 0 ? unusedFace : 0, operations: faces[unusedFace].operations });
    socket.on("newOperation", ({ pageIndex, operation }) => {
        if (typeof faces[pageIndex] !== "object") {
            socket.currentPageIndex = pageIndex;
            faces[pageIndex] = {};
            faces[pageIndex].participants = [socket.id];
            faces[pageIndex].operations = [operation];
        }else{
            faces[pageIndex].operations.push(operation);
        }
        io.emit("peerOperation", {pageIndex, operation, authorId: socket.id})
    })
});
