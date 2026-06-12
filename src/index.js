import * as TWEEN from '@tweenjs/tween.js';
import {getTranslationInterpolator} from "./translation";
import {getRotationInterpolator} from "./rotation";

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