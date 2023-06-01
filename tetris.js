// game board
const rows = 20;
const cols = 10;
const blockSize = 40;
const gameSpeed = 200; // in miliseconds (1000 milisec = 1 sec)
let gameBoard;
let ctx;

let gameover = false;

let turn = 1; // keeps track of first block
let line = 0; // keeps track of how many lines deleted
let score = 0;

// 2D array to store game state
let boardArr;

// block
let blockCoords;
let centerCoord;

let velX;
let velY;

let blockColor;

let blockTypes = ["square", "line"];
let blockType;

// retrieve html items

window.onload = function() {
    // reset values
    gameover = false;
    turn = 1;
    line = 0;
    boardArr = [];
    for (let r = 0; r < rows; r++) {
        boardArr[r] = [];
        for (let c = 0; c < cols; c++) {
            boardArr[r][c] = "black";
        }
    }
    blockCoords = [];
    centerCoord = [4, -1];
    velX = 0;
    velY = 1;
    count = 0;

    // set up game board
    gameBoard = document.getElementById("gameBoard");
    gameBoard.height = rows * blockSize;
    gameBoard.width = cols * blockSize;

    ctx = gameBoard.getContext("2d");
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    setInterval(update, gameSpeed);
}

function update() {
    // create / move blocks
    if (checkBlockAtEnd()) {
        if (isGameOver()) {
            gamover = true;
            alert("Game Over!");
            return;
        } else {
            convertCurr();
            deleteRow();
            createBlock();
        }
    } else {
        moveBlock();
    }
    turn++;
    let string = "block coordinates: "
    for (let i = 0; i < blockCoords.length; i++) {
        string += "(" + blockCoords[i][0] + "," + blockCoords[i][1] + ") ";
    }
    console.log(string);

    // draw game board
    ctx.strokeStyle = "white";
    for (let r = 0; r < boardArr.length; r++) {
        for (let c = 0; c < boardArr[r].length; c++) {
            if (boardArr[r][c] == "curr") {
                ctx.fillStyle = blockColor;
            } else {
                ctx.fillStyle = boardArr[r][c];
            }
            ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
            ctx.strokeRect(c * blockSize, r * blockSize, blockSize, blockSize);
        }
    }
}


function keyDown(e) {
    if (e.code == "ArrowLeft") {
        velX = -1;
    } 
    else if (e.code == "ArrowRight") {
        velX = 1;
    }
    if (e.code == "ArrowUp") {
        // rotate block
    } else if (e.code == "ArrowDown") {
        velY = 2;
    }
    if (e.code == "Space") {
        // go straight down
    }
}

function keyUp(e) {
    if (e.code == "ArrowLeft") {
        velX = 0;
    } 
    else if (e.code == "ArrowRight") {
        velX = 0;
    }

    if (e.code == "ArrowDown") {
        velY = 1;
    }
}

// checks if the block is at the bottom or land on another block
function checkBlockAtEnd() {
    if (turn == 1) {
        return true;
    }
    let bool = false;
    let greatestY = blockCoords[blockCoords.length - 1][1];
    for (let i = blockCoords.length - 1; i >= 0; i--) {
        let x = blockCoords[i][0];
        let y = blockCoords[i][1];
        if (y >= 0 && y == greatestY) {
//            console.log("checking: " + x + ", " + y);
            bool = bool || y == rows - 1 || boardArr[y + 1][x] != "black";
        }
    }
//    console.log("block is at end: " + bool);
    return bool;
}

// when the block is at the end, convert the "curr" in board array to the color of block
function convertCurr() {
    for (let i = 0; i < blockCoords.length; i++) {
        let x = blockCoords[i][0];
        let y = blockCoords[i][1];
        if (y >= 0) {
            boardArr[y][x] = blockColor;
        }
    }
}

// deletes a row if there is a row is filled with blocks
function deleteRow() {
    let tempArr = [];
    // find rows that should be deleted
    for (let r = boardArr.length - 1; r > -1; r--) {
        if (!boardArr[r].includes("black")) {
            tempArr.push(r);
            line++;
//            console.log("line deleted: " + r);
//            console.log(structuredClone(tempArr));
        }
    }

    // remove those rows from the board
    for (let i = 0; i < tempArr.length; i++) {
        boardArr.splice(tempArr[i], 1);
    }

    // add new rows with black to the head of board
    for (let i = 0; i < tempArr.length; i++) {
        let filledArr = new Array(cols);
        filledArr.fill("black");
        boardArr.unshift(filledArr);
    }
}

function isGameOver() {
    if (turn == 1) {
        return false;
    }
    let bool = false;
    for (let i = blockCoords.length - 1; i >= 0; i--) {
        let y = blockCoords[i][1];
        bool = bool || y < 0;
    }
    console.log("gameover: " + bool);
    return bool;
}

// creates a new block at the top middle of the screen
function createBlock() {
    console.log("created block");
    blockCoords = [];
    velX = 0;
    velY = 1;
    blockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
    createBasedOnBlockType();
}

// creates the block based on its block type
function createBasedOnBlockType() {
    switch(blockType) {
        case "line":
            blockColor = "lightblue";
            centerCoord = [4, -2, "center"]; // give center coord an id indicating center
            blockCoords.push(centerCoord);
            blockCoords.push([centerCoord[0], centerCoord[1] - 2]);
            blockCoords.push([centerCoord[0], centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0], centerCoord[1] + 1]);
            break;
        case "square":
            blockColor = "yellow";
            centerCoord = [4, -1, "center"]; // give center coord an id indicating center
            blockCoords.push(centerCoord);
            blockCoords.push([centerCoord[0], centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1]]);
            break;
    }
    blockCoords.sort(sortBlockCoords);
//    console.log(blockCoords);
    for (let i = 0; i < blockCoords.length; i++) {
        if (blockCoords[i][1] >= 0) {
            boardArr[blockCoords[i][1]][blockCoords[i][0]] = "curr";
        }
    }
}

// sorts the coordinates of blocks based on x,y value from least (top left) -> greatest (top right)
function sortBlockCoords(a, b) {
    if (a[1] == b[1]) {
        return a[0] - b[0];
    } else {
        return a[1] - b[1];
    }
} 

function checkCollision() {
    let nextX;
    let nextY;
    let bool = false;
    for (let i = 0; i < blockCoords.length; i++) {
        nextX = blockCoords[i][0] + velX;
        nextY = blockCoords[i][1] + velY;
        if (nextY >= 0) {
            bool = bool || nextX < 0 || nextX >= cols || nextY >= rows || (boardArr[nextY][nextX] != "black" && boardArr[nextY][nextX] != "curr");
        }
    }
    return bool;
}

function moveBlock() {
    if (checkCollision()) {
        velX = 0;
        velY = 1;
    }
    for (let i = blockCoords.length-1; i >= 0; i--) {
        let currX = blockCoords[i][0];
        let currY = blockCoords[i][1];
        let nextX = currX + velX;
        let nextY = currY + velY;
        blockCoords[i] = [nextX, nextY];
        if (currY >= 0 && nextY >= 0) {
//            console.log("1: " + currX + ", " + currY);
            boardArr[currY][currX] = "black"
            boardArr[nextY][nextX] = "curr";
        } else if (nextY < 0) {
//            console.log("3: " + currX + ", " + currY);
        } else if (currY < 0) {
//            console.log("3: " + currX + ", " + currY);
            boardArr[nextY][nextX] = "curr";
        }
    }
    console.log("moved block");
//    console.log(blockCoords);
}