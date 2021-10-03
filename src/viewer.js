import flags from './flags';
import flagData from '../flags_data.json';
import { deg2rad, rad2deg, loadImage, getPointOnCircleEdge, getRotationBetween, distance } from './utils';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

const BASE_WIDTH = 800;

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
  rotation: 0,
  currentFlagIndex: 0,
  flags: [],
  scale: 8
};

async function setup() {
  const flagKeys = Object.keys(flags);

  for (const flagKey of flagKeys) {
    if (flagData[flagKey]) {
      const image = await loadImage(flags[flagKey]);
      state.flags.push({
        key: flagKey,
        image,
        data: flagData[flagKey]
      });
      console.log('loaded flag image');
    }
  }
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  state.flags.forEach(({ image, data }, index) => {
    if (index !== state.currentFlagIndex) {
      return;
    }

    console.log(index);

    context.save();

    const rotation = data?.rotation ? -data.rotation : 0;
    const radius = (BASE_WIDTH / data.radius) / 100;

    const canvasMiddleX = canvas.width / 2;
    const canvasMiddleY = canvas.height / 2;

    const aspectRatio = 1 / (image.width / image.height);
    const drawWidth = canvas.width;
    const drawHeight = drawWidth * aspectRatio;
    const starX = drawWidth * data.position.x;
    const starY = drawHeight * data.position.y;

    context.translate(canvasMiddleX, canvasMiddleY);
    context.rotate(deg2rad(rotation));
    context.scale(state.scale * radius, state.scale * radius)
    context.drawImage(image, -starX, -starY, drawWidth, drawWidth * aspectRatio);
    context.translate(0, 0);

    context.restore();
  });

  if (keyboard.down('q')) {
    state.rotation -= 0.5;
  }

  if (keyboard.down('e')) {
    state.rotation += 0.5;
  }

  if (keyboard.pressed('a')) {
    state.currentFlagIndex -= 1;
  }


  if (keyboard.pressed('d')) {
    state.currentFlagIndex += 1;
  }

  if (keyboard.down('[')) {
    state.scale -= 0.1;
  }

  if (keyboard.down(']')) {
    state.scale += 0.1;
  }

  if (keyboard.down('-')) {
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();

    context.beginPath();
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    context.stroke();
  }

  window.requestAnimationFrame(draw);
}

async function main() {
  await setup();
  draw();
}

main();

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
