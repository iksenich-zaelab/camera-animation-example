import {r2d, d2r} from './math';

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

function getLookAtCenterInterpolator(nameFrom, nameTo) {
  const THREE = api.THREE;
  const point = new THREE.Group();
  point.rotation.order = 'ZYX';
  const root = api.scene.get({ evalNode: true });
  const scene = root.configurator.player.modules.translator.scene;
  scene.add(point);

  return {
    from: 0, to: 1,
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

export function getRotationInterpolator(nameFrom, nameTo) {
  switch (api.configuration.RotationInterpolation) {
    case "Quaternion":
      return getRotationQuaternionInterpolator(nameFrom, nameTo);
    case "LookAt":
      return getLookAtCenterInterpolator();
  }
}
