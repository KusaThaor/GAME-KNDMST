import * as THREE from 'three';

/** Ba dải màu trong không gian tuyến tính, có thể tween mà không cấp phát texture mỗi khung. */
export function skyDome(sky: [string, string, string] = ['#8fc4ef', '#bfe0f7', '#f3ecd9']) {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { zenith: { value: new THREE.Color(sky[0]) }, middle: { value: new THREE.Color(sky[1]) },
      horizon: { value: new THREE.Color(sky[2]) } },
    vertexShader: `varying float elevation;
      void main() { elevation = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 zenith, middle, horizon;
      varying float elevation;
      void main() {
        vec3 low = mix(horizon, middle, smoothstep(-0.18, 0.15, elevation));
        gl_FragColor = vec4(mix(low, zenith, smoothstep(0.15, 0.97, elevation)), 1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  material.userData.outlineParameters = { visible: false };
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(180, 24, 16), material);
  mesh.renderOrder = -3;
  return mesh;
}

export function rainbowArc() {
  const geometry = new THREE.RingGeometry(49, 53, 96, 6, 0, Math.PI);
  const bands = ['#ab7dde', '#828ce6', '#6faedb', '#84c69b', '#ebd382', '#eeac83', '#ed8e90'].map(c => new THREE.Color(c));
  const colors: number[] = [];
  for (let i = 0; i < geometry.attributes.position.count; i++) bands[Math.floor(i / 97)].toArray(colors, i * 3);
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.48,
    side: THREE.DoubleSide, depthWrite: false, fog: false });
  material.userData.outlineParameters = { visible: false };
  const arc = new THREE.Mesh(geometry, material);
  arc.name = 'rainbow'; arc.position.set(0, -4, -89); arc.renderOrder = -2;
  return arc;
}

export function starField() {
  const count = 320, points: number[] = [];
  // Phân bố gần đều trên bán cầu, giữ cùng chòm sao sau khi tải lại.
  for (let i = 0; i < count; i++) {
    const y = (i + 0.5) / count, radius = Math.sqrt(1 - y * y), angle = i * 2.399963;
    points.push(155 * radius * Math.cos(angle), 155 * y, 155 * radius * Math.sin(angle));
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const material = new THREE.PointsMaterial({ size: 0.42, color: '#fff1cf', fog: false, depthWrite: false });
  material.userData.outlineParameters = { visible: false };
  const stars = new THREE.Points(geometry, material);
  stars.name = 'stars'; stars.renderOrder = -2;
  return stars;
}

let cloudMat: THREE.MeshBasicMaterial | null = null;
export function clouds(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'clouds';
  if (!cloudMat) {
    cloudMat = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false, transparent: true, opacity: 0.95 });
    cloudMat.userData.outlineParameters = { visible: false };
  }
  const spots: [number, number, number, number][] = [[-60, 40, -120, 1.2], [20, 52, -140, 1.6], [80, 38, -110, 1], [-20, 60, -150, 1.3]];
  for (const [x, y, z, s] of spots) {
    const c = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const b = new THREE.Mesh(new THREE.SphereGeometry(5 + (i % 3) * 2, 12, 8), cloudMat);
      b.position.set((i - 2) * 6, Math.sin(i * 1.7) * 2, Math.cos(i) * 2); b.scale.y = 0.6; c.add(b);
    }
    c.position.set(x, y, z); c.scale.setScalar(s); g.add(c);
  }
  return g;
}
