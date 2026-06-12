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

  frame.quaternion.setFromEuler(frame.euler);
  return frame;
}

function getLookAtCenterInterpolator(objectId) {
  const THREE = api.THREE;
  const point = new THREE.Group();
  point.rotation.order = 'ZYX';
  const root = api.scene.get({ evalNode: true });
  const scene = root.configurator.player.modules.translator.scene;
  scene.add(point);

  // const cameraEuler = new THREE.Euler();
  // const cameraMatrix = new THREE.Matrix4();

  return {
    from: 0, to: 1,
    update(rotation, translation) {
      // const up = new THREE.Vector3(0, 1, 0);
      // const objectRotation = api.scene.get({ id: objectId, plug: "Transform", property: "rotation" });
      // const objectRotationOrder = api.scene.get({ id: objectId, plug: "Transform", property: "rotationOrder" });
      // cameraEuler.set(
      //   d2r(objectRotation.x),
      //   d2r(objectRotation.y),
      //   d2r(objectRotation.z),
      //   objectRotationOrder,
      // );
      // cameraMatrix.makeRotationFromEuler(cameraEuler);
      // up.applyMatrix4(cameraMatrix).normalize();
      // point.up.set(up.x, up.y, up.z);
      // console.log(">>>up", objectRotation);

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

export function getRotationInterpolator(nameFrom, nameTo, objectId) {
  switch (api.configuration.RotationInterpolation) {
    case "Quaternion":
      return getRotationQuaternionInterpolator(nameFrom, nameTo);
    case "LookAt":
      return getLookAtCenterInterpolator(objectId);
  }
}
