'use strict';
const { json } = require('express');
var express = require('express');
const { unwatchFile } = require('fs');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 80;
const path = require('path')
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

const faces = new Array(8);
for(var i = 0; i < faces.length; i++){
    faces[i] = [];
}
app.get("/api", (req, res) => {
    const data = faces.map(({ operations }) => {
        return operations;
    });
    //console.log(faces)
    res.json(faces || []);
})

// Routing
app.use(express.static(path.join(__dirname, "../", "web")));

io.on('connection', (socket) => {
    console.log("Connected");
    const unusedFace = 0;
    setTimeout(() => {
        socket.emit("goTo", { pageIndex: unusedFace >= 0 ? unusedFace : 0, operations: faces[unusedFace] || [] });
    }, 100);

    socket.on("newOperation", ({ pageIndex, operation }) => {
        console.log("New Operation", pageIndex, operation)
        faces[pageIndex].push(operation);
        console.log(faces[0].length, faces[1].length)
        io.emit("peerOperation", { pageIndex, operation, authorId: socket.id })
    })

    socket.on("iGoTo", ({ currentPage, direction }) => {

        let newPage;
        if (direction === "next") {
            newPage = (currentPage + 1) % faces.length;
        } else {
            if (currentPage <= 0) {
                newPage = faces.length - 1;
            } else {
                newPage = (currentPage - 1) % faces.length;
            }
        }
        socket.emit("goTo", { pageIndex: newPage, operations: faces[newPage] || [] });
    })
});
