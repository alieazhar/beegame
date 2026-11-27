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
let debugCanvas;
let debugCTX;

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
    enforceAllCollisons();
    

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
        this.name = "Generic Collidable";
        this.length = length;
        this.width = width;
        this.posX = posX;
        this.posY = posY;
        this.dX = 0;
        this.dY = 0;
        this.dirX = 1;
        this.dirY = 1;
        this.hasCollison = false;
    }

    static enforceCollision(obj1, obj2){
        if (obj1.hasCollison && obj2.hasCollison){
            // console.log("here!");
            let results = [0,0];
            // if the x coord of object 1 is less than the x of obj 2 

            if (obj1.posX + obj1.length > obj2.posX && obj2.posX + obj2.length > obj1.posX){
                results[0] = 1;
                console.log(`${obj1.name} collided with ${obj2.name}`);
            }


            if (obj1.posY + obj1.width > obj2.posY && obj2.posY + obj2.width > obj1.posY){
                results[1] = 1;
            }

            if (results[0] == 1){
                obj1.posX = obj2.posX - obj1.length;
                obj1.dX = 0;
            }

            if (results[1] == 1){
                obj1.posY = obj2.posY - obj1.width;
                obj1.dY = 0;
            }
        }
    }
}

class ObstacleRect extends Collidable {
    constructor(length, width, posX, posY, innerColour, outlineColour, strokeSize){
        super(length, width, posX, posY);
        this.innerColour = innerColour;
        this.outline = outlineColour;
        this.strokeSize = strokeSize;
        this.dX = 0;
        this.dY = 0;
        this.dirX = 1;
        this.dirY = 1;
        this.hasCollison = true;
        
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

function enforceAllCollisons(){
    for (let i = 0; i < scene.length; i++){
        let curr = scene[i];

        for (let j = 0; j < scene.length; j++){
            if (i !== j){
                Collidable.enforceCollision(curr,scene[j]);
            }
        }
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

        this.length = 40;
        this.width = 40;
        this.hasCollison = true;
    }


    draw = function(){
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.posX,this.posY,this.length,this.width);
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



























function debugCanvasSetup(){
    debugCanvas = document.getElementById("debug");
    debugCTX = document.getElementById("debug").getContext("2d"); 
    
    debugCTX.font = "14px Arial"
}

function debug(keyEvent){
    // let output = "";

    // if (keyEvent != undefined){
    //     output += "===" + frame + " " + keyEvent.key 
    //     + " " + keyEvent.type + "===\n";
    // } else {
    //     output += "===" + frame + " No input===\n";
    // }

    // for (let i = 0; i < keys.length; i++){
    //     output += keys[i].name + ": " + keys[i].state + "\n";
    // }
    // output += "x: " + player.posX.toFixed(1) + "\n";
    // output += "Y: " + player.posY.toFixed(1) +"\n";
    // output += "dX: " + player.dX.toFixed(3) + "\n";
    // output += "dY: " + player.dY.toFixed(3) + "\n";
    
    // output += "===" + frame + "===";
    
    // console.log(output);
    debugCTX.save();
    debugCTX.clearRect(0, 0, debugCanvas.width, debugCanvas.height);

    debugCTX.translate(20, 70);
    debugCTX.rotate((Math.PI / 2) * 3);

    debugCTX.fillStyle = "red";
    debugCTX.fillText("DEBUG", 0, 0);

    debugCTX.restore();

    if (keyEvent != undefined){
        debugCTX.fillText(("pressed: " + keyEvent.key),40,20);
    } else {
        debugCTX.fillText(("no input"),40,20);
    }

    debugCTX.fillText(("x: " + player.posX.toFixed(1)),130,20);
    debugCTX.fillText(("Y: " + player.posY.toFixed(1)),130,40);
    debugCTX.fillText(("dX: " + player.dX.toFixed(1)),130,60);
    debugCTX.fillText(("dY: " + player.dY.toFixed(1)),130,80);
    

}