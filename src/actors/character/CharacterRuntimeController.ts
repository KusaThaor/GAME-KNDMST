import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type CanonicalActionName =
  | 'Action_Idle'
  | 'Action_Walk'
  | 'Action_Run'
  | 'Action_Jump'
  | 'Action_Blink'
  | 'Action_Sit'
  | 'Action_Write'
  | 'Action_Sleep_Desk'
  | 'Action_Raise_Hand'
  | 'Action_Cheer'
  | 'Action_Talk'
  | 'Action_Wave'
  | 'Action_Bow'
  | 'Action_Salute_Flag'
  | 'Action_Thinking'
  | 'Action_Sad_Disappointed';

export type ExpressionName =
  | 'Neutral'
  | 'Happy'
  | 'Sad'
  | 'Surprised'
  | 'Annoyed'
  | 'Thinking'
  | 'Eyes_Closed'
  | 'Blink'
  | 'Talking';

export interface ExpressionConfig {
  morphs: Record<string, number>;
  eyeScaleZ?: number;
}

export const EXPRESSION_PRESETS: Record<ExpressionName, ExpressionConfig> = {
  Neutral: {
    morphs: {
      Mouth_Smile: 0.0,
      Mouth_Open: 0.0,
      Mouth_O: 0.0,
      Mouth_Sad: 0.0,
      Eyebrow_Raise: 0.0,
      Eyebrow_Furrow: 0.0,
      Eyebrow_Sad: 0.0,
    },
    eyeScaleZ: 1.0,
  },
  Happy: {
    morphs: {
      Mouth_Smile: 1.0,
      Mouth_Open: 0.1,
      Eyebrow_Raise: 0.35,
    },
    eyeScaleZ: 1.0,
  },
  Sad: {
    morphs: {
      Mouth_Sad: 1.0,
      Eyebrow_Sad: 0.8,
    },
    eyeScaleZ: 1.0,
  },
  Surprised: {
    morphs: {
      Mouth_O: 1.0,
      Mouth_Open: 0.6,
      Eyebrow_Raise: 1.0,
    },
    eyeScaleZ: 1.1,
  },
  Annoyed: {
    morphs: {
      Mouth_Sad: 0.6,
      Eyebrow_Furrow: 1.0,
    },
    eyeScaleZ: 0.9,
  },
  Thinking: {
    morphs: {
      Mouth_O: 0.35,
      Eyebrow_Furrow: 0.6,
      Eyebrow_Raise: 0.25,
    },
    eyeScaleZ: 1.0,
  },
  Eyes_Closed: {
    morphs: {},
    eyeScaleZ: 0.05,
  },
  Blink: {
    morphs: {},
    eyeScaleZ: 0.05,
  },
  Talking: {
    morphs: {
      Mouth_Open: 0.7,
      Mouth_O: 0.3,
    },
    eyeScaleZ: 1.0,
  },
};

export class CharacterRuntimeController {
  public root: THREE.Group | null = null;
  public mixer: THREE.AnimationMixer | null = null;
  public actions: Map<CanonicalActionName, THREE.AnimationAction> = new Map();
  public currentAction: THREE.AnimationAction | null = null;
  public currentActionName: CanonicalActionName | null = null;

  // Facial elements
  private mouthMesh: THREE.Mesh | null = null;
  private eyebrowMeshes: THREE.Mesh[] = [];
  private eyeBones: THREE.Bone[] = [];

  // Expression interpolation state
  private targetMorphs: Map<string, number> = new Map();
  private targetEyeScaleZ: number = 1.0;
  private currentEyeScaleZ: number = 1.0;

  // Procedural blinking
  public autoBlink: boolean = true;
  private blinkTimer: number = 0;
  private nextBlinkTime: number = 3.0;
  private isBlinking: boolean = false;
  private blinkProgress: number = 0;

  // Procedural talking
  public isTalking: boolean = false;
  private talkTime: number = 0;

  constructor(private gltfPath: string) {}

  public async load(parentScene?: THREE.Scene): Promise<THREE.Group> {
    const loader = new GLTFLoader();
    const gltf: GLTF = await loader.loadAsync(this.gltfPath);

    this.root = gltf.scene;

    // Traverse and index components
    this.root.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.name === 'Mouth') {
          this.mouthMesh = mesh;
        } else if (mesh.name === 'Eyebrow_L' || mesh.name === 'Eyebrow_R') {
          this.eyebrowMeshes.push(mesh);
        }
      } else if ((node as THREE.Bone).isBone) {
        const bone = node as THREE.Bone;
        if (bone.name === 'Eye.L' || bone.name === 'Eye.R') {
          this.eyeBones.push(bone);
        }
      }
    });

    // Initialize animation mixer
    this.mixer = new THREE.AnimationMixer(this.root);
    gltf.animations.forEach((clip) => {
      if (this.mixer) {
        const action = this.mixer.clipAction(clip);
        this.actions.set(clip.name as CanonicalActionName, action);
      }
    });

    if (parentScene) {
      parentScene.add(this.root);
    }

    // Default to Idle and Neutral
    this.playAction('Action_Idle');
    this.setExpression('Neutral', 1.0);

    return this.root;
  }

  public playAction(name: CanonicalActionName, crossFadeDuration: number = 0.25): void {
    const nextAction = this.actions.get(name);
    if (!nextAction || nextAction === this.currentAction) return;

    nextAction.reset();
    nextAction.play();

    if (this.currentAction) {
      this.currentAction.crossFadeTo(nextAction, crossFadeDuration, true);
    }

    this.currentAction = nextAction;
    this.currentActionName = name;
  }

  public setExpression(name: ExpressionName, weight: number = 1.0): void {
    const preset = EXPRESSION_PRESETS[name] || EXPRESSION_PRESETS.Neutral;

    // Reset targets to zero
    this.targetMorphs.clear();
    for (const [mName, val] of Object.entries(preset.morphs)) {
      this.targetMorphs.set(mName, val * weight);
    }

    this.targetEyeScaleZ = preset.eyeScaleZ !== undefined ? preset.eyeScaleZ : 1.0;
  }

  public setMorphWeight(morphName: string, value: number): void {
    this.targetMorphs.set(morphName, value);
  }

  public update(delta: number): void {
    if (this.mixer) {
      this.mixer.update(delta);
    }

    // Procedural blink logic
    if (this.autoBlink) {
      this.updateAutoBlink(delta);
    }

    // Procedural talk oscillation
    if (this.isTalking) {
      this.talkTime += delta * 12.0;
      const openVal = Math.max(0, Math.sin(this.talkTime)) * 0.75;
      const oVal = Math.max(0, Math.cos(this.talkTime * 0.7)) * 0.35;
      this.targetMorphs.set('Mouth_Open', openVal);
      this.targetMorphs.set('Mouth_O', oVal);
    }

    // Smoothly interpolate morph target weights
    const lerpSpeed = 12.0 * delta;
    this.currentEyeScaleZ += (this.targetEyeScaleZ - this.currentEyeScaleZ) * Math.min(1.0, lerpSpeed);

    // Apply eye scales
    for (const eb of this.eyeBones) {
      eb.scale.z = this.currentEyeScaleZ;
    }

    // Update mouth morph targets
    if (this.mouthMesh && this.mouthMesh.morphTargetDictionary && this.mouthMesh.morphTargetInfluences) {
      for (const [mName, targetVal] of this.targetMorphs.entries()) {
        const idx = this.mouthMesh.morphTargetDictionary[mName];
        if (idx !== undefined) {
          const current = this.mouthMesh.morphTargetInfluences[idx];
          this.mouthMesh.morphTargetInfluences[idx] = current + (targetVal - current) * Math.min(1.0, lerpSpeed);
        }
      }
    }

    // Update eyebrow morph targets
    for (const ebMesh of this.eyebrowMeshes) {
      if (ebMesh.morphTargetDictionary && ebMesh.morphTargetInfluences) {
        for (const [mName, targetVal] of this.targetMorphs.entries()) {
          const idx = ebMesh.morphTargetDictionary[mName];
          if (idx !== undefined) {
            const current = ebMesh.morphTargetInfluences[idx];
            ebMesh.morphTargetInfluences[idx] = current + (targetVal - current) * Math.min(1.0, lerpSpeed);
          }
        }
      }
    }
  }

  private updateAutoBlink(delta: number): void {
    if (!this.isBlinking) {
      this.blinkTimer += delta;
      if (this.blinkTimer >= this.nextBlinkTime) {
        this.isBlinking = true;
        this.blinkProgress = 0;
        this.blinkTimer = 0;
        this.nextBlinkTime = 2.5 + Math.random() * 3.5;
      }
    } else {
      this.blinkProgress += delta * 14.0; // Quick 0.15s blink
      if (this.blinkProgress < Math.PI) {
        const closeFactor = Math.sin(this.blinkProgress);
        this.targetEyeScaleZ = 1.0 - closeFactor * 0.95;
      } else {
        this.targetEyeScaleZ = 1.0;
        this.isBlinking = false;
      }
    }
  }
}
