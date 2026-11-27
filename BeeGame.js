"use strict"


// TODO
// make it so that diagonal movement doesnt get as fast
// make it so u can feel acceleration

let canvas;
let ctx;
let barStart;

let timeInterval;
let frame = 0;
let lastTime = 0;
let now;
let dt;

let gameSpeed = 0.1;

let input = new userInputController();

let player;
let rightBar;
let home;
let scene;

let keyW = new Key("w");
let keyS = new Key("s");
let keyA = new Key("a");
let keyD = new Key("d");

let keys = [keyW,keyS,keyA,keyD];



// debug
let DEBUG_lastKeyEvent;

function startTimer(){
    if (timeInterval == undefined){
        timeInterval = setInterval(gameLoop,1);
    }
}

function setup(keyEvent){
    canvas = document.getElementById("surface");
    ctx = document.getElementById("surface").getContext("2d"); 
    
    ctx.font = "12px Arial"

    // the bar will be 1/8 of the playable area
    barStart = canvas.width - (canvas.width/8);

    player = new Player(100,100);
    rightBar = new UI_RightBar()
    home = new Landmark_Home();
    let obst1 = new ObstacleRect(50,100,300,300,"blue","red",4);
    scene = [rightBar, home,obst1];

    scene.push(player);

    startTimer();
}

function gameLoop(){
    frame++;
    
    if (frame == 600){
        frame = 0;
    }

    now = performance.now();
    dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    ctx.clearRect(0,0,canvas.width,canvas.height);
    
    player.move();
    drawAll();
    

    // debug
    debug(DEBUG_lastKeyEvent);
}




















function drawAll(){
    for (let i = 0; i < scene.length; i++){
        scene[i].draw();
    }
}

function UI_RightBar(){
    this.draw = function() {
        ctx.beginPath();
        ctx.save();
        ctx.translate(barStart,0);
        ctx.fillStyle = "black";
        ctx.rect(0,0,5,canvas.height);
        ctx.fill();
        
        ctx.fillText("Caught bees",10,18);
        ctx.restore();
    }
}

function Landmark_Home(){
    this.draw = function(){
        ctx.save();
        ctx.translate(0,0);
        // outside green
        
        ctx.beginPath();
        ctx.rect(0,0,50,50);
        ctx.fillStyle = "lightgreen";
        ctx.fill();
        ctx.restore();


        ctx.restore();
    }
}














class Collidable {
    constructor(length, width, posX, posY){
        this.length = length;
        this.width = width;
        this.posX = posX;
        this.posY = posY;
    }

    static checkCollision(obj1, obj2){
        let results = [0,0];
        if (obj1.posX == obj2.posX + obj2.length || obj2.posX == obj1.posX + obj1.length){
            results[0] = 1;
        } else {
            results[0] = 0;
        }
        if (obj1.posY == obj2.posY + obj2.width || obj2.posY == obj1.posY + obj1.width){
            results[1] = 1;
        } else {
            results[0] = 0;
        }
    }
}

class ObstacleRect extends Collidable {
    constructor(length, width, posX, posY, innerColour, outlineColour, strokeSize){
        super(length, width, posX, posY);
        this.innerColour = innerColour;
        this.outline = outlineColour;
        this.strokeSize = strokeSize;
        
    }

    draw(){
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.posX,this.posY,this.length,this.width);
        ctx.fillStyle = this.innerColour;
        ctx.lineWidth = this.strokeSize;
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

}























class Player extends Collidable{
    constructor(posX, posY){
        super(posX, posY);
        this.posX = 0;
        this.posY = 0;
        this.dX = 0;
        this.dY = 0;
        this.dirX = 1;
        this.dirY = 1;

        this.maxSpeed = 6 * gameSpeed;
        this.speedMultiplier = 5 * gameSpeed;
        this.friction = 0.95;

        this.playerSize = 40;
    }


    draw = function(){
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.posX,this.posY,this.playerSize,this.playerSize);
        ctx.fillStyle = "lightblue";
        ctx.lineWidth = "3";
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    move = function(){
        for (let i = 0; i < keys.length; i++){
            let currentKey = keys[i];
            // console.log("here!");

            if (currentKey.state == "keydown"){
                switch (currentKey.name){
                    case ("w"):
                        this.dirY = -1;
                        this.dY += (this.speedMultiplier * this.dirY);
                        break;
                    case ("a"):
                        this.dirX = -1;
                        this.dX += (this.speedMultiplier * this.dirX)
                        break;
                    case ("s"):
                        this.dirY = 1;
                        this.dY += (this.speedMultiplier * this.dirY)
                        break;
                    case ("d"):
                        this.dirX = 1;
                        this.dX += (this.speedMultiplier * this.dirX)
                        break;
                }
            
            }
        }
        if (Math.abs(this.dX) > (this.maxSpeed)){
            this.dX = this.maxSpeed * this.dirX;
        }

        if (Math.abs(this.dY) > (this.maxSpeed)){
            this.dY = this.maxSpeed * this.dirY;
        }

        this.posX += this.dX;
        this.posY += this.dY;

        this.keepInPlayableArea();

        this.dX *= this.friction;
        this.dY *= this.friction;

    }

    keepInPlayableArea = function(){
        if (this.posX < 0){
            this.posX = 0;
        }

        if (this.posY < 0){
            this.posY = 0;
        }

        if (this.posX + this.playerSize > barStart){
            this.posX = barStart - this.playerSize;
        }

        if (this.posY + this.playerSize > canvas.height){
            this.posY = canvas.height - this.playerSize;
        }
    }

}

function userInputController(){
    this.handle = function(keyEvent){
        
        //debug
        DEBUG_lastKeyEvent = keyEvent;

        let currentKey = new Key(keyEvent.name);
        
        for (let i = 0; i < keys.length; i++){
            if (keyEvent.key == keys[i].name){
                currentKey = keys[i];
            }
        }

        currentKey.state = keyEvent.type;
    }

}

function Key(keyName){
    this.name = keyName;
    this.state = "none";
}

























function debug(keyEvent){
    let output = "";

    if (keyEvent != undefined){
        output += "===" + frame + " " + keyEvent.key 
        + " " + keyEvent.type + "===\n";
    } else {
        output += "===" + frame + " No input===\n";
    }

    for (let i = 0; i < keys.length; i++){
        output += keys[i].name + ": " + keys[i].state + "\n";
    }
    output += "x: " + player.posX.toFixed(1) + "\n";
    output += "Y: " + player.posY.toFixed(1) +"\n";
    output += "dX: " + player.dX.toFixed(3) + "\n";
    output += "dY: " + player.dY.toFixed(3) + "\n";
    
    output += "===" + frame + "===";
    
    console.log(output);
}