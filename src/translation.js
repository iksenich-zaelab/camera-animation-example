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
  const converter = CoordinateSystemConvertors[api.configuration.InterpolationSpace];

  const from = converter.fromCartesian(api.scene.get({ name: nameFrom, plug: "Transform", property: "translation" }));
  const to = converter.fromCartesian(api.scene.get({ name: nameTo, plug: "Transform", property: "translation" }));

  return {
    from,
    to,
    update: value => converter.toCartesian(value)
  }
}