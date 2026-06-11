import * as TWEEN from '@tweenjs/tween.js';
// import {cartesianToSpherical, sphericalToCartesian} from "./math";
import {cartesianToCylindrical, cylindricalToCartesian} from "./math";

function r2d(r) {
  return r * 180 / Math.PI;
}

function createAnimation(id, a, b, duration) {
  const from = cartesianToCylindrical(a);
  const to = cartesianToCylindrical(b);

  const point = new api.THREE.Group();
  point.rotation.order = 'ZYX';
  const root = api.scene.get({ evalNode: true });
  const scene = root.configurator.player.modules.translator.scene;
  scene.add(point);

  return new TWEEN.Tween({ y: from.y, phi: from.phi, r: from.r })
    .to({ y: to.y, phi: to.phi, r: to.r }, duration)
    .easing(TWEEN.Easing.Quadratic.InOut)
    .onUpdate((value) => {
      const translation = cylindricalToCartesian(value);
      // point.position.set(translation.x, translation.y, translation.z);
      point.lookAt(translation.x, translation.y, translation.z);

      console.log(point.rotation);
      // q.setFromEuler(point.rotation);

      // api.camera.setPosition(translation);
      // api.camera.setQuaternion(q);
      api.scene.set([id, 'plugs', 'Transform', 0, 'translation'], translation);
      api.scene.set([id, 'plugs', 'Transform', 0, 'rotation'], {
        x: r2d(point.rotation.x),
        y: r2d(point.rotation.y),
        z: r2d(point.rotation.z),
      });
    });
}

function main() {
  const tween = createAnimation(
    api.scene.get({ name: api.configuration.Target })?.id,
    api.scene.get({ name: api.configuration.From, plug: "Transform", property: "translation" }),
    api.scene.get({ name: api.configuration.To, plug: "Transform", property: "translation" }),
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