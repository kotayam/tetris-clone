// game board
const rows = 20;
const cols = 10;
const blockSize = 40;
const gameSpeed = 300; // in miliseconds (1000 milisec = 1 sec)
let myInterval;
let ctx;

let gameover = false;

let turns; // keeps track of first block
let lines; // keeps track of how many lines deleted
let score; // keeps track of score

// 2D array to store game state
let boardArr;

// block
let blockCoords;
let originCoords;

let velX;
let velY;

let blockColor;

let blockTypes = ["square", "line", "L1", "L2", "T", "Z1", "Z2"];
let blockType;

let rotateCount;
let count;

// html items
let startButton;
let resetButton;
let gameBoard;
let turnText;
let lineText;
let scoreText;

// start game
window.onload = function () {
    startButton = document.querySelector("#start");
    homeButton = document.querySelector("#home");
    gameBoard = document.querySelector("#gameBoard");
    ctx = gameBoard.getContext("2d");
    turnText = document.querySelector("#turns");
    lineText = document.querySelector("#lines");
    scoreText = document.querySelector("#score");
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    homeButton.onclick = backToHome;
    startButton.onclick = startGame;
    reset();
    drawBoard();
    showHomeScreen();
}

function backToHome() {
    reset();
    drawBoard();
    showHomeScreen();
}

function showHomeScreen() {
    ctx.fillStyle = "lightgray";
    ctx.fillRect(0, gameBoard.height / 2 - blockSize * 4, gameBoard.width, blockSize * 8);
    ctx.fillStyle = "blue";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Welcome to Tetris!", gameBoard.width / 2, gameBoard.height / 2 - blockSize * 2.5);
    ctx.fillStyle = "black";
    ctx.font = "17px Arial";
    ctx.fillText("Press Start to play game.", gameBoard.width / 2, gameBoard.height / 2 - blockSize * 1.25);
    ctx.fillText("Press Home while playing to return to this screen.", gameBoard.width / 2, gameBoard.height / 2);
    ctx.fillText("Controls are written at top right.", gameBoard.width / 2, gameBoard.height / 2 + blockSize * 1.25);
    ctx.fillText("Enjoy!", gameBoard.width / 2, gameBoard.height / 2 + blockSize * 2.5)
}

function startGame() {
    reset();
    myInterval = setInterval(update, gameSpeed);
}

function reset() {
    // reset values
    gameover = false;
    boardArr = [];
    for (let r = 0; r < rows; r++) {
        boardArr[r] = [];
        for (let c = 0; c < cols; c++) {
            boardArr[r][c] = "black";
        }
    }
    blockCoords = [];
    originCoords = [];
    velX = 0;
    velY = 1;
    turns = 1;
    lines = 0;
    score = 0;
    rotateCount = 0;
    count = 0;

    clearInterval(myInterval);

    // set up game board
    gameBoard.height = rows * blockSize;
    gameBoard.width = cols * blockSize;

    // reset stats
    turnText.innerText = 0;
    lineText.innerText = 0;
    scoreText.innerText = 0;
}

function update() {
    // create / move blocks
    if (checkBlockAtEnd()) {
        if (isGameOver()) {
            gameover = true;
            clearInterval(myInterval);
            showGameOverScreen();
            return;
        } else {
            convertCurr();
            deleteRow();
            createBlock();
        }
        turnText.innerText = turns;
        turns++;
    } else {
        moveBlock();
    }

    // print coordinates
    let string = "block coordinates: "
    for (let i = 0; i < blockCoords.length; i++) {
        string += "(" + blockCoords[i][0] + "," + blockCoords[i][1] + ") ";
    }

    // draw game board
    drawBoard();
}

function showGameOverScreen() {
    ctx.fillStyle = "lightgray";
    ctx.fillRect(0, gameBoard.height / 2 - blockSize * 2, gameBoard.width, blockSize * 4);
    ctx.fillStyle = "red";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", gameBoard.width / 2, gameBoard.height / 2 - blockSize / 2);
    ctx.fillStyle = "black";
    ctx.font = "17px Arial";
    ctx.fillText("press Home to exit, or Start to play again.", gameBoard.width / 2, gameBoard.height / 2 + blockSize / 2);
}

function drawBoard() {
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
    else if (e.code == "ArrowUp") {
        rotateBlock();
    } 
    else if (e.code == "ArrowDown") {
        velY = 2;
    }
}

function keyUp(e) {
    if (e.code == "ArrowLeft") {
        velX = 0;
    } 
    else if (e.code == "ArrowRight") {
        velX = 0;
    }
    else if (e.code == "ArrowUp") {
        return;
    } 
    else if (e.code == "ArrowDown") {
        velY = 1;
    }
}

// checks if the block is at the bottom or land on another block
function checkBlockAtEnd() {
    if (turns == 1) {
        return true;
    }
    let bool = false;
    let greatestY = blockCoords[blockCoords.length - 1][1];
    for (let i = blockCoords.length - 1; i >= 0; i--) {
        let x = blockCoords[i][0];
        let y = blockCoords[i][1];
        if (y >= 0 && y == greatestY) {
        }
        if (y >= 0) {
            bool = bool || y == rows - 1 || (boardArr[y + 1][x] != "black" && boardArr[y + 1][x] != "curr");
        }
    }
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
            lines++;
        }
    }

    // score based on number of deleted line
    switch(tempArr.length) {
        case 1:
            score += 100;
            break;
        case 2: 
            score += 300;
            break;
        case 3: 
            score += 500;
            break;
        case 4:
            score += 800;
            break;
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

    // update stats
    lineText.innerText = lines;
    scoreText.innerText = score;
}

function isGameOver() {
    if (turns == 1) {
        return false;
    }
    let bool = false;
    for (let i = blockCoords.length - 1; i >= 0; i--) {
        let y = blockCoords[i][1];
        bool = bool || y < 0;
    }
    return bool;
}

// creates a new block at the top middle of the screen
function createBlock() {
    blockCoords = [];
    originCoords = [];
    velX = 0;
    velY = 1;
    blockType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
    rotateCount = 0;
    createBasedOnBlockType();
}

// creates the block based on its block type
function createBasedOnBlockType() {
    let centerCoord = [];
    switch(blockType) {
        case "line":
            blockColor = "lightblue";
            centerCoord = [4, -1]; // give center coord an id indicating center
            blockCoords.push(centerCoord);
            blockCoords.push([centerCoord[0] - 1, centerCoord[1]]);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1]]);
            blockCoords.push([centerCoord[0] + 2, centerCoord[1]]);
            break;
        case "square":
            blockColor = "yellow";
            centerCoord = [4, -1];
            blockCoords.push(centerCoord);
            blockCoords.push([centerCoord[0], centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1]]);
            break;
        case "L1":
            blockColor = "blue";
            centerCoord = [4, -1]; 
            blockCoords.push(centerCoord);
            blockCoords.push([centerCoord[0] - 1, centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0] - 1, centerCoord[1]]);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1]]);
            break;
        case "L2":
            blockColor = "orange";
            centerCoord = [4, -1]; 
            blockCoords.push(centerCoord);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0] - 1, centerCoord[1]]);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1]]);
            break;
        case "T":
            blockColor = "purple";
            centerCoord = [4, -1]; 
            blockCoords.push(centerCoord);
            blockCoords.push([centerCoord[0], centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0] - 1, centerCoord[1]]);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1]]);
            break;
        case "Z1":
            blockColor = "red";
            centerCoord = [4, -1]; 
            blockCoords.push(centerCoord);
            blockCoords.push([centerCoord[0] - 1, centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0], centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1]]);
            break;
        case "Z2":
            blockColor = "green";
            centerCoord = [4, -1]; 
            blockCoords.push(centerCoord);
            blockCoords.push([centerCoord[0], centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0] + 1, centerCoord[1] - 1]);
            blockCoords.push([centerCoord[0] - 1, centerCoord[1]]);
            break;
    }
    // give each block an unique id 0-3. 0 is center
    for (let i = 0; i < blockCoords.length; i++) {
        blockCoords[i].push(i);
    }
    blockCoords.sort(sortBlockCoords);
    for (let i = 0; i < blockCoords.length; i++) {
        let x = blockCoords[i][0];
        let y = blockCoords[i][1];
        let id = blockCoords[i][2];
        let orgX = centerCoord[0];
        let orgY = centerCoord[1];
        originCoords.push([x - orgX, y - orgY, id]);
    }
    for (let i = 0; i < blockCoords.length; i++) {
        if (blockCoords[i][1] >= 0) {
            boardArr[blockCoords[i][1]][blockCoords[i][0]] = "curr";
        }
    }
}

// sorts the coordinates of blocks based on its id (0-3)
function sortBlockCoords(a, b) {
    return a[2] - b[2];
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
    let currX;
    let currY;

    // color current coordinates black
    for (let i = 0; i < blockCoords.length; i++) {
        currX = blockCoords[i][0];
        currY = blockCoords[i][1];
        if (currY >= 0) {
            boardArr[currY][currX] = "black";
        }
    }

    // color new coordinates as curr
    for (let i = blockCoords.length-1; i >= 0; i--) {
        currX = blockCoords[i][0];
        currY = blockCoords[i][1];
        let id = blockCoords[i][2];
        let nextX = currX + velX;
        let nextY = currY + velY;
        blockCoords[i] = [nextX, nextY, id];
        if (nextY >= 0) {
            boardArr[nextY][nextX] = "curr";
        }
    }
}

function rotateBlock() {
    // if block is out of screen (top), cannot rotate
    for (let i = 0; i < blockCoords.length; i++) {
        if (blockCoords[i][1] < 0) {
            return;
        }
    }

    rotateCount++;
    let x;
    let y;
    let id;
    let centerCoord;
    let prevCoords = JSON.parse(JSON.stringify(blockCoords));
    let nextCoords = [];

    // retrieve the center coordinate of the block
    for (let i = 0; i < blockCoords.length; i++) {
        if (blockCoords[i][2] == 0) {
            centerCoord = [blockCoords[i][0], blockCoords[i][1]];
        }
    }

    // rotate block store in nextCoords
    if (rotateCount % 4 == 0) {
        for (let i = 0; i < blockCoords.length; i++) {
            x = blockCoords[i][0];
            y = blockCoords[i][1];
            id = blockCoords[i][2];
            nextCoords.push([centerCoord[0] + originCoords[i][0], centerCoord[1] + originCoords[i][1], id]);
        }
    }
    else if (rotateCount % 4 == 1) {
        for (let i = 0; i < blockCoords.length; i++) {
            x = blockCoords[i][0];
            y = blockCoords[i][1];
            id = blockCoords[i][2];
            nextCoords.push([centerCoord[0] - originCoords[i][1], centerCoord[1] + originCoords[i][0], id]);
        }
    } 
    else if (rotateCount % 4 == 2) {
        for (let i = 0; i < blockCoords.length; i++) {
            x = blockCoords[i][0];
            y = blockCoords[i][1];
            id = blockCoords[i][2];
            nextCoords.push([centerCoord[0] - originCoords[i][0], centerCoord[1] - originCoords[i][1], id]);
        }
    }
    else if (rotateCount % 4 == 3) {
        for (let i = 0; i < blockCoords.length; i++) {
            x = blockCoords[i][0];
            y = blockCoords[i][1];
            id = blockCoords[i][2];
            nextCoords.push([centerCoord[0] + originCoords[i][1], centerCoord[1] - originCoords[i][0], id]);
        }
    }

    // check if post-rotation coordinates is valid
    for (let i = 0; i < blockCoords.length; i++) {
        if (nextCoords[i][0] < 0 || nextCoords[i][0] >= cols) {
            return;
        }
    }
    // if post rotation coordinates are valid, assign to current block coordinates
    blockCoords = JSON.parse(JSON.stringify(nextCoords));
    blockCoords.sort(sortBlockCoords);
    for (let i = 0; i < blockCoords.length; i++) {
        boardArr[prevCoords[i][1]][prevCoords[i][0]] = "black";
        boardArr[blockCoords[i][1]][blockCoords[i][0]] = "curr";
    } 
}