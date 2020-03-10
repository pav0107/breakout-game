const canvas = document.getElementById('canvas'); // store reference to canvas element in canvas constant
const ctx = canvas.getContext('2d'); // create ctx constant to store 2D rendering context

let score = 0;  // start with a score of 0
let lives = 5;  // This challenge states that after five lives the game is over.

const brickRowCount = 9;        // The number of bricks on each row
const brickColumnCount = 8;     // The number of bricks on each column

////////////////////////////////////////////////////
// CREATE PROPERTIES FOR BALL, PADDLE AND BRICK


// Create ball properties
const ball = {
    x: canvas.width / 2, // to start ball in the middle (horizontally) of the page(paddle)
    y: canvas.height - 15, // most versions of this game have the ball starting on the paddle, so that's what I've done here.
    radius: 10,
    dx: 4,      // change in x-axis every time the ball is redrawn
    dy: -4      // change in y-axis every time the ball is redrawn (negative values are up by default, and that's what we want.)
}

// Create paddle properties
const paddle = {
    x: canvas.width / 2 - 40,       // left-hand side of paddle is half-way across the page minus half the width of the paddle
    y: canvas.height - 10,          // I wanted the bottom of the paddle on the bottom of the canvas
    w: 80,
    h: 10,
    speed: 8,
    dx: 0
}

// Create brick properties
const brickInfo = {
    w: 70,
    h: 15,
    padding: 10,    // creates space around each brick, thus between bricks
    offsetX: 45,    // 45px from left edge of canvas
    offsetY: 60,    //60 px from top edge of canvas
    visible: true   // initially set to visible, but this will later in the code be changed to false if hit 
                    // by the ball, and reset if all the bricks are hit or all the lives are lost.
}

// Create bricks
const bricks = [];  // create an empty array to hold the bricks
for(let r = 0; r < brickRowCount; r++) {
    bricks[r] = [];
    for(let c =0; c < brickColumnCount; c++) {
        const x = r * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;    // for x values of bricks
        const y = c * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;    // for y values of bricks
        bricks[r][c] = { x, y, ...brickInfo }   // this object contains the x and y position of every brick
                                                // and the spread operator brings in contents of the brickInfo object
    }
}


////////////////////////////////////////////////////
// DRAW BALL, PADDLE AND BRICK ON CANVAS


// Draw ball on canvas
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); // x and y coords of arc's center, arc radius, start and end angle
    ctx.fillStyle = '#4285F4';
    ctx.fill();
    ctx.closePath();
}

// Draw paddle on canvas
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h); // x and y values of top left hand corner, then width and height
    ctx.fillStyle = '#EA4335';
    ctx.fill();
    ctx.closePath();
}

// Draw bricks on canvas
function drawBricks() {
    bricks.forEach(column => {
        column.forEach(brick => {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.w, brick.h);
            ctx.fillStyle = brick.visible ? '#FBBC04' : 'transparent';  // colour of brick when visible, then transparent for when the brick is struck.
            ctx.fill();
            ctx.closePath();
        })
    })
}


////////////////////////////////////////////////////
// DRAW SCORE AND LIVES ON CANVAS

// Draw score on canvas
function drawScore() {
    ctx.font = '20px Roboto';   // I chose another font Google used for this
    ctx.fillStyle = "#EA4335";  // Google's red
    ctx.fillText(`Score: ${score}`, canvas.width - 200, 35) // I chose this position by playing around.
}

// Draw lives on canvas
function drawLives() {
    ctx.font = '20px Roboto';
    ctx.fillStyle = "#34A853";  // Google's green
    ctx.fillText(`Lives: ${lives}`, canvas.width - 100, 35);
    
}


////////////////////////////////////////////////////
// MOVE PADDLE AND BALL (INC. COLLISIONS WITH WALL AND PADDLE)

// Move paddle on canvas
function movePaddle() {
    paddle.x += paddle.dx;  // add dx value to paddle's x value

    //  Wall detection
    if(paddle.x + paddle.w > canvas.width) { 
    // if left-side position of paddle + paddle width, i.e. right-hand side of paddle is at the right-hand edge ...
        paddle.x = canvas.width - paddle.w;
        // the left-side position of the paddle will stay one paddle-width away from edge i.e. it will remain flush.
    }
    if(paddle.x < 0) {
        paddle.x = 0;
    // if left-hand edge of paddle meets the left-edge of canvas that's as far left as it'll go.
    }
}

// Move ball on canvas
function moveBall() {
    ball.x += ball.dx;  // add dx value to ball's x value
    ball.y += ball.dy;  // add dy value to ball's y value

    // Wall collision (left/right)
    if(ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    // if the right-hand side of the ball (centre + radius) is greater than the width of the canvas
    // or the left-hand side of the ball (centre - radius) is less the left-hand side of the canvas ...
        ball.dx *= -1;
    // ... reverse the movement of the ball on the x-axis
    }

    // Wall collision (top/bottom)
    if(ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) { 
    // if the top of the ball (centre + radius) is greater than the height of the canvas
    // or the bottom of the ball (centre - radius) is lower the bottom of the canvas ...
        ball.dy *= -1;
    // ... reverse the movement of the ball on the y-axis
    }

    // Paddle collision
    if(ball.x > paddle.x &&   // if the center of the ball > left-hand edge of paddle
        ball.x < paddle.x + paddle.w &&   // and the center of the ball < right-hand edge of paddle
        ball.y + ball.radius > paddle.y)    // and bottom of the ball > top of the paddle i.e. it touches the top of the paddle
        {
        ball.dy = -Math.abs(ball.dy)           // reverse the movement of the ball on the y-axis
                                                // I added Math.abs to solve problem of ball travelling within paddle if hit at certain angles on the edge.
    }
    
    
    // Fine tuning the ball movement if it hits more of the left edge of paddle as opposed to the top edge
    if(ball.x < paddle.x &&   // if the center of the ball < left-hand edge of paddle and
        ball.x + ball.radius > paddle.x && //the right hand ege of the ball > left edge of paddle
        ball.y + ball.radius > paddle.y)    // and bottom of the ball > top of the paddle i.e. it touches the top of the paddle
        {
        ball.dx = -ball.dx           // reverse the movement of the ball on the x-axis
    }

    // Fine tuning the ball movement if it hits more of the right edge of paddle as opposed to the top edge
    if(ball.x - ball.radius < paddle.x + paddle.w && // If the left-hand edge of the ball is less than the right edge of the paddle
        ball.x > paddle.x + paddle.w &&   // and the center of the ball < right-hand edge of paddle
        ball.y + ball.radius > paddle.y)    // and bottom of the ball > top of the paddle i.e. it touches the top of the paddle
        {
        ball.dx = -ball.dx           // reverse the movement of the ball on the x-axis
    }


////////////////////////////////////////////////////////
    

    // Brick collision
    bricks.forEach(column => {
        column.forEach(brick => {
            if(brick.visible) {
                if(ball.x + ball.radius > brick.x && //left brick side check
                    ball.x - ball.radius < brick.x + brick.w && // right brick side check
                    ball.y + ball.radius > brick.y && //top brick side check
                    ball.y - ball.radius < brick.y + brick.h // bottom brick side check)
                ){
                    ball.dy *= -1;
                    brick.visible = false;

                    increaseScore();
                    }
            }
        })
    })

    // Hit bottom wall - lose life
if(ball.y + ball.radius > canvas.height) {
    lives--;
    if(lives === 0) {
        alert("GAME OVER");             // create an end to the game if five lives are lost.
        document.location.reload();     // reload page
        clearInterval(interval);        // for Chrome to end game
    }
    else {
        //reset ball position
        ball.x =  canvas.width / 2;
        ball.y = canvas.height - 15;
        //reset paddle position
        paddle.x = canvas.width / 2 - 40;
        paddle.y = canvas.height - 10;
    }
}
}


////////////////////////////////////////////////////
// INCREASE SCORE 


// Increase score
function increaseScore() {
    score++;

    //to reset bricks if they're all gone
    if(score % (brickRowCount * brickColumnCount) === 0) { 
    // if all the bricks are gone, the score divided by the number of bricks won't leave a remainder.
    // that will be the case no matter how many 'rounds' are completed.
        showAllBricks();

        ball.dx += 2;       // to create 'levels' once someone completes all the bricks, increase speed of ball
        ball.dy -= 2;
    }
}

////////////////////////////////////////////////////
// MAKE ALL BRICKS APPEAR

// Make all bricks appear
function showAllBricks() {
    bricks.forEach(column => {
        column.forEach(brick => (brick.visible = true));    // make all bricks visible again
    });
}


////////////////////////////////////////////////////
// DRAW EVERYTHING


// Draw everything
function draw() { 
    ctx.clearRect(0, 0, canvas.width, canvas.height);   
    // clear canvas every time we draw, otherwise the ball and paddle would create a 'streak'.
    
    drawBall();
    drawPaddle();
    drawBricks();
    drawScore();
    drawLives();
}


////////////////////////////////////////////////////
// UPDATE 


// Update canvas drawing and animation
function update() {
    movePaddle();
    moveBall();

    // Draw everything
    draw();

    requestAnimationFrame(update);
}

update();


////////////////////////////////////////////////////
// EVENTS 


// Keydown event
function keyDown(e) {
    if(e.key === 'ArrowRight' || e.key === 'Right') {
    // Most browsers use ArrowLeft and ArrowRight for the left/right cursor keys, 
    // but IE/Edge browsers use Left and Right so need to include these.
        paddle.dx = paddle.speed;   // move the paddle dx increments in the positive x direction at the speed given earlier.
    } else if(e.key === 'ArrowLeft' || e.key === 'Left') {
        paddle.dx = -paddle.speed;  // move the paddle dx increments in the negative x direction at the speed given earlier.
    }
}

// Keyup event
function keyUp(e) {         //function taking in e (an event)
    if(e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'Left' || e.key === 'ArrowLeft');
        paddle.dx = 0;
}


// Keyboard event handlers
document.addEventListener('keydown', keyDown);  // listens for a key to be pressed down, then calls function keyDown()
document.addEventListener('keyup', keyUp);      // listens for a key to be release, then calls function keyUp()