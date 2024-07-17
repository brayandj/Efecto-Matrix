// Obtener el elemento canvas del HTML y su contexto 2D
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Establecer el tamaño del canvas como el tamaño de la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Definición de la clase Columna para crear columnas de texto animado
class Column {
  constructor(x, fontSize, canvasHeight, speed) {
    // Inicialización de propiedades de la columna
    this.x = x; // Posición x
    this.y = Math.random() * canvasHeight - canvasHeight; // Posición y inicial aleatoria
    this.fontSize = fontSize; // Tamaño de fuente
    this.canvasHeight = canvasHeight; // Altura del canvas
    this.speed = speed; // Velocidad de desplazamiento vertical
    this.characters = '...'; // Caracteres disponibles para mostrar
        this.characters = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネへメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789'; // Texto generado para la columna
    this.generateText(); // Generar texto inicial
    this.flashInterval = Math.random() * 200 + 50; // Intervalo para destellos
    this.lastFlashTime = 0; // Último tiempo de destello
  }

  // Generar texto aleatorio para la columna
  generateText() {
    const length = Math.floor(Math.random() * 20) + 10; // Longitud aleatoria del texto
    this.text = '';
    for (let i = 0; i < length; i++) {
      this.text += this.characters.charAt(Math.floor(Math.random() * this.characters.length));
    }
  }

  // Dibujar la columna en el canvas
  draw(context, time, wave, mouse) {
    let y = this.y + wave.getY(this.x); // Posición y ajustada por la onda
    for (let i = 0; i < this.text.length; i++) {
      const char = this.text[i];
      // Calcular el color y la opacidad basados en el tiempo y la posición del ratón
      const distanceFromMouse = Math.sqrt(Math.pow(this.x - mouse.x, 2) + Math.pow(y - mouse.y, 2));
      const alpha = 1 - (i / this.text.length) * 0.8;
      const hue = (time / 50 + distanceFromMouse / 50) % 360;
      context.fillStyle = `hsla(${hue}, 100%, 50%, ${alpha})`;
      context.fillText(char, this.x, y);
      y += this.fontSize * 0.8; // Espaciado vertical entre caracteres
    }

    // Añadir destellos aleatorios
    if (time - this.lastFlashTime > this.flashInterval) {
      context.fillStyle = 'rgba(255, 255, 255, 0.8)';
      context.fillText(this.text[Math.floor(Math.random() * this.text.length)], this.x, this.y + Math.random() * this.text.length * this.fontSize);
      this.lastFlashTime = time;
    }

    this.y += this.speed; // Actualizar la posición vertical
    // Reiniciar la columna si sale del canvas
    if (this.y > this.canvasHeight) {
      this.y = -this.text.length * this.fontSize;
      this.generateText();
    }
  }
}

// Definición de la clase Relámpago para efectos visuales
class Lightning {
  constructor(canvasWidth, canvasHeight) {
    // Inicialización de posición y duración del relámpago
    this.start = { x: Math.random() * canvasWidth, y: 0 };
    this.end = { x: Math.random() * canvasWidth, y: canvasHeight };
    this.lifeTime = Math.random() * 200 + 100; // Tiempo de vida del relámpago
    this.time = 0; // Tiempo transcurrido
  }

  // Dibujar el relámpago en el canvas
  draw(context) {
    // Crear gradiente para el relámpago
    const gradient = context.createLinearGradient(this.start.x, this.start.y, this.end.x, this.end.y);
    gradient.addColorStop(0, 'rgba(0, 255, 0, 0)');
    gradient.addColorStop(0.2, 'rgba(0, 255, 0, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.6, 'rgba(0, 255, 0, 1)');
    gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');

    // Configuración de trazos y sombra del contexto
    context.strokeStyle = gradient;
    context.lineWidth = 2;
    context.shadowColor = 'rgba(0, 255, 0, 1)';
    context.shadowBlur = 20;
    context.beginPath();
    context.moveTo(this.start.x, this.start.y);

    let x = this.start.x;
    let y = this.start.y;
    // Generación de segmentos del relámpago
    while (y < this.end.y) {
      x += (Math.random() - 0.5) * 50;
      y += Math.random() * 20 + 10;
      context.lineTo(x, y);
    }
    context.stroke();
    context.shadowBlur = 0;

    this.time++; // Actualizar tiempo de vida del relámpago
  }
}

// Definición de la clase Trueno para efectos de sonido y visuales
class Thunder {
  constructor(canvasWidth, canvasHeight) {
    // Inicialización de propiedades del trueno
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.opacity = 1; // Opacidad inicial
    this.duration = Math.random() * 20 + 10; // Duración del trueno
    this.time = 0; // Tiempo transcurrido
  }

  // Actualizar la opacidad del trueno
  update() {
    this.time++;
    this.opacity = 1 - (this.time / this.duration);
  }

  // Dibujar el trueno en el canvas
  draw(context) {
    context.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  // Verificar si el trueno ha terminado
  isFinished() {
    return this.time >= this.duration;
  }
}

// Definición de la clase Onda para efectos de animación de onda
class Wave {
  constructor(canvasWidth, canvasHeight) {
    // Inicialización de propiedades de la onda
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = 0; // Posición inicial de la onda
    this.amplitude = 50; // Amplitud de la onda
    this.frequency = 0.01; // Frecuencia de la onda
    this.speed = 0.05; // Velocidad de desplazamiento horizontal
  }

  // Actualizar posición de la onda
  update() {
    this.x += this.speed;
    if (this.x > this.canvasWidth) this.x = 0;
  }

  // Obtener la posición vertical de la onda en un punto dado
  getY(x) {
    return Math.sin((x + this.x) * this.frequency) * this.amplitude;
  }
}

// Definición de la clase NameEffect para efectos visuales del nombre
class NameEffect {
  constructor(name, canvasWidth, canvasHeight) {
    // Inicialización de efectos visuales del nombre
    this.name = name;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.fontSize = 48; // Tamaño de fuente
    this.letters = []; // Arreglo de letras animadas
    this.initializeLetters(); // Inicialización de letras animadas
  }

  // Inicializar las letras del nombre
  initializeLetters() {
    const centerX = this.canvasWidth / 2; // Centro horizontal del canvas
    const centerY = this.canvasHeight / 2; // Centro vertical del canvas
    const spread = 300; // Distribución de letras

    for (let i = 0; i < this.name.length; i++) {
      // Generar letras con posiciones aleatorias
      this.letters.push({
        char: this.name[i], // Carácter de la letra
        x: centerX + (Math.random() - 0.5) * spread,
        y: centerY + (Math.random() - 0.5) * spread,
        targetX: centerX - (this.name.length / 2 - i) * this.fontSize,
        targetY: centerY,
        vx: 0,
        vy: 0
      });
    }
  }

  // Actualizar la posición de las letras del nombre
  update() {
    this.letters.forEach(letter => {
      const dx = letter.targetX - letter.x;
      const dy = letter.targetY - letter.y;
      letter.vx += dx * 0.05; // Velocidad horizontal
      letter.vy += dy * 0.05; // Velocidad vertical
      letter.vx *= 0.9; // Factor de amortiguación horizontal
      letter.vy *= 0.9; // Factor de amortiguación vertical
      letter.x += letter.vx; // Actualizar posición horizontal
      letter.y += letter.vy; // Actualizar posición vertical
    });
  }

  // Dibujar las letras del nombre en el canvas
  draw(context) {
    context.font = `bold ${this.fontSize}px Arial`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    this.letters.forEach(letter => {
      // Crear gradiente radial para cada letra
      const gradient = context.createRadialGradient(letter.x, letter.y, 0, letter.x, letter.y, this.fontSize / 2);
      gradient.addColorStop(0, 'rgba(0, 255, 0, 1)');
      gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
      
      context.fillStyle = gradient;
      context.fillText(letter.char, letter.x, letter.y);
    });
  }
}

// Definición de la clase Effect para manejar todos los efectos visuales y animaciones
class Effect {
  constructor(canvasWidth, canvasHeight) {
    // Inicialización de efectos visuales globales
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.fontSize = 14; // Tamaño de fuente base
    this.columns = []; // Arreglo de columnas de texto animado
    this.lightnings = []; // Arreglo de relámpagos
    this.thunders = []; // Arreglo de truenos
    this.wave = new Wave(canvasWidth, canvasHeight); // Onda de fondo
    this.mouse = { x: 0, y: 0 }; // Posición del ratón
    this.lastThunderTime = 0; // Último tiempo de trueno
    this.thunderInterval = Math.random() * 5000 + 3000; // Intervalo entre truenos
    this.nameEffect = new NameEffect("BRAYAN DÍAZ", canvasWidth, canvasHeight); // Efecto del nombre
    this.initialize(); // Inicializar efectos visuales
  }

  // Inicializar efectos visuales
  initialize() {
    const numberOfColumns = Math.floor(this.canvasWidth / (this.fontSize * 0.6));
    for (let i = 0; i < numberOfColumns; i++) {
      const x = i * this.fontSize * 0.6;
      const speed = Math.random() * 3 + 1;
      this.columns.push(new Column(x, this.fontSize, this.canvasHeight, speed));
    }
  }

  // Redimensionar el canvas y reiniciar efectos visuales
  resize(width, height) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.columns = [];
    this.wave = new Wave(width, height);
    this.nameEffect = new NameEffect("BRAYAN DÍAZ", width, height);
    this.initialize();
  }

  // Agregar un nuevo relámpago al azar
  addLightning() {
    if (Math.random() < 0.03) {
      this.lightnings.push(new Lightning(this.canvasWidth, this.canvasHeight));
    }
  }

  // Agregar un nuevo trueno al azar
  addThunder(time) {
    if (time - this.lastThunderTime > this.thunderInterval) {
      this.thunders.push(new Thunder(this.canvasWidth, this.canvasHeight));
      this.lastThunderTime = time;
      this.thunderInterval = Math.random() * 5000 + 3000;
      
      // Añadir relámpagos adicionales alrededor del trueno
      for (let i = 0; i < Math.random() * 3 + 1; i++) {
        this.lightnings.push(new Lightning(this.canvasWidth, this.canvasHeight));
      }
    }
  }

  // Actualizar la posición del ratón
  updateMousePosition(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  }
}

// Crear instancia del efecto en el tamaño inicial del canvas
const effect = new Effect(canvas.width, canvas.height);

// Función de animación principal del canvas
function animate(time) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.font = `${effect.fontSize}px monospace`;
  ctx.textAlign = 'center';

  effect.wave.update(); // Actualizar la onda de fondo
  effect.columns.forEach(column => column.draw(ctx, time, effect.wave, effect.mouse)); // Dibujar columnas de texto

  effect.addLightning(); // Añadir relámpagos al azar
  effect.addThunder(time); // Añadir truenos al azar

  // Dibujar y limpiar relámpagos
  effect.lightnings.forEach((lightning, index) => {
    lightning.draw(ctx);
    if (lightning.time > lightning.lifeTime) {
      effect.lightnings.splice(index, 1);
    }
  });

  // Actualizar y dibujar truenos, y limpiarlos cuando terminen
  effect.thunders.forEach((thunder, index) => {
    thunder.update();
    thunder.draw(ctx);
    if (thunder.isFinished()) {
      effect.thunders.splice(index, 1);
    }
  });

  effect.nameEffect.update(); // Actualizar efecto del nombre
  effect.nameEffect.draw(ctx); // Dibujar efecto del nombre

  requestAnimationFrame(animate); // Solicitud de nueva animación
}

animate(0); // Iniciar animación inicial del canvas

// Manejar redimensionamiento del canvas
window.addEventListener('resize', function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  effect.resize(canvas.width, canvas.height);
});

// Manejar movimiento del ratón en el canvas
canvas.addEventListener('mousemove', function(event) {
  effect.updateMousePosition(event.clientX, event.clientY);
});
