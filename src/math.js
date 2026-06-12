function sgn(a) {
  return a < 0 ? -1 : 1;
}

export function cartesianToSpherical({ x, y, z }) {
  const r = Math.sqrt(x * x + y * y + z * z);
  return {
    r,
    theta: Math.acos(z / r),
    phi: (sgn(y) * Math.acos(x / Math.sqrt(x * x + y * y)) || 0),
  }
}

export function sphericalToCartesian({ r, theta, phi }) {
  return {
    x: r * Math.sin(theta) * Math.cos(phi),
    y: r * Math.sin(theta) * Math.sin(phi),
    z: r * Math.cos(theta),
  }
}

export function cartesianToCylindrical({ x, y, z }) {
  const r = Math.sqrt(x * x + z * z);

  function phi(r, y) {
    if (x === 0 && y === 0) {
      return 0;
    }

    if (x >= 0) {
      return Math.asin(y / r);
    } else {
      if (y >= 0) {
        return -Math.asin(y / r) + Math.PI;
      } else {
        return -Math.asin(y / r) - Math.PI;
      }
    }
  }

  return {
    r,
    y,
    phi: phi(r, z),
  }
}

export function cylindricalToCartesian({ r, y, phi }) {
  return {
    x: r * Math.cos(phi),
    z: r * Math.sin(phi),
    y,
  }
}

const lerp = (a, b, t) => (1 - t) * a + t * b;

export function r2d(r) {
  return r * 180 / Math.PI;
}

export function d2r(r) {
  return r / 180 * Math.PI;
}