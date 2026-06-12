import {cartesianToCylindrical, cylindricalToCartesian, cartesianToSpherical, sphericalToCartesian} from "./math";

const CoordinateSystemConvertors = {
  Cartesian: {
    fromCartesian(position) {
      return { ...position };
    },
    toCartesian(position) {
      return { ...position };
    }
  },
  Cylindrical: {
    fromCartesian: cartesianToCylindrical,
    toCartesian: cylindricalToCartesian,
  },
  Spherical: {
    fromCartesian: cartesianToSpherical,
    toCartesian: sphericalToCartesian,
  }
}

export function getTranslationInterpolator(nameFrom, nameTo) {
  const THREE = api.THREE;
  const converter = CoordinateSystemConvertors[api.configuration.InterpolationSpace];
  const minRadius = api.configuration.MinRadius;
  const center = new THREE.Vector3(0, 0, 0);

  const from = converter.fromCartesian(api.scene.get({ name: nameFrom, plug: "Transform", property: "translation" }));
  const to = converter.fromCartesian(api.scene.get({ name: nameTo, plug: "Transform", property: "translation" }));


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