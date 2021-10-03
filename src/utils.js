export async function loadImage(src = '') {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.src = src;

    img.onload = function() {
      resolve(img);
    }
  })
}

export function deg2rad(deg = 0) {
  return deg * Math.PI / 180;
}

export function rad2deg(rad = 0) {
  return rad * 180 / Math.PI;
}

export function distance(x1, y1, x2, y2) {
  const a = x1 - x2;
  const b = y1 - y2;
  return Math.sqrt(a * a + b * b );
}

export function getPointOnCircleEdge(x, y, radius, rotationRadians) {
  return {
    x: x + (radius * Math.cos(rotationRadians)),
    y: y + (radius * Math.sin(rotationRadians))
  };
}

export function getRotationBetween(x1, y1, x2, y2) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  return Math.atan2(deltaY, deltaX);
}
