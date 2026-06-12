import {cartesianToCylindrical, cylindricalToCartesian, cartesianToSpherical, sphericalToCartesian} from "./math";

function getAnglesWithShortestPath(a, b) {
  if (Math.abs(b - a) > Math.PI) {
    console.log(">>>invert", a, b, "->", -(Math.PI * 2 - a) % (Math.PI * 2), -(Math.PI * 2 - b) % (Math.PI * 2))
    return [-(Math.PI * 2 - a) % (Math.PI * 2), -(Math.PI * 2 - b) % (Math.PI * 2)];
  }
  return [a, b];
}

const CoordinateSystemConvertors = {
  Cartesian: {
    fromCartesian(position) {
      return { ...position };
    },
    toCartesian(position) {
      return { ...position };
    },
    normalize(a, b) {
      return [a, b];
    }
  },
  Cylindrical: {
    fromCartesian: cartesianToCylindrical,
    toCartesian: cylindricalToCartesian,
    normalize(a, b) {
      const phi = getAnglesWithShortestPath(a.phi, b.phi);
      console.log(phi)
      return [{
        ...a,
        phi: phi[0],
      }, {
        ...b,
        phi: phi[1],
      }]
    }
  },
  Spherical: {
    fromCartesian: cartesianToSpherical,
    toCartesian: sphericalToCartesian,
    normalize(a, b) {
      const phi = getAnglesWithShortestPath(a.phi, b.phi);
      const theta = getAnglesWithShortestPath(a.theta, b.theta);
      console.log(phi, theta)

      return [{
        ...a,
        phi: phi[0],
        theta: theta[0]
      }, {
        ...b,
        phi: phi[1],
        theta: theta[1]
      }]
    }
  }
}

export function getTranslationInterpolator(nameFrom, nameTo) {
  const THREE = api.THREE;
  const converter = CoordinateSystemConvertors[api.configuration.InterpolationSpace];
  const minRadius = api.configuration.MinRadius;
  const center = new THREE.Vector3(0, 0, 0);

  let from = converter.fromCartesian(api.scene.get({ name: nameFrom, plug: "Transform", property: "translation" }));
  let to = converter.fromCartesian(api.scene.get({ name: nameTo, plug: "Transform", property: "translation" }));
  [from, to] = converter.normalize(from, to);

  return {
    from,
    to,
    update: value => {
      const translation = converter.toCartesian(value);
      const v = new THREE.Vector3(translation.x, translation.y, translation.z);
      v.sub(center);

      if (v.length() < minRadius) {
        v.normalize().multiplyScalar(minRadius).add(center);
        return {
          x: v.x,
          y: v.y,
          z: v.z,
        }
      }
      return translation;
    }
  }
}