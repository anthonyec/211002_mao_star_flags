import flags from './flags';
import { loadImage, deg2rad } from './utils';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const mouse = { x:0, y: 0, pressed: false };
const keyboard = {
  down(key) {
    return this[key]?.down;
  },
  pressed(key) {
    // TODO: Reset after frame and not function call because otherwise 2
    // pressed functions for the same key can't function. Only the first will work.
    if (this[key]?.down && !this[key]?.justPressed) {
      this[key].justPressed = true;
      return true;
    }

    if (!this[key]?.down && this[key]?.justPressed) {
      this[key].justPressed = false;
      return false;
    }
  }
};
const state = {
  circleRadius: 50,
  flagKeys: Object.keys(flags),
  currentFlagKeyIndex: 0,
  selectionColor: 'black',
  rotate: false,
  rotation: 0
};

let internalStore = {};

if (localStorage.getItem('store')) {
  internalStore = JSON.parse(localStorage.getItem('store'));
}

const store = new Proxy(internalStore, {
  set(obj, key, value) {
    obj[key] = value;
    localStorage.setItem('store', JSON.stringify(internalStore));
    return true;
  },
  deleteProperty(obj, key) {
    if (!obj[key]) {
      return false;
    }

    delete obj[key];
    localStorage.setItem('store', JSON.stringify(internalStore));
    return true;
  }
});

function createBlinker(length = 100) {
  let t = 0;

  return () => {
    t += 1;

    if (t > length) {
      t = 0;
    }

    return t < (length * 0.5);
  }
}

const blink = createBlinker(30);

async function loadFlag() {
  const flagUrl = flags[state.flagKeys[state.currentFlagKeyIndex]];
  state.currentImage = await loadImage(flagUrl);
}

async function setup() {
  if (store?.currentFlagKeyIndex) {
    state.currentFlagKeyIndex = store.currentFlagKeyIndex;
  }

  loadFlag();
}

function drawRotationGizmo(x, y, radius, rotation) {
  const rotationRad = deg2rad(rotation - 90);

  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(x + (radius * Math.cos(rotationRad)), y + (radius * Math.sin(rotationRad)));
  context.stroke();
}

async function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  if (state.currentImage) {
    const aspectRatio = state.currentImage.width / state.currentImage.height;
    context.drawImage(state.currentImage, 0, 0, canvas.width, canvas.width * (1 / aspectRatio));
  }

  if (keyboard.pressed(' ') && state.currentImage) {
    const aspectRatio = state.currentImage.width / state.currentImage.height;
    const height = canvas.width * (1 / aspectRatio);
    const percentX = mouse.x / canvas.width;
    const percentY = mouse.y / height;

    store[state.flagKeys[state.currentFlagKeyIndex]] = {
      position: { x: percentX, y: percentY },
      radius: state.circleRadius,
      rotation: state.rotation
    };

    console.log(store);
    console.log('SAVED');
  }

  if (keyboard.pressed('Backspace')) {
    delete store[state.flagKeys[state.currentFlagKeyIndex]];
  }

  if (keyboard.pressed('a')) {
    state.currentFlagKeyIndex -= 1;

    if (state.currentFlagKeyIndex < 0) {
      state.currentFlagKeyIndex = state.flagKeys.length - 1;
    }

    store.currentFlagKeyIndex = state.currentFlagKeyIndex;
    loadFlag();
  }

  if (keyboard.pressed('d')) {
    state.currentFlagKeyIndex += 1;

    if (state.currentFlagKeyIndex > state.flagKeys.length - 1) {
      state.currentFlagKeyIndex = 0;
    }

    store.currentFlagKeyIndex = state.currentFlagKeyIndex;
    loadFlag();
  }

  if (!state.rotate) {
    if (keyboard.down('q') && state.circleRadius > 1) {
      state.circleRadius -= 0.2;
    }

    if (keyboard.down('e') && state.circleRadius < 400) {
      state.circleRadius += 0.2;
    }
  } else {
    if (keyboard.down('q') && state.circleRadius > 1) {
      state.rotation -= 0.5;
    }

    if (keyboard.down('e') && state.circleRadius < 400) {
      state.rotation += 0.5;
    }
  }

  if (keyboard.pressed('1')) {
    state.selectionColor = state.selectionColor === 'white' ? 'black' : 'white';
  }

  if (state.currentImage && store[state.flagKeys[state.currentFlagKeyIndex]]) {
    const {
      position,
      radius,
      rotation = 0
    } = store[state.flagKeys[state.currentFlagKeyIndex]];

    const aspectRatio = state.currentImage.width / state.currentImage.height;
    const height = canvas.width * (1 / aspectRatio);

    context.strokeStyle = blink() ? 'white' : 'black';
    context.beginPath();
    context.arc(canvas.width * position.x, height * position.y, radius, 0, 2 * Math.PI);
    context.stroke();

    drawRotationGizmo(canvas.width * position.x, height * position.y, radius, rotation);
  }

  if (keyboard.pressed('w')) {
    state.rotate = !state.rotate;

    if (state.rotate) {
      console.log('rotation');
    } else {
      console.log('scale');
    }
  }

  if (keyboard.pressed('-')) {
    console.log('reset');
    state.rotation = 0;
    state.circleRadius = 50;
  }

  context.strokeStyle = state.selectionColor;
  context.beginPath();
  context.arc(mouse.x, mouse.y, state.circleRadius, 0, 2 * Math.PI);
  context.stroke();

  drawRotationGizmo(mouse.x, mouse.y, state.circleRadius, state.rotation);

  window.requestAnimationFrame(draw);
}

canvas.addEventListener('mousemove', (evt) => {
  mouse.x = evt.offsetX;
  mouse.y = evt.offsetY;
});

canvas.addEventListener('mousedown', (evt) => {
  mouse.pressed = true;
});

canvas.addEventListener('mouseup', (evt) => {
  mouse.pressed = true;
});

window.addEventListener('keydown', (evt) => {
  keyboard[evt.key] = {
    ...keyboard[evt.key],
    down: true
  };
});

window.addEventListener('keyup', (evt) => {
  keyboard[evt.key] = {
    ...keyboard[evt.key],
    down: false
  };
});

setup();
draw();

