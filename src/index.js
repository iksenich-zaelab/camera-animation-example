import * as TWEEN from '@tweenjs/tween.js';

import {cartesianToCylindrical, cylindricalToCartesian, cartesianToSpherical, sphericalToCartesian} from "./math";

function r2d(r) {
  return r * 180 / Math.PI;
}

function d2r(r) {
  return r / 180 * Math.PI;
}

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

function getTranslationInterpolator(nameFrom, nameTo) {
  const converter = CoordinateSystemConvertors[api.configuration.InterpolationSpace];

  const from = converter.fromCartesian(api.scene.get({ name: nameFrom, plug: "Transform", property: "translation" }));
  const to = converter.fromCartesian(api.scene.get({ name: nameTo, plug: "Transform", property: "translation" }));

  return {
    from,
    to,
    update: value => converter.toCartesian(value)
  }
}

function getRotationQuaternionInterpolator(nameFrom, nameTo) {
  const THREE = api.THREE;
  const from = getRotationKeyframe(nameFrom);
  const to = getRotationKeyframe(nameTo);

  const e = new THREE.Euler();

  return {
    from: 0,
    to: 1,
    update: value => {
      const q = new THREE.Quaternion(
        from.quaternion.x,
        from.quaternion.y,
        from.quaternion.z,
        from.quaternion.w,
      );
      q.slerp(to.quaternion, value);
      e.setFromQuaternion(q, from.euler.order);
      return {
        x: r2d(e.x),
        y: r2d(e.y),
        z: r2d(e.z),
      }
    }
  }
}

function getRotationKeyframe(name) {
  const THREE = api.THREE;
  const frame = {
    rotation: api.scene.get({ name, plug: "Transform", property: "rotation" }),
    euler: new THREE.Euler(),
    quaternion: new THREE.Quaternion(),
  }

  frame.euler.set(
    d2r(frame.rotation.x),
    d2r(frame.rotation.y),
    d2r(frame.rotation.z),
    api.scene.get({ name: name, plug: "Transform", property: "rotationOrder" }),
  )

  frame.quaternion.setFromEuler(frame.euler, euler.order);
  return frame;
}

function getLookAtCenterInterpolator() {
  const THREE = api.THREE;
  const point = new THREE.Group();
  point.rotation.order = 'ZYX';
  const root = api.scene.get({ evalNode: true });
  const scene = root.configurator.player.modules.translator.scene;
  scene.add(point);

  return {
    from: 0, to: 0,
    update(rotation, translation) {
      point.lookAt(
        translation.x,
        translation.y,
        translation.z,
      );
      return {
        x: r2d(point.rotation.x),
        y: r2d(point.rotation.y),
        z: r2d(point.rotation.z),
      }
    }
  }
}

function getRotationInterpolator(nameFrom, nameTo) {
  switch (api.configuration.RotationInterpolation) {
    case "Quaternion":
      return getRotationQuaternionInterpolator(nameFrom, nameTo);
    case "LookAt":
      return getLookAtCenterInterpolator();
  }
}

function createAnimation(id, nameFrom, nameTo, duration) {
  const translationInterpolator = getTranslationInterpolator(nameFrom, nameTo);
  const rotationInterpolator = getRotationInterpolator(nameFrom, nameTo);

  return new TWEEN.Tween({ translation: translationInterpolator.from, rotation: rotationInterpolator.from })
    .to({ translation: translationInterpolator.to, rotation: rotationInterpolator.to }, duration)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((value) => {
      const translation = translationInterpolator.update(value.translation);
      const rotation = rotationInterpolator.update(value.rotation, translation);

      console.log(value, translation, rotation);
      api.scene.set({ id, plug: 'Transform', property: 'translation' }, translation);
      api.scene.set({ id, plug: 'Transform', property: 'rotation' }, rotation);
    });
}

function getFromName() {
  if (api.configuration.From === "Current") {
    return api.configuration.Target;
  } else {
    return api.configuration.From;
  }
}

function main() {
  const tween = createAnimation(
    api.scene.get({ name: api.configuration.Target })?.id,
    getFromName(),
    api.configuration.To,
    api.configuration.duration,
  ).start();

  function animate(time) {
    if (tween.update(time)) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

main();
window.main = main;
window.api = api;