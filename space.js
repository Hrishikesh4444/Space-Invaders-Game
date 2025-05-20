//board
let tileSize = 32;
let rows = 18;
let columns = 20;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

//ship
let shipWidth = tileSize*2;
let shipHeight = tileSize;
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*2;

let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}

let shipImg;
let shipVelocityX=tileSize;

//aliens
let alienArray = [];
let alienWidth = tileSize*2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;


let alienRow=2;
let alienCol=3;
let alienCnt=0;
let alienVelocityX=1;

let alienImg;


//bullets
let bulletArray=[];
let bulletVelocityY=-10;


let score=0;
let gameOver=false;

let gameOverImg;
let gameOverX=200;
let gameOverY=100;
let gameOverWidth=250;
let gameOverHeight=35;

window.onload = function() {
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); //used for drawing on the board

    shipImg = new Image();
    shipImg.src = "./img/ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg=new Image();
    alienImg.src="./img/alien.png";
    createAliens();

    gameOverImg=new Image();
    gameOverImg.src="./img/game-over.png";

    requestAnimationFrame(update);
    document.addEventListener("keydown",moveShip)
    document.addEventListener("keyup",shoot)

}
//Call the update() function again before the next screen repaint (~60 times per second)
function update() {
    requestAnimationFrame(update);

    if(gameOver){
        context.drawImage(gameOverImg,gameOverX,gameOverY,gameOverWidth,gameOverHeight);
        return;
    }   
    context.clearRect(0,0,board.width,board.height);

    //ship
    
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    //alien
    for(let i=0;i<alienArray.length;i++){
        let alien=alienArray[i];
        if(alien.alive){
            alien.x+=alienVelocityX;

            if(alien.x + alien.width >= board.width || alien.x<=0) {
                alienVelocityX*=-1;
                alien.x+=alienVelocityX*2; //correct position of side aliens. Without it, aliens hit the wall, reverse direction, but don’t visibly correct their overstepped position, leading to a bad look.
                //MOreover bouncing effect

                //move aliens down one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }

            }
            context.drawImage(alienImg,alien.x,alien.y,alien.width,alien.height);

            if(alien.y >= ship.y) gameOver=true;
        }
    }

    //bullet
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle="yellow";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        //bullet collision with aliens
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCnt--;
                score += 100;
            }
        }
    }

    //clear top bullets
    while(bulletArray.length>0 && (bulletArray[0].used || bulletArray[0].y<0)){
        bulletArray.shift();
    }

    //increase aiens
    if(alienCnt==0){
        alienCol=Math.min(alienCol+1,columns/2 -2); // 16/2-6 = 6
        alienRow=Math.min(alienRow+1,rows-4);
        alienVelocityX += 0.3;
        alienArray=[];
        bulletArray=[];
        createAliens();
    }

    //score
    context.fillStyle="white";
    context.font="16px courier";
    context.fillText(score, 5, 20);
}

function moveShip(e) {
    if (gameOver) return;
    

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX; //move left one tile
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; //move right one tile
    }
}

function createAliens() {
    for (let c = 0; c < alienCol; c++) {
        for (let r = 0; r < alienRow; r++) {
            let alien = {
                img: alienImg,
                x : alienX + c*alienWidth,
                y : alienY + r*alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCnt = alienArray.length;
}
 
function shoot(e) {
    if (gameOver) return;
    

    if (e.code == "Space") {
        //shoot
        let bullet = {
            x : ship.x + shipWidth*15/32,
            y : ship.y,
            width : tileSize/8,
            height : tileSize/2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
