 
class Game {
  constructor() {
    this.player = new Player(this);
    this.world = new World(this);
    this.menu = document.getElementById("menu");
    this.startButton = document.getElementById("start-button");
    this.stampCount = document.getElementById("stamp-count");
    this.healthFill = document.getElementById("health-fill");
    this.isRunning = false;

    this.startButton.addEventListener("click", () => this.start());

    // settings
    this.stampsToCollect = 5;
    this.currentStamps = 0;
  }

  start() {
    this.menu.classList.add("hidden");
    this.isRunning = true;
    this.world.generateRoom();
    this.gameLoop();
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.player.update();
    this.world.update();
    this.checkCollisions();
    this.updateHUD();

    requestAnimationFrame(() => this.gameLoop());
  }

  checkCollisions() {
    
    this.world.stamps.forEach((stamp, index) => {
      if (this.checkCollision(this.player.element, stamp)) {
        stamp.remove();
        this.world.stamps.splice(index, 1);
        this.currentStamps++;
        if (this.currentStamps >= this.stampsToCollect) {
          this.win();
        }
      }
    });

   
    this.world.enemies.forEach((enemy) => {
      if (this.checkCollision(this.player.element, enemy)) {
        this.player.takeDamage();
      }
    });
  }

  checkCollision(a, b) {
    const rectA = a.getBoundingClientRect();
    const rectB = b.getBoundingClientRect();
    return !(
      rectA.right < rectB.left ||
      rectA.left > rectB.right ||
      rectA.bottom < rectB.top ||
      rectA.top > rectB.bottom
    );
  }

  updateHUD() {
    this.stampCount.textContent = `${this.currentStamps}/${this.stampsToCollect}`;
    this.healthFill.style.width = `${this.player.health}%`;
  }

  win() {
    this.isRunning = false;
    alert("You won! You collected all stamps!");
    location.reload();
  }

  gameOver() {
    this.isRunning = false;
    alert("Game Over!");
    location.reload();
  }
}

class Player {
  constructor(game) {
    this.game = game;
    this.element = document.getElementById("player");
    this.x = 100;
    this.y = 100;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 5;
    this.jumpForce = -15;
    this.gravity = 0.5;
    this.health = 100;
    this.isGrounded = false;
    this.keys = {
      left: false,
      right: false,
    };

    this.setupControls();
    this.updatePosition();
  }

  setupControls() {
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "ArrowLeft":
          this.keys.left = true;
          break;
        case "ArrowRight":
          this.keys.right = true;
          break;
        case "Space":
          if (this.isGrounded) this.jump();
          break;
      }
    });

    document.addEventListener("keyup", (e) => {
      switch (e.code) {
        case "ArrowLeft":
          this.keys.left = false;
          break;
        case "ArrowRight":
          this.keys.right = false;
          break;
      }
    });
  }

  update() {
    // Horizontal 
    if (this.keys.left) this.velocityX = -this.speed;
    else if (this.keys.right) this.velocityX = this.speed;
    else this.velocityX = 0;

    // Vertical 
    this.velocityY += this.gravity;
  
    this.x += this.velocityX;
    this.y += this.velocityY;

    
    this.x = Math.max(0, Math.min(this.x, 768));

   
    if (this.y > 548) {
      this.y = 548;
      this.velocityY = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    this.updatePosition();
  }

  jump() {
    this.velocityY = this.jumpForce;
    this.isGrounded = false;
  }

  updatePosition() {
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }

  takeDamage() {
    this.health = Math.max(0, this.health - 10);
    if (this.health <= 0) {
      this.game.gameOver();
    }
  }
}

class World {
  constructor(game) {
    this.game = game;
    this.element = document.getElementById("world");
    this.stamps = [];
    this.enemies = [];
  }

  generateRoom() {
    const room = document.createElement("div");
    room.className = "room";

    const floor = document.createElement("div");
    floor.className = "floor";
    room.appendChild(floor);

    this.element.appendChild(room);

    // Generate stamps
    for (let i = 0; i < this.game.stampsToCollect; i++) {
      const stamp = document.createElement("div");
      stamp.className = "stamp";
      stamp.style.left = `${200 + i * 100}px`;
      stamp.style.top = `${300 + (i % 2) * 100}px`;
      room.appendChild(stamp);
      this.stamps.push(stamp);
    }

 
    for (let i = 0; i < 3; i++) {
      const enemy = document.createElement("div");
      enemy.className = "enemy";
      enemy.style.left = `${300 + i * 150}px`;
      enemy.style.top = "500px";
      enemy.dataset.direction = 1;
      enemy.dataset.baseX = 300 + i * 150;
      room.appendChild(enemy);
      this.enemies.push(enemy);
    }
  }

  update() {
 
    this.enemies.forEach((enemy) => {
      const baseX = parseInt(enemy.dataset.baseX);
      const currentX = parseInt(enemy.style.left);
      const direction = parseInt(enemy.dataset.direction);

      if (currentX > baseX + 100) enemy.dataset.direction = -1;
      if (currentX < baseX - 100) enemy.dataset.direction = 1;

      enemy.style.left = currentX + direction * 2 + "px";
    });
  }
}

 
window.addEventListener("load", () => {
  new Game();
});
 