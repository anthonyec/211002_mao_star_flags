import flags from './flags';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const mouse = { x:0, y: 0, pressed: false };
const keyboard = {
  down(key) {
    return this[key]?.down;
  },
  pressed(key) {
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
  currentFlagKeyIndex: 0
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

async function loadImage(src = '') {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.src = src;

    img.onload = function() {
      resolve(img);
    }
  })
}

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
      radius: state.circleRadius
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

  if (keyboard.down('q') && state.circleRadius > 1) {
    state.circleRadius -= 0.2;
  }

  if (keyboard.down('e') && state.circleRadius < 400) {
    state.circleRadius += 0.2;
  }

  context.strokeStyle = 'black';
  context.beginPath();
  context.arc(mouse.x, mouse.y, state.circleRadius, 0, 2 * Math.PI);
  context.stroke();

  if (state.currentImage && store[state.flagKeys[state.currentFlagKeyIndex]]) {
    const {
      position,
      radius
    } = store[state.flagKeys[state.currentFlagKeyIndex]];

    const aspectRatio = state.currentImage.width / state.currentImage.height;
    const height = canvas.width * (1 / aspectRatio);

    context.strokeStyle = 'white';
    context.beginPath();
    context.arc(canvas.width * position.x, height * position.y, radius, 0, 2 * Math.PI);
    context.stroke();
  }

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

