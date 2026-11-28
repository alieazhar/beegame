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
let obst1;

let keyW = new Key("KeyW");
let keyS = new Key("KeyS");
let keyA = new Key("KeyA");
let keyD = new Key("KeyD");
let keySpace = new Key("Space");
let keyShiftLeft = new Key("ShiftLeft");

let keys = [keyW,keyS,keyA,keyD,keyShiftLeft];



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

    player = new Player(200,200);
    rightBar = new UI_RightBar()
    home = new Landmark_Home();
    obst1 = new ObstacleRect(50,100,300,300,"blue","red",4);
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

    enforceAllCollisons();

    
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
    constructor(length, height, posX, posY){
        this.name = "Generic Collidable";
        this.length = length;
        this.height = height;
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

            debugCTX.save();
            debugCTX.translate(320,20);


            if (obj1.posX < 0){
                obj1.posX = 0;
            }

            if (obj1.posY < 0){
                obj1.posY = 0;
            }

            if (obj1.posX + obj1.length > barStart){
                obj1.posX = barStart - obj1.length;
            }

            if (obj1.posY + obj1.height > canvas.height){
                obj1.posY = canvas.height - obj1.height;
            }


            let results = [0,0];
            
            let obj1_strokeSize = 0;
            let obj2_strokeSize = 0;

            if (obj1.strokeSize != undefined){
                obj1_strokeSize = obj1.strokeSize;
            }

            if (obj2.strokeSize != undefined){
                obj2_strokeSize = obj2.strokeSize;
            }

            // A - - - - - B 
            // |           |   
            // |           |
            // |           |    E - - - - - F
            // |     1     |    |           |
            // |           |    |     2     |
            // |           |    |           |
            // C - - - - - D    G - - - - - H

            let pointA = [obj1.posX, obj1.posY];
            let pointB = [pointA[0] + obj1.length, obj1.posY];
            let pointC = [pointA[0], obj1.posY + obj1.height];
            let pointD = [pointB[0], pointC[1]];

            let pointE = [obj2.posX, obj2.posY];
            let pointF = [pointE[0] + obj2.length, obj2.posY];
            let pointG = [pointE[0], obj2.posY + obj2.height];
            let pointH = [pointF[0], pointG[1]];



            // if obj1 is to the left
            // if the position of (object 1 plus it's length and stroke size)
            //          is greater than the position of object2 plus its stroke size
            //          then it's past the left side of object 2s
            //          and then if the position of object 1 plus its length and its stroke size
            //          if that's less than object 2's right side

            // OBJ1 ON RIGHT
            if (pointB[0] > pointE[0] && pointB[0] < pointF[0] && pointA[0] < pointE[0]){
                results[0] = 1;
                debugCTX.fillText("RIGHT COLLISION!", 0, 40);
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = "rgba(255, 0, 0, 0.44)";
                ctx.rect(obj1.posX, obj1.posY, obj1.length, obj1.height);
                ctx.fill();
                ctx.restore();
            }

            // OBJ1 ON LEFT
            if (pointA[0]< pointF[0] && pointA[0] > pointE[0] && pointB[0] < pointF[0]){
                results[0] = 1;
                debugCTX.fillText("LEFT COLLISION!", 0, 40);
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = "rgba(0, 255, 0, 0.44)";
                ctx.rect(obj1.posX, obj1.posY, obj1.length, obj1.height);
                ctx.fill();
                ctx.restore();
            }

            // OBJ1 ON BOTTOM
            if (pointA[1] < pointG[1] && pointE[1] > pointC[1]){
                results[1] = 1;
            }

            // OBJ1 ON TOP
            if (pointE[1] < pointC[1] && pointA[1] < pointG[1]){
                results[1] = 1;
            }



            // if (obj1.posX + obj1.length + obj1_strokeSize > obj2.posX + obj2_strokeSize 
            //     && obj2.posX + obj2.length + obj2_strokeSize > obj1.posX + obj1_strokeSize){
            //     results[0] = 1;
            // }

            // if (obj1.posY + obj1.height + obj1_strokeSize > obj2.posY + obj2_strokeSize 
            //     && obj2.posY + obxj2.height + obj2_strokeSize > obj1.posY + obj1_strokeSize){
            //     results[1] = 1;
            // }


            // if (results[0] == 1 && results[1] == 1){
            //     debugCTX.fillText("XY COLLISION DETECTED!", 0, 40);
            //     ctx.save();
            //     ctx.fillStyle = "rgba(255, 0, 0, 0.44)";
            //     ctx.rect(obj1.posX, obj1.posY, obj1.length, obj1.height);
            //     ctx.fill();
            //     ctx.restore();

            //     obj1.dX = 0;
            //     obj1.dY = 0;


            // }

            debugCTX.restore();

        }
    }
}

class ObstacleRect extends Collidable {
    constructor(length, height, posX, posY, innerColour, outlineColour, strokeSize){
        super(length, height, posX, posY);
        this.name = "Generic ObstacleRect";
        this.innerColour = innerColour;
        this.outline = outlineColour;
        this.strokeSize = strokeSize;
        this.hasCollison = true;
        
    }

    draw(){
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.posX,this.posY,this.length,this.height);
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
        let length = 40;
        let height = 40;
        super(length,height,posX, posY);
        this.name = "Player";

        this.maxSpeed = 6 * gameSpeed;
        this.speedMultiplier = 7 * gameSpeed;
        this.friction = 0.94;

        this.isShifting = false;
        this.isSprinting = false;

        this.innerColour = "lightblue";

        this.hasCollison = true;
    }


    draw = function(){
        ctx.save();
        ctx.beginPath();
        ctx.rect(this.posX,this.posY,this.length,this.height);
        ctx.fillStyle = this.innerColour;
        ctx.lineWidth = "3";
        ctx.stroke();
        ctx.fill();
        ctx.restore();
    }

    move = function(){
        for (let i = 0; i < keys.length; i++){
            let currentKey = keys[i];

            if (currentKey.state == "keydown"){
                switch (currentKey.code){
                    case ("KeyW"):
                        this.dirY = -1;
                        this.dY += (this.speedMultiplier * this.dirY);
                        break;
                    case ("KeyA"):
                        this.dirX = -1;
                        this.dX += (this.speedMultiplier * this.dirX);
                        break;
                    case ("KeyS"):
                        this.dirY = 1;
                        this.dY += (this.speedMultiplier * this.dirY);
                        break;
                    case ("KeyD"):
                        this.dirX = 1;
                        this.dX += (this.speedMultiplier * this.dirX);
                        break;
                    case ("ShiftLeft"):
                        this.isShifting = true;
                        break;
                    case ("Space"):
                        this.isSprintisdg = true;
                        break;
                }
            
            }

            if (currentKey.state == "keyup"){
                switch (currentKey.code){
                    case("ShiftLeft"):
                        this.isShifting = false;
                        break;
                    case ("Space"):
                        this.isSprinting = false;
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

        this.posX += this.dX * (this.isShifting ? .5 : 1) * (this.isSprinting ? 2 : 1);
        this.posY += this.dY * (this.isShifting ? .5 : 1) * (this.isSprinting ? 2 : 1);

        this.dX *= this.friction;
        this.dY *= this.friction;

    }

}

function userInputController(){
    this.handle = function(keyEvent){
        
        //debug
        DEBUG_lastKeyEvent = keyEvent;

        let currentKey = new Key((keyEvent.code));
        
        for (let i = 0; i < keys.length; i++){
            if (keyEvent.code== keys[i].code){
                currentKey = keys[i];
            }
        }

        currentKey.state = keyEvent.type;
    }

}

function Key(keyCode){
    this.code = keyCode;
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
        debugCTX.fillText(("pressed: " + keyEvent.code),40,20);
    } else {
        debugCTX.fillText(("no input"),40,20);
    }

    debugCTX.fillText(("x: " + player.posX.toFixed(1)),150,20);
    debugCTX.fillText(("Y: " + player.posY.toFixed(1)),150,40);
    debugCTX.fillText(("dX: " + player.dX.toFixed(1)),150,60);
    debugCTX.fillText(("dY: " + player.dY.toFixed(1)),150,80);

    debugCTX.fillText(("x: " + obst1.posX.toFixed(1)),240,20);
    debugCTX.fillText(("Y: " + obst1.posY.toFixed(1)),240,40);
    debugCTX.fillText(("dX: " + obst1.dX.toFixed(1)),240,60);
    debugCTX.fillText(("dY: " + obst1.dY.toFixed(1)),240,80);
    

}