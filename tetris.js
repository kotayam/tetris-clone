// game board
var rows = 20;
var cols = 10;
var blockSize = 40;
var speed = 400;
var gameBoard;
var ctx;

var gameover = false;

// 2D array to store game state
var boardArr;

// block
var blockX;
var blockY = -1;

var velX = 0;
var velY = 1;

var count = 0; // keeps track of first block

var colors = ["red", "blue", "green", "purple", "yellow"];
var blockColor;

var blockTypes = ["T", "L", "Square", "Line", "Diamond"]
var blockType;

window.onload = function() {
    gameBoard = document.getElementById("gameBoard");
    gameBoard.height = rows * blockSize;
    gameBoard.width = cols * blockSize;
    boardArr = [];
    for (let r = 0; r < rows; r++) {
        boardArr[r] = [];
        for (let c = 0; c < cols; c++) {
            boardArr[r][c] = "black";
        }
    }

    ctx = gameBoard.getContext("2d");
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    setInterval(update, speed);
}

function update() {
    if (gameover) {
        return;
    }

    // draw game board
    ctx.strokeStyle = "white";
    for (let r = 0; r < boardArr.length; r++) {
        for (let c = 0; c < boardArr[r].length; c++) {
            ctx.fillStyle = boardArr[r][c];
            ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
            ctx.strokeRect(c * blockSize, r * blockSize, blockSize, blockSize);
        }
    }

    // draw block
    if (checkBlockAtEnd() || count == 0) {
        if (blockY == 0) {
            gameover = true;
            alert("Game Over!");
        } else {
            createBlock();
            count++;
        }
    } else {
        moveBlock();
    }
}

function keyDown(e) {
    if (e.code == "ArrowLeft") {
        velX = -1;
    } 
    else if (e.code == "ArrowRight" || boardArr[blockY + velY][blockX + 1] != "black") {
        velX = 1;
    }

    if (e.code == "ArrowDown") {
        velY = 3;
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

function createBlock() {
    blockX = Math.floor(Math.random() * cols);
    blockY = 0;
    velX = 0;
    velY = 1;
    blockColor = colors[Math.floor(Math.random() * colors.length)];
    boardArr[blockY][blockX] = blockColor;
}

function checkCollision() {
    nextX = blockX + velX;
    nextY = blockY + velY;
    return nextX < 0 || nextX >= cols || nextY >= rows || boardArr[nextY][nextX] != "black";
}

function moveBlock() {
    boardArr[blockY][blockX] = "black";  
    if (checkCollision()) {
        velX = 0;
        velY = 1;
    }
    blockY += velY;
    blockX += velX;
    boardArr[blockY][blockX] = blockColor;
}

function checkBlockAtEnd() {
    return blockY == rows - 1 || boardArr[blockY + 1][blockX] != "black";
}