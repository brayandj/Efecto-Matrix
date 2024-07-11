const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Column {
  constructor(x, fontSize, canvasHeight, speed) {
    this.x = x;
    this.y = Math.random() * canvasHeight - canvasHeight;
    this.fontSize = fontSize;
    this.canvasHeight = canvasHeight;
    this.speed = speed;
    this.characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネへメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789';
    this.text = '';
    this.generateText();
    this.flashInterval = Math.random() * 200 + 50;
    this.lastFlashTime = 0;
  }

  generateText() {
    const length = Math.floor(Math.random() * 20) + 10;
    this.text = '';
    for (let i = 0; i < length; i++) {
      this.text += this.characters.charAt(Math.floor(Math.random() * this.characters.length));
    }
  }

  draw(context, time, wave, mouse) {
    let y = this.y + wave.getY(this.x);
    for (let i = 0; i < this.text.length; i++) {
      const char = this.text[i];
      const distanceFromMouse = Math.sqrt(Math.pow(this.x - mouse.x, 2) + Math.pow(y - mouse.y, 2));
      const alpha = 1 - (i / this.text.length) * 0.8;
      const hue = (time / 50 + distanceFromMouse / 50) % 360;
      context.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
      context.fillText(char, this.x, y);
      y += this.fontSize * 0.8;
    }

    if (time - this.lastFlashTime > this.flashInterval) {
      context.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context.fillText(this.text[Math.floor(Math.random() * this.text.length)], this.x, this.y + Math.random() * this.text.length * this.fontSize);
      this.lastFlashTime = time;
    }

    this.y += this.speed;
    if (this.y > this.canvasHeight) {
      this.y = -this.text.length * this.fontSize;
      this.generateText();
    }
  }
}

class Lightning {
  constructor(canvasWidth, canvasHeight) {
    this.start = { x: Math.random() * canvasWidth, y: 0 };
    this.end = { x: Math.random() * canvasWidth, y: canvasHeight };
    this.lifeTime = Math.random() * 200 + 100;
    this.time = 0;
  }

  draw(context) {
    const gradient = context.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
    gradient.addColorStop(0.2, 'rgba(0, 255, 0, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.6, 'rgba(0, 255, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

    context.strokeStyle = gradient;
    context.lineWidth = 2;
    context.shadowColor = 'rgba(0, 255, 0, 1)';
    context.shadowBlur = 20;
    context.beginPath();
    context.moveTo(this.start.x, this.start.y);

    let x = this.start.x;
    let y = this.start.y;
    while (y < this.end.y) {
      x += (Math.random() - 0.5) * 50;
      y += Math.random() * 20 + 10;
      context.lineTo(x, y);
    }
    context.stroke();
    context.shadowBlur = 0;

    this.time++;
  }
}

class Thunder {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.opacity = 1;
    this.duration = Math.random() * 20 + 10;
    this.time = 0;
  }

  update() {
    this.time++;
    this.opacity = 1 - (this.time / this.duration);
  }

  draw(context) {
    context.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  isFinished() {
    return this.time >= this.duration;
  }
}

class Wave {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = 0;
    this.amplitude = 50;
    this.frequency = 0.01;
    this.speed = 0.05;
  }

  update() {
    this.x += this.speed;
    if (this.x > this.canvasWidth) this.x = 0;
  }

  getY(x) {
    return Math.sin((x + this.x) * this.frequency) * this.amplitude;
  }
}

class Effect {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.fontSize = 14;
    this.columns = [];
    this.lightnings = [];
    this.thunders = [];
    this.wave = new Wave(canvasWidth, canvasHeight);
    this.mouse = { x: 0, y: 0 };
    this.lastThunderTime = 0;
    this.thunderInterval = Math.random() * 5000 + 3000;
    this.initialize();
  }

  initialize() {
    const numberOfColumns = Math.floor(this.canvasWidth / (this.fontSize * 0.6));
    for (let i = 0; i < numberOfColumns; i++) {
      const x = i * this.fontSize * 0.6;
      const speed = Math.random() * 3 + 1;
      this.columns.push(new Column(x, this.fontSize, this.canvasHeight, speed));
    }
  }

  resize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.columns = [];
    this.wave = new Wave(width, height);
    this.initialize();
  }

  addLightning() {
    if (Math.random() < 0.03) {
      this.lightnings.push(new Lightning(this.canvasWidth, this.canvasHeight));
    }
  }

  addThunder(time) {
    if (time - this.lastThunderTime > this.thunderInterval) {
      this.thunders.push(new Thunder(this.canvasWidth, this.canvasHeight));
      this.lastThunderTime = time;
      this.thunderInterval = Math.random() * 5000 + 3000;
      
      for (let i = 0; i < Math.random() * 3 + 1; i++) {
        this.lightnings.push(new Lightning(this.canvasWidth, this.canvasHeight));
      }
      
      playThunderSound();
    }
  }

  updateMousePosition(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  }
}

const effect = new Effect(canvas.width, canvas.height);

function animate(time) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = `${effect.fontSize}px monospace`;
  ctx.textAlign = 'center';

  effect.wave.update();
  effect.columns.forEach(column => column.draw(ctx, time, effect.wave, effect.mouse));
  
  effect.addLightning();
  effect.addThunder(time);
  
  effect.lightnings.forEach((lightning, index) => {
    lightning.draw(ctx);
    if (lightning.time > lightning.lifeTime) {
      effect.lightnings.splice(index, 1);
    }
  });

  effect.thunders.forEach((thunder, index) => {
    thunder.update();
    thunder.draw(ctx);
    if (thunder.isFinished()) {
      effect.thunders.splice(index, 1);
    }
  });

  requestAnimationFrame(animate);
}

function playThunderSound() {
  const thunder = new Audio('path/to/thunder-sound.mp3'); // Asegúrate de tener un archivo de sonido de trueno
  thunder.volume = 0.5;
  thunder.play();
}

animate(0);

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  effect.resize(canvas.width, canvas.height);
});

canvas.addEventListener('mousemove', function(event) {
  effect.updateMousePosition(event.clientX, event.clientY);
});