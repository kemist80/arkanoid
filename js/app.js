
/**
 * 
 * @todo: shots, grab ball, warp to next level, each brick type have different scores
 * 
 */

// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = 512;
canvas.height = 640;
document.body.appendChild(canvas);

var speed=5;
var isGameOver=false;

// The main game loop
var lastTime;

var balls=[];

var player = {
    pos: [226, 614],
    sprite: new Sprite('img/sprites3.png', [156, 305], [70, 26], 16, [0])
};

var brick_coords={
  '1': [27,69],  // gray
  '2': [27,98],  // red
  '3': [27,127], // yellow
  '4': [27,156], // blue
  '5': [27,185], // purple
  '6': [27,214], // green
  '7': [27,243], // black
  '8': [27,272]  // white
};

var brick_hits={
  '1': [2,8], // gray
  '2': 1, // red
  '3': 1, // yellow
  '4': 1, // blue
  '5': 1, // purple
  '6': 1, // green
  '7': 1, // black
  '8': 1  // white
};

var bricks=[];
var lastFire = Date.now();
var gameTime = 0;
var level = 1;
var lives = 3;
var terrainPattern;

// Speed in pixels per second
var playerSpeed = 400;
var bulletSpeed = 500;
var enemySpeed = 100;
var score=0;
var countdown = [];
var extras = [];
var explosions=[];
var bullets = [];
var applied_extra = 0;
var last_extra = 0;
var large_counter = 0;
var shrink_counter = 0;
var laser_counter = 0;
var pausing=0;
var isPaused=false;

var extra_coords={
  '1': [392,97],  // Enlarge
  '2': [392,134], // Slow
  '3': [392,171], // Two more balls
  '4': [392,210], // Bonus player
  '5': [392,246]  // Laser
};

var maps=[
   [
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['1','1','1','1','1','1','1','1','1','1','1'],
      ['2','2','2','2','2','2','2','2','2','2','2'],
      ['3','3','3','3','3','3','3','3','3','3','3'],
      ['4','4','4','4','4','4','4','4','4','4','4'],
      ['5','5','5','5','5','5','5','5','5','5','5'],
      ['6','6','6','6','6','6','6','6','6','6','6']
   ],
   [
      ['2','0','0','0','0','0','0','0','0','0','0'],
      ['2','3','0','0','0','0','0','0','0','0','0'],
      ['2','3','4','0','0','0','0','0','0','0','0'],
      ['2','3','4','5','0','0','0','0','0','0','0'],
      ['2','3','4','5','6','0','0','0','0','0','0'],
      ['2','3','4','5','6','7','0','0','0','0','0'],
      ['2','3','4','5','6','7','8','0','0','0','0'],
      ['2','3','4','5','6','7','8','2','0','0','0'],
      ['2','3','4','5','6','7','8','2','3','0','0'],
      ['2','3','4','5','6','7','8','2','3','4','0'],
      ['2','3','4','5','6','7','8','2','3','4','5'],
      ['1','1','1','1','1','1','1','1','1','1','6']
   ],
   [
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['6','6','6','6','6','6','6','6','6','6','6'],
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['8','8','8','3','3','3','3','3','3','3','3'],
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['2','2','2','2','2','2','2','2','2','2','2'],
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['3','3','3','3','3','3','3','3','8','8','8'],
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['5','5','5','5','5','5','5','5','5','5','5'],
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['4','4','4','3','3','3','3','3','3','3','3']
    ],
    [
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['0','0','0','0','0','0','0','0','0','0','0'],
      ['0','1','3','6','5','0','3','6','4','1','0'],
      ['0','4','6','3','2','0','6','3','1','4','0'],
      ['0','6','5','2','3','0','4','1','3','6','0'],
      ['0','3','2','5','6','0','1','4','6','3','0'],
      ['0','2','3','6','4','0','3','6','5','2','0'],
      ['0','5','6','3','1','0','6','3','2','5','0'],
      ['0','6','4','1','3','0','5','2','3','6','0'],
      ['0','3','1','4','6','0','2','5','6','3','0'],
      ['0','1','3','6','5','0','3','6','4','1','0'],
      ['0','4','6','3','2','0','6','3','1','4','0']
    ]
];


function main() {
  var now = Date.now();
  var dt = (now - lastTime) / 1000.0;

  update(dt);
  render();

  lastTime = now;
  requestAnimFrame(main);
};


function init() {
    terrainPattern = ctx.createPattern(resources.get('img/terrain.png'), 'repeat');

    document.getElementById('play-again').addEventListener('click', function() {
        reset();
    });

    reset();

    lastTime = Date.now();
    main();
}


function reset(){ 
  isGameOver=false;
  $('#game-over-overlay').hide();
  $('#game-over').hide();
  lives=3;
  level=1;
  bricks=[];
  drawMap();
  
  balls=[];  
  addBall();
}


function drawMap(){
  var curmap=maps[level-1];  

  // Draw bricks
  for (var row=0;row<curmap.length;row++){
    var maprow=curmap[row];
    
    for (var cell=0;cell<maprow.length;cell++){
      if (maprow[cell]==='0'){
        continue;
      }
      var x=2+(cell*46);
      var y=2+(row*23);
      var hits, temp;
      if (typeof(brick_hits[maprow[cell]]) === 'object'){
        temp=brick_hits[maprow[cell]];
        var min=temp[0];
        var max=temp[1];
        hits=Math.floor(Math.random() * (max - min + 1) + min);
      }else{
        hits=brick_hits[maprow[cell]];
      }
      bricks.push({
          hits: hits,
          pos: [x,y],
          sprite: new Sprite('img/sprites3.png', brick_coords[maprow[cell]], [46, 23], 16, [0])
      });
    }
  }
}

function update(dt) {
    gameTime += dt;
    
    if (!isGameOver){
      handleInput(dt);
      updateEntities(dt);
    }
    $('#score').html('Score: '+score);
    $('#lives').html('Lives: '+lives);
    $('#level').html('Level: '+level);
    $('#debug').html('Balls: '+balls.length+', bricks:'+bricks.length+', bullets: '+bullets.length+', extras: '+extras.length+', countdown: '+countdown.length);
    
    if (bricks.length==0){
      level++;
      drawMap();
      player = {
          pos: [226, 614],
          sprite: new Sprite('img/sprites3.png', [156, 305], [70, 26], 16, [0])
      };
      balls=[];
      extras=[];
      bullets=[];
      applied_extra = 0;
      large_counter = 0;
      shrink_counter = 0;
      laser_counter = 0;
      addBall();
      pausing=30;
    }
    
};


function updateEntities(dt) {
  var ball;
  var slow_rate=1;
  
  // Update all the explosions
  for(var i=0; i<explosions.length; i++) {
      explosions[i].sprite.update(dt);

      // Remove if animation is done
      if(explosions[i].sprite.done) {
          explosions.splice(i, 1);
          i--;
      }
  }
  
  if (isPaused){
    return;
  }
  
  if (pausing>0){
    pausing--;
    if (pausing==0){
      player.pos=[226, 614]; 
    }
    return;
  }
   
  
  // Move balls
  for (var j=0; j<balls.length;j++){
    ball=balls[j];
    
    ball.pos[0]+=ball.vx*slow_rate;
    ball.pos[1]+=ball.vy*slow_rate;
    
    if (ball.pos[0]>canvas.width-ball.sprite.size[0]/2){
      ball.vx*=-1;
      ball.pos[0]=canvas.width-ball.sprite.size[0]/2;
    }else if(ball.pos[0]<0){
      ball.vx*=-1;
      ball.pos[0]=0;
    }
    
    if (ball.pos[1]>canvas.height-ball.sprite.size[1]/2){
      balls.splice(j, 1);
      j--;
    }else if(ball.pos[1]<0){
      ball.vy*=-1;
      ball.pos[1]=0;
    }    
    
    if (ball.pos[1] > canvas.height-player.sprite.size[1]-15){
      if (player.pos[0]-20 < ball.pos[0] && ball.pos[0] < player.pos[0]+player.sprite.size[0]){
        ball.vy*=-1;
        ball.vx=10*(ball.pos[0]-(player.pos[0]+player.sprite.size[0]/2))/player.sprite.size[0];
      }
    }
        
    
//    ball.sprite.update(dt);
//    player.sprite.update(dt);
    
    // Check ball to bricks collisions
    for (var i=0;i<bricks.length;i++){
      if (boxCollides(ball.pos,[ball.sprite.size[0]/2,ball.sprite.size[1]/2],bricks[i].pos,bricks[i].sprite.size)){
        bricks[i].hits--;
        if (bricks[i].hits==0){
          var extra=0;
          extra=Math.floor(Math.random() * (12 - 1 + 1) + 1);
          while (extra==last_extra){
            extra=Math.floor(Math.random() * (12 - 1 + 1) + 1);
          }
          if (extra<6){
            extras.push({
              type: extra,
              pos: bricks[i].pos,
              sprite: new Sprite('img/sprites3.png', extra_coords[extra], [38, 28], 16, [0])
            });
            last_extra=extra;
          }
          bricks.splice(i, 1);
          i--;
          score+=100;
        }else{
          bricks[i].sprite=new Sprite('img/sprites3.png', brick_coords[8], [46, 23], 16, [0]);
          countdown.push({nr: i, timer: 5});
        }
        ball.vy*=-1;         
        break;
      }
    }
    
    // Check ball to ball collisions
//    for (var l=0; l<balls.length;l++){
//      if (boxCollides(ball.pos,[ball.sprite.size[0]/2,ball.sprite.size[1]/2],balls[l].pos,[balls[l].sprite.size[0]/2,balls[l].sprite.size[1]/2])){
//        ball.vx*=-1;
//        ball.vy*=-1;
//        balls[l].vx*=-1;
//        balls[l].vy*=-1;
//      }
//    }
  }
  
  // No balls
  if (balls.length==0 && !isGameOver){
    lives--;    
    if (lives==0){
      isGameOver=true;
      $('#game-over-overlay').show();
      $('#game-over').show();
    }else{   
    // Add an explosion
      explosions.push({
        pos: player.pos,
        sprite: new Sprite('img/sprites.png',
                           [0, 117],
                           [39, 39],
                           16,
                           [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                           null,
                           true)
      }); 
      player.pos=[226, 814];    
      player.sprite=new Sprite('img/sprites3.png', [156, 305], [70, 26], 16, [0]);
      extras=[];
      balls=[];
      bullets=[];
      addBall(); 
      applied_extra=0;  
      large_counter=0;
      shrink_counter=0;
      laser_counter=0;
      pausing=70;
    }
  }
  

  for (var i=0;i<countdown.length;i++){
    if (countdown[i].timer>0){
      countdown[i].timer--;
      if (countdown[i].timer==0){
        if (typeof bricks[countdown[i].nr] !=='undefined'){
          bricks[countdown[i].nr].sprite=new Sprite('img/sprites3.png', brick_coords[1], [46, 23], 16, [0]);
        }
        countdown.splice(i, 1);
        i--;
      }
    }
  }
  
  
  // Extras fall
  for (var i=0;i<extras.length;i++){
    extras[i].pos[1]+=3;
    if (extras[i].pos[1]>canvas.height){
      extras.splice(i, 1);
      i--;
    }else if (boxCollides(extras[i].pos,[extras[i].sprite.size[0]/2,extras[i].sprite.size[1]/2],player.pos,player.sprite.size)){
      applied_extra=extras[i].type;
      extras.splice(i, 1);
      i--;         

      // Bonus player
      if (applied_extra==4){
        lives++;
      // 3 balls
      }else if(applied_extra==3){
        while (balls.length<3){
          addBall(true);       
        }
      // Shrink player
      }else if(applied_extra==2){
        shrink_counter=1000;
        large_counter=0;
        laser_counter=0;
      // Enlarge player
      }else if(applied_extra==1){
        large_counter=1000;
        shrink_counter=0;
        laser_counter=0;
      // Laser  
      }else if(applied_extra==5){
        laser_counter=1000;
        shrink_counter=0;
        large_counter=0;
      }
    }
  }    
  
  
  // Enlarged player
  if (applied_extra!=2 && applied_extra!=5 && large_counter>0){
    large_counter--;
    if (large_counter>0){
      player.pos[1]=614;
      player.sprite = new Sprite('img/sprites3.png', [238, 305], [100, 30], 16, [0]);
    }else{
      player.sprite = new Sprite('img/sprites3.png', [156, 305], [70, 26], 16, [0]);
      applied_extra=0;
      player.pos[1]=614;
    }
  }
  
  // Shrinked player
  if (applied_extra!=1 && applied_extra!=5 && shrink_counter>0){
    shrink_counter--;
    if (shrink_counter>0){
      player.sprite = new Sprite('img/sprites3.png', [102, 311], [40, 22], 16, [0]);
      player.pos[1]=624;
    }else{
      player.sprite = new Sprite('img/sprites3.png', [156, 305], [70, 26], 16, [0]);
      applied_extra=0;
      player.pos[1]=614;
    }
  }
  
  // Laser equipped player
  if (applied_extra!=1 && applied_extra!=2 && laser_counter>0){
    laser_counter--;
    if (laser_counter>0){
      player.sprite = new Sprite('img/sprites3.png', [361, 305], [70, 26], 16, [0]);
      player.pos[1]=614;
    }else{
      player.sprite = new Sprite('img/sprites3.png', [156, 305], [70, 26], 16, [0]);
      applied_extra=0;
      player.pos[1]=614;
    }
  }
  
  
  // Laser bullets
  for (var i=0;i<bullets.length;i++){
    var bullet = bullets[i];
    bullet.pos[1] -= bulletSpeed * dt;

    // Remove the bullet if it goes offscreen
    if (bullet.pos[1] < 0 ) {
      bullets.splice(i, 1);
      i--;
      continue;
    }
    
    // Check bullet to bricks collisions
    for (var m=0;m<bricks.length;m++){
      if (boxCollides(bullet.pos,bullet.sprite.size,bricks[m].pos,bricks[m].sprite.size)){
        bricks[m].hits--;
        if (bricks[m].hits==0){
          var extra=0;
          extra=Math.floor(Math.random() * (10 - 1 + 1) + 1);
          while (extra==last_extra){
            extra=Math.floor(Math.random() * (10 - 1 + 1) + 1);
          }
          if (extra<6){
            extras.push({
              type: extra,
              pos: bricks[m].pos,
              sprite: new Sprite('img/sprites3.png', extra_coords[extra], [38, 28], 16, [0])
            });
            last_extra=extra;
          }
          bricks.splice(m, 1);
          m--;
          score+=100;
        }else{
          bricks[m].sprite=new Sprite('img/sprites3.png', brick_coords[8], [46, 23], 16, [0]);
          countdown.push({nr: m, timer: 5});
        }
        bullets.splice(i, 1);
        i--;         
        break;
      }
    }
  }   
  
}


function addBall(up){
  if (typeof up !== 'undefined' && up){
    ang=-45;
  }else{
    var dir = Math.round(Math.random() * 1);
    if (dir === 1) {
      ang = 45;
    } else {
      ang = 135;
    }  
  }
  balls.push({
    vx: Math.round(speed * Math.cos((ang) * Math.PI / 180)),
    vy: Math.round(speed * Math.sin((ang) * Math.PI / 180)),
    pos: [Math.floor(Math.random() * (400 - 100 + 1) + 100), 300],
    sprite: new Sprite('img/sprites3.png', [174, 268], [28, 28], 16, [0])
  });
}


// Draw everything
function render() {
    ctx.fillStyle = terrainPattern;
    ctx.save();
    ctx.translate(0,0);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();    

    // Render the player if the game isn't over
    if(!isGameOver) {
      renderEntity(player);      
    }
    
    if (pausing==0){
      renderEntities(extras);
      renderEntities(balls);
      renderEntities(bullets);
    }    
    
    renderEntities(bricks);    
    renderEntities(explosions);    
};


function renderEntities(list) {
    for(var i=0; i<list.length; i++) {
        renderEntity(list[i]);
    }    
}


function renderEntity(entity) {
    ctx.save();
    ctx.translate(entity.pos[0], entity.pos[1]);
    entity.sprite.render(ctx);
    ctx.restore();
}


function handleInput(dt) {
  if (pausing>0){
    return;
  }
  
  if (input.isDown('LEFT') || input.isDown('a')) {
      player.pos[0] -= playerSpeed * dt;
  }

  if(input.isDown('RIGHT') || input.isDown('d')) {
      player.pos[0] += playerSpeed * dt;
  }    

  if (player.pos[0]<0){
    player.pos[0]=0;
  }

  if (player.pos[0] > canvas.width-player.sprite.size[0]+10){
    player.pos[0]=canvas.width-player.sprite.size[0]+10;
  }

    if(input.isDown('SPACE') &&
       !isGameOver && 
       !isPaused &&
       Date.now() - lastFire > 200 
       && laser_counter>0) {
        var x1 = player.pos[0] + 8;
        var x2 = player.pos[0] + 50;
        var y = player.pos[1];

        bullets.push({ pos: [x1, y],
                       sprite: new Sprite('img/sprites3.png', [328, 92], [5, 7]) });
        bullets.push({ pos: [x2, y],
                       sprite: new Sprite('img/sprites3.png', [328, 92], [5, 7]) });

        lastFire = Date.now();
    }
    
}


resources.load([
    'img/sprites.png',
    'img/sprites3.png',
    'img/terrain.png'
]);
resources.onReady(init);


$(window).blur(function(){
  isPaused=true;
});
$(window).focus(function(){
  isPaused=false;
});


