/// <reference path="./p5.global-mode.d.ts" />
const socket = io();
const triangleOffsets = [450, 750];
const triangleShape = [];

document.body.onmousedown = function (e) { if (e.button === 1) return false; }
let ogPoints = [];
let operations = [];
let state = {
    cursorSize: 20,
    debug: {
        grids: !true,
        touchBox: !true
    },
    selectedColor: [46, 157, 26],
    mode: 0,
    page: 0
};

const brushes = [
    "Circle",
    "Square",
    "Star",
    "Polygon",
    "Text",
    "Fill",
    "Clear"
];

function preload() {
    img = loadImage('/assets/images/rainbow.png');
}

function setup() {
    createCanvas(1920, 1080);
    //colorMode(HSB);
    textAlign(CENTER);
    ogPoints.push(width / 2);
    ogPoints.push((height / 12) * 2 - 100);
    triangleShape.push(createVector(ogPoints[0], ogPoints[1] - 25));
    triangleShape.push(createVector(ogPoints[0] + triangleOffsets[0] + 25, ogPoints[1] + triangleOffsets[1] + 15));
    triangleShape.push(createVector(ogPoints[0] - triangleOffsets[0] - 25, ogPoints[1] + triangleOffsets[1] + 15));
    background(220);
    drawUI();
    socket.on("goTo", ({pageIndex, operations}) => {
        state.page = pageIndex;
        state.operations = [];
        drawUI(operations.length !== 0);
    });

    socket.on("peerOperation", ({pageIndex, operation, authorId}) => {
        if(socket.id === authorId || pageIndex !== state.page){
            console.log("Ignoring message");
        }else{
            renderOperation(operation)
        }
    })
    
}

function drawUI(redraw = false) {
    stroke(0, 0, 0);
    if (redraw) {
        noFill();
    } else {
        fill(255, 255, 255);
    }
    triangle(
        ogPoints[0],
        ogPoints[1],
        ogPoints[0] + triangleOffsets[0],
        ogPoints[1] + triangleOffsets[1],
        ogPoints[0] - triangleOffsets[0],
        ogPoints[1] + triangleOffsets[1]
    );


    const storeLength = dist(
        ogPoints[0] + (2 * (triangleOffsets[0] / 3)),
        ogPoints[1] + triangleOffsets[1],
        ogPoints[0] - (2 * (triangleOffsets[0] / 3)),
        ogPoints[1] + triangleOffsets[1]
    );
    const storeHeight = 100/2;
    const storeStart = createVector(ogPoints[0] - (2 * (triangleOffsets[0] / 3)), ogPoints[1] + triangleOffsets[1] + 50);
    rect(
        storeStart.x,
        storeStart.y,
        storeLength,
        storeHeight
    )
    //Draw Store
    const maxItemWidth = storeLength / brushes.length
    const itemWidth = min(maxItemWidth, storeHeight);
    brushes.forEach((item, index) => {
        fill(255);
        stroke(0);
        rect(storeStart.x + (itemWidth * index), storeStart.y, itemWidth, storeHeight);
        fill(state.selectedColor);
        stroke(state.selectedColor);
        switch (item) {
            case "Circle":
                ellipseMode(CENTER);
                ellipse(storeStart.x + (itemWidth * index) + (itemWidth / 2), storeStart.y + (storeHeight / 2), state.cursorSize);
                break;
            case "Square":
                rectMode(CENTER);
                rect(storeStart.x + (itemWidth * index) + (itemWidth / 2), storeStart.y + (storeHeight / 2), state.cursorSize, state.cursorSize);
                rectMode(CORNER);
                break;
            case "Star":
                star(storeStart.x + (itemWidth * index) + (itemWidth / 2), storeStart.y + (storeHeight / 2), state.cursorSize* (3/7), state.cursorSize, 5);
                break;
        }
        fill(255);
        stroke(0);
    });

    //Draw Color Selector

    /*for(var i = 1; i < 30; i += .03125) {
        stroke(...HSVtoRGB(i*10, 100, 100));
        line(storeStart.x+(i*16) + 50, storeStart.y - 40, storeStart.x+(i*16)+50, storeStart.y- 5 );
    }*/
    image(img, storeStart.x, storeStart.y - 40, storeLength, 30);


    const sideLengths = [];
    sideLengths.push(
        dist(
            ogPoints[0],
            ogPoints[1],
            ogPoints[0] + triangleOffsets[0],
            ogPoints[1] + triangleOffsets[1]
        )
    );
    sideLengths.push(
        dist(
            ogPoints[0],
            ogPoints[1],
            ogPoints[0] - triangleOffsets[0],
            ogPoints[1] + triangleOffsets[1]
        )
    );
    sideLengths.push(
        dist(
            ogPoints[0] + triangleOffsets[0],
            ogPoints[1] + triangleOffsets[1],
            ogPoints[0] - triangleOffsets[0],
            ogPoints[1] + triangleOffsets[1]
        )
    )


    if (state.debug.grids) {
        for (var x = 0; x < 12; x++) {
            line((width / 12) * x, 0, (width / 12) * x, height);
        }
        for (var x = 0; x < 12; x++) {
            line(0, (height / 12) * x, width, (height / 12) * x);
        }
    }




    if (state.debug.touchBox) {
        fill(255, 0, 0, 10);
        stroke(255, 0, 0);
        beginShape();
        for (const { x, y } of triangleShape) vertex(x, y);
        endShape(CLOSE);
        stroke(255, 255, 255);
        fill(255, 255, 255);
    }
}

function mousePressed(event) {
    if (event.buttons == 4) {
        state.selectedColor = get(mouseX, mouseY);
        drawUI(true);
        return;
    }
    brush(event.buttons);
}

function mouseDragged(event) {
    brush(event.buttons);
}

function mouseReleased() {
    drawUI(true);
}
function mouseWheel(event) {
    const { delta } = event;
    state.cursorSize += delta < 0 ? 1 : -1;
    if (state.cursorSize < 1) {
        state.cursorSize = 1;
    }
    drawUI(true);
}

function keyPressed() {
    //console.log(btoa(JSON.stringify(operations)));
}

function brush(button) {
    //console.log(button)
    if (collidePointPoly(mouseX, mouseY, triangleShape)) { // Drawing
        const renderColor = button == 1 ? state.selectedColor : [255,255,255];
        fill(...renderColor);
        stroke(...renderColor);
        //operations.push();
        socket.emit("newOperation", {pageIndex: state.page, operation: {type: state.mode, w: state.cursorSize, h: state.cursorSize, drawFill: renderColor, pos: [mouseX, mouseY]}});
        switch (state.mode) {
            case 0: //circle
                ellipse(mouseX, mouseY, state.cursorSize);
                break;
            case 1:
                rect(mouseX, mouseY, state.cursorSize, state.cursorSize);
                break;
            case 2:
                star(mouseX, mouseY, state.cursorSize* (3/7), state.cursorSize, 5);
                break;
        }
    }

}

function renderOperation({type, w, h, drawFill, pos}) {
    //console.log(button)
    if (collidePointPoly(pos[0], pos[1], triangleShape)) { // Drawing
        fill(...drawFill);
        stroke(...drawFill);  
        switch (type) {
            case 0: //circle
                ellipse(pos[0], pos[1], w);
                break;
            case 1:
                rect(pos[0], pos[1], w, w);
                break;
            case 2:
                star(pos[0], pos[1], w* (3/7), w, 5);
                break;
        }
    }

}


function star(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius2;
        let sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a + halfAngle) * radius1;
        sy = y + sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function polygon(x, y, radius, npoints) {
    let angle = TWO_PI / npoints;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = x + cos(a) * radius;
        let sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

