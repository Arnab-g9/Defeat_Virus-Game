// Importing audio effects
const introMusic = new Audio("./music/introSong.mp3");
const shootingSound = new Audio("./music/shoooting.mp3");
const killEnemySound = new Audio("./music/killEnemy.mp3");
const gameOverSound = new Audio("./music/gameOver.mp3");
const heavyWeaponSound = new Audio("./music/heavyWeapon.mp3");
const hugeweaponSound = new Audio("./music/hugeWeapon.mp3");

introMusic.play();
//Besic environment setup
const canvas = document.createElement("canvas");
document.querySelector(".myGame").appendChild(canvas);
canvas.width= innerWidth;
canvas.height= innerHeight;
const context=canvas.getContext("2d");
const lightWeaponDamage = 10;
const heavyWeaponDamage = 20;

let difficulty = 2;
const form = document.querySelector("form");
const scoreBoard = document.querySelector(".scoreBoard");
let playerScore = 0;

//Besic Functions
//Event Listener for Difficulty form
document.querySelector("input").addEventListener("click",(e)=>{
e.preventDefault();

//making form invisable
form.style.display="none";

//stopping music
introMusic.pause();

//making Score-Board visable
scoreBoard.style.display="block";

//getting difficulty selected by user
const userValue=document.getElementById("difficulty").value;

if(userValue==="Easy"){
    setInterval(spawnEnemy, 2000);
    return (difficulty = 5);
}
if(userValue==="Medium"){
    setInterval(spawnEnemy, 1400);
    return (difficulty = 8);
}
if(userValue==="Hard"){
    setInterval(spawnEnemy, 1000);
    return (difficulty = 10);
}
if(userValue==="Insane"){
    setInterval(spawnEnemy, 700);
    return (difficulty = 12);
}

});

// Endscreen------------------------------------------
const gameoverLoader= () => {
    //Creating endscreen div and play again button and high score element
    const gameOverBanner = document.createElement("div");
    const gameOverBtn = document.createElement("button");
    const highScore = document.createElement("div");

    highScore.innerHTML = `High Score : ${
       localStorage.getItem("highScore")? localStorage.getItem("highScore") : playerScore
    }`;

    const oldHighSore = localStorage.getItem("highScore") && localStorage.getItem("highScore");

    if(oldHighSore < playerScore){
        localStorage.setItem("highScore", playerScore);

        //updating high score html
        highScore.innerHTML = `High Score: ${playerScore}`;
    }

    // adding text to playagain button
    gameOverBtn.innerText = "Play Again";

    gameOverBanner.appendChild(highScore);

    gameOverBanner.appendChild(gameOverBtn);

    // Making reload on clicking playAgain button
    gameOverBtn.onclick = () => {
        window.location.reload();
    };
    gameOverBanner.classList.add("gameover");

    document.querySelector("body").appendChild(gameOverBanner);
};

//----------------------------------------- Creating Player, Enemy, Weapon etc classes -----------------------------//

//setting player position to center
playerPosition={
    x: canvas.width / 2,
    y: canvas.height / 2,
};


//creating player class
class Player{
    constructor(x,y,radius,color){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
    }
    draw(){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 
        (Math.PI / 180) * 0,
        (Math.PI / 180) * 360, 
        false
        );
        context.fillStyle= this.color;
        

        context.fill();
    }  
}

//Creating Weapon Class
class Weapon{
    constructor(x,y,radius,color,velocity, damage){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
        this.damage=damage;
    }
    draw(){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 
        (Math.PI / 180) * 0,
        (Math.PI / 180) * 360, 
        false
        );
        context.fillStyle= this.color;
        context.fill();
    } 
    update(){
      this.draw();
      this.x+=this.velocity.x;
      this.y+=this.velocity.y;
       
    } 
}

//creating Huge-Weapon class
class HugeWeapon{
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.color="#fff";
       
    }
    draw(){
        context.beginPath();
        context.fillStyle= this.color;
        context.fillRect(this.x, this.y,200,canvas.height);
    } 
    update(){
      this.draw();
      this.x+=60;
     
      
       
    } 
}

//creating Enemy Class
class Enemy{
    constructor(x,y,radius,color,velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
    }
    draw(){
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 
        (Math.PI / 180) * 0,
        (Math.PI / 180) * 360, 
        false
        );
        context.fillStyle= this.color;
        

        context.fill();
    } 
    update(){
      this.draw();
      (this.x+=this.velocity.x), ( this.y+=this.velocity.y);
       
    } 
}
//---------------------------creating particle class---------------
const fraction=0.98;
class Particle{
    constructor(x,y,radius,color,velocity){
        this.x=x;
        this.y=y;
        this.radius=radius;
        this.color=color;
        this.velocity=velocity;
        this.alpha = 1;
    }
    draw(){
        context.save();

        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 
        (Math.PI / 180) * 0,
        (Math.PI / 180) * 360, 
        false
        );
        context.fillStyle= this.color;
        context.fill();
        context.restore();
    } 
    update(){
      this.draw();
      this.velocity.x*=fraction;
      this.velocity.y*=fraction;
      this.x+=this.velocity.x;
      this.y+=this.velocity.y;
      this.alpha-=0.01;
       
    } 
}

//------------------------------------------------------- Main Logic Satrts Here ----------------------------

// Createing Player Object, weapons Array, Enemy Array etc Array
const abhi=new Player(
    playerPosition.x, 
    playerPosition.y,
    15,
    "white"
);

const weapons = [];
const enemies = [];
const particles =[];
const hugeWeapons =[];

//------------------------- Function To  Spawn Enemy at random Location -----------------------------//
const spawnEnemy = ()=>{

    //generating random size for enemy
    const enemySize=Math.random()*(40-5)+5;

    //generating random color for enemy
    const enemyColor = `hsl(${Math.floor(Math.random() * 360)},100%,50%)`;

    // enemy's random spawn position
    let random;

    // Making Enemy Location random but only from outside of screen
    if(Math.random()<0.5){
        // Making x equal to very left of screen or very right of screen and setting y to any where vertically
        random={
            x: Math.random() < 0.5 ? canvas.width + enemySize : 0 - enemysize,
            y: Math.random()*canvas.height,
        };
    }
    else{
         // Making y equal to very up of screen or very down of screen and setting x to any where horizontally
        random={
            x: Math.random() * canvas.width,
            y: Math.random() < 0.5 ? canvas.height + enemySize : 0 - enemysize,
        };
    }

    //Finding Angle between center (means player position) and enemy position
        const myAngle = Math.atan2(
        canvas.height / 2 - random.y, 
        canvas.width / 2 - random.x
        );

        // making velocity or speed  of enemy by multipling chosen difficulty to radian
        const velocity={
            x: Math.cos(myAngle)* difficulty,
            y: Math.sin(myAngle)* difficulty,
        }


        //adding enemy to enemies array
    enemies.push(new Enemy(random.x, random.y, enemySize, enemyColor, velocity));
}

//-----------------------------------+ Creating Animation Function +----------------------------------------

let animationId;
function animation (){
    //making recursion
    animationId=requestAnimationFrame(animation);

    //Updating player score in score board in html
    scoreBoard.innerHTML = `Score : ${playerScore}`;

    //Clearing canvas on each frem
    context.fillStyle = "rgb(49,49,49, 0.2)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
   // drawing player
    abhi.draw();

    //Generating particles
    particles.forEach((particle,particleIndex) => {
        if(particle.alpha <= 0){
            particles.splice(particleIndex, 1);
        }
        else{
            particle.update();
        }
        
    });

    //Generating huge Weapone
    hugeWeapons.forEach((hugeWeapon, hugeWeaponeIndex)=>{
        if(hugeWeapon.x > canvas.width){
            hugeWeapons.splice(hugeWeaponeIndex,1);
        }
        else{
            hugeWeapon.update();
        }
    });
   

    //generating bullets
    weapons.forEach((weapon, weaponIndex) => {
        weapon.update();

        //removing Weapons if they are off screen
        if(
             weapon.x + weapon.radius < 1 ||
             weapon.y + weapon.radius < 1 ||
             weapon.x - weapon.radius > canvas.width || 
             weapon.y - weapon.radius > canvas.height

            ){
            weapons.splice(weaponIndex, 1);
        }
    });

    //generating enemies
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        //Finding the distance between player and enemy
        const distanceBetweenPlyerAndEnemy = Math.hypot(
            abhi.x-enemy.x,
            abhi.y-enemy.y
        );

        //Stoping game if enemy hit player
        if(distanceBetweenPlyerAndEnemy -  abhi.radius - enemy.radius < 1){
            cancelAnimationFrame(animationId);
            gameOverSound.play();
            hugeweaponSound.pause();
            shootingSound.pause();
            heavyWeaponSound.pause();
            killEnemySound.pause();
            return gameoverLoader();
        }


        hugeWeapons.forEach((hugeWeapon) => {
            //Finding distance between huge weapon and enemy
            const distanceBetweenHugeWeaponAndEnemy = hugeWeapon.x - enemy.x;
            if(
                distanceBetweenHugeWeaponAndEnemy <= 200 &&
                 distanceBetweenHugeWeaponAndEnemy >= -200
                 ){
                    //incrising player score when killing one enemy
                    playerScore+=10;

                    
                   
                    setTimeout(() => {
                        killEnemySound.play();
                    enemies.splice(enemyIndex, 1);
                   
                }, 0);
            }
        });

        weapons.forEach ((weapon, weaponIndex) => {
            //finding distance between weapon and enemy
            const distanceBetweenWeaponAndEnemy = Math.hypot(
                weapon.x-enemy.x,
                weapon.y-enemy.y
                );
                
                if(distanceBetweenWeaponAndEnemy - weapon.radius - enemy.radius < 1){
                     
                    //Reducing size of enemy on hit
                    if(enemy.radius > weapon.damage + 8){
                        gsap.to(enemy,{
                            radius: enemy.radius - weapon.damage,
                        });
                        setTimeout(() => {
                            weapon.splice(weaponIndex, 1);
                        }, 0);
                    }
                     //Removing enemy on hit if they are below 18
                    else{

                        for(let i=0; i < enemy.radius*8; i++){
                            particles.push(new Particle(weapon.x, weapon.y,Math.random()*2,enemy.color,{
                                x: (Math.random() - 0.5) * (Math.random() * 7),
                                y: (Math.random() - 0.5) * (Math.random() * 7),
                            })
                            );
                        }
                        //incrising player score when killing one enemy
                        playerScore+=10;
                        //Rendering player score in scoreboard html element
                        scoreBoard.innerHTML = `Score : ${playerScore}`;
                        
                        setTimeout(() => {
                            killEnemySound.play();
                            enemies.splice(enemyIndex, 1);
                            weapons.splice(weaponIndex, 1);
                        }, 0);
                    }
                }
        });
    });
}


//------------------------------------------Adding EventListeners---------------------------

//eventListener for light weapon aka left click
canvas.addEventListener("click",(e)=>{
    
    shootingSound.play();
    //finding angle between player position (center) and click co-ordinates
    const myAngle = Math.atan2(
    e.clientY-canvas.height/2, 
    e.clientX-canvas.width/2
    );
    //making const for light weapons 
    const velocity={
        x: Math.cos(myAngle)*6,
        y: Math.sin(myAngle)*6,
    }
    //Adding light weapons Array
    weapons.push(
        new Weapon(
            canvas.width/2,
             canvas.height/2,
             6,
             "white",
             velocity,
              lightWeaponDamage
            )
        );
});

//eventListener for Heavy weapon aka right click
canvas.addEventListener("contextmenu",(e)=>{
    
    e.preventDefault();
   

    if(playerScore < 20) return;
    heavyWeaponSound.play();

    //Decreasing player score for using Heavy Weapon
    playerScore -= 20;
    //updating player score in Score Board in html
    scoreBoard.innerHTML = `Score : ${playerScore}`;

    //finding angle between player position (center) and click co-ordinates
    const myAngle = Math.atan2(
    e.clientY-canvas.height/2, 
    e.clientX-canvas.width/2
    );
    //making const for light weapons 
    const velocity={
        x: Math.cos(myAngle)*3,
        y: Math.sin(myAngle)*3,
    };
    //Adding light weapons Array
    weapons.push(
        new Weapon(
            canvas.width/2,
             canvas.height/2,
             20,
             "cyan",
             velocity,
              heavyWeaponDamage
            )
        );
});
addEventListener("keypress",(e)=>{
    if(e.key === " "){
        
    if(playerScore < 50) return;

    //Decreasing player score for using Heavy Weapon
    playerScore -= 50;
    //updating player score in Score Board in html
    scoreBoard.innerHTML = `Score : ${playerScore}`;
    hugeweaponSound.play();
        hugeWeapons.push(new HugeWeapon(0,0));
    }
});

addEventListener("contextmenu",(e)=>{
   e.preventDefault();
});

addEventListener("resize",() => {
   window.location.reload();
});

animation();