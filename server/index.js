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
    res.json(data || []);
})

// Routing
app.use(express.static(path.join(__dirname, "../", "web")));

io.on('connection', (socket) => {
    console.log("Connected");
    const unusedFace = faces.findIndex((item) => item === undefined);
    //const unusedFace = 0;
    if (typeof faces[unusedFace >= 0 ? unusedFace : 0] !== "object") {
        faces[unusedFace >= 0 ? unusedFace : 0] = {};
        faces[unusedFace >= 0 ? unusedFace : 0].participants = [socket.id];
        faces[unusedFace >= 0 ? unusedFace : 0].operations = [];
        //socket.currentPageIndex = unusedFace >= 0 ? unusedFace : 0;
    }
    setTimeout(() => {
        socket.emit("goTo", { pageIndex: unusedFace >= 0 ? unusedFace : 0, operations: faces[unusedFace].operations || [] });
    }, 100);
    
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

    socket.on("iGoTo", ({currentPage, direction}) => {
        
        let newPage;
        if(direction === "next"){
            newPage = (currentPage + 1) % faces.length; 
        }else{
            if(currentPage <= 0){
                newPage = faces.length-1;
            }else{
                newPage = (currentPage - 1) % faces.length;
            }
            
        }
        socket.emit("goTo", { pageIndex: newPage, operations: faces[unusedFace].operations || []});

    })
});
