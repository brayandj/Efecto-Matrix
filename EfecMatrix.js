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

  draw(context, time) {
    let y = this.y;
    for (let i = 0; i < this.text.length; i++) {
      const char = this.text[i];
      const alpha = 1 - (i / this.text.length) * 0.8;
      context.fillStyle = `rgba(0, 255, 0, ${alpha})`;
      context.fillText(char, this.x, y);
      y += this.fontSize * 0.8; // Reduce spacing between characters
    }

    // Add flashing effect
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
    // gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    // gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
    // gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
    gradient.addColorStop(0.2, 'rgba(0, 255, 0, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.6, 'rgba(0, 255, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

    context.strokeStyle = gradient;
    context.lineWidth = 2;
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

    this.time++;
  }
}

class Effect {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.fontSize = 14;
    this.columns = [];
    this.lightnings = [];
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
    this.initialize();
  }

  addLightning() {
    if (Math.random() < 0.03) {
      this.lightnings.push(new Lightning(this.canvasWidth, this.canvasHeight));
    }
  }
}

const effect = new Effect(canvas.width, canvas.height);

function animate(time) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = `${effect.fontSize}px monospace`;
  ctx.textAlign = 'center';

  effect.columns.forEach(column => column.draw(ctx, time));
  
  effect.addLightning();
  effect.lightnings.forEach((lightning, index) => {
    lightning.draw(ctx);
    if (lightning.time > lightning.lifeTime) {
      effect.lightnings.splice(index, 1);
    }
  });

  requestAnimationFrame(animate);
}

animate(0);

window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  effect.resize(canvas.width, canvas.height);
});
