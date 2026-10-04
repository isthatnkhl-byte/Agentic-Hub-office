import * as THREE from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { CHARACTER_TEMPLATES, HAIR_COLORS, SKIN_TONES, randomName, sameLook } from '../../shared/avatar';
import { saveProfile, store, type Profile } from '../state';
import { Person } from '../world/character';
import { toonUnique } from '../world/toon';
import { h, openModal } from './dom';

/** A turntable with your character on it, drawn with its own small renderer. */
class Preview {
  readonly person: Person;
  private renderer: THREE.WebGLRenderer;
  private effect: OutlineEffect;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(28, 1, 0.1, 20);
  private raf = 0;
  private resize: ResizeObserver;
  private yaw = 0.5;
  private dragging = false;
  private lastDrag = -Infinity;
  private hopT = -1;

  constructor(
    private canvas: HTMLCanvasElement,
    p: Profile,
  ) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.effect = new OutlineEffect(this.renderer, { defaultThickness: 0.0045, defaultColor: [0.17, 0.18, 0.26] });

    this.scene.add(new THREE.HemisphereLight('#fff5e6', '#c9a27a', 1.5));
    this.scene.add(new THREE.AmbientLight('#ffffff', 0.5));
    const sun = new THREE.DirectionalLight('#fff1d6', 2.2);
    sun.position.set(-3, 6, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.02;
    Object.assign(sun.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.5, far: 20 });
    this.scene.add(sun);
    const rug = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), toonUnique('#ffd6a5'));
    rug.rotation.x = -Math.PI / 2;
    rug.receiveShadow = true;
    rug.material.userData.outlineParameters = { visible: false };
    this.scene.add(rug);

    this.person = new Person(p.name, p.color, p.look);
    this.person.showLabel(false);
    this.scene.add(this.person.root);
    this.camera.position.set(0, 1.35, 4.6);
    this.camera.lookAt(0, 0.95, 0);

    this.resize = new ResizeObserver(() => this.fit());
    this.resize.observe(canvas);
    this.fit();

    canvas.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      this.yaw += e.movementX * 0.012;
      this.lastDrag = performance.now();
    });
    const release = () => {
      this.dragging = false;
      this.lastDrag = performance.now();
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      this.tick(dt, now / 1000);
      this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }

  /** A little hop and wave, to show a change landed. */
  cheer() {
    this.hopT = 0;
    this.person.reach();
  }

  private fit() {
    const w = this.canvas.clientWidth;
    const hgt = this.canvas.clientHeight;
    if (!w || !hgt) return;
    this.renderer.setSize(w, hgt, false);
    this.camera.aspect = w / hgt;
    this.camera.updateProjectionMatrix();
  }

  private tick(dt: number, t: number) {
    // Left alone, the character sways from side to side so you see the hair from every angle.
    if (!this.dragging && performance.now() - this.lastDrag > 1500) {
      const want = Math.sin(t * 0.6) * 1.1;
      this.yaw += (want - this.yaw) * Math.min(1, dt * 1.5);
    }
    this.person.root.rotation.y = this.yaw;
    let y = 0;
    if (this.hopT >= 0) {
      this.hopT += dt * 3.2;
      y = Math.sin(Math.min(1, this.hopT) * Math.PI) * 0.18;
      if (this.hopT >= 1) this.hopT = -1;
    }
    this.person.root.position.y = y;
    this.person.update(dt, t, false, y > 0.01);
    this.effect.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resize.disconnect();
    this.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).geometry.dispose();
    });
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

/**
 * The character select screen: your name and one of five ready-made characters, with a live preview.
 * `first` is the one you see when you join: closing it goes in as whoever's picked so far.
 */
export function openCharacter(first: boolean, onSave: (p: Profile) => void) {
  const pick: Profile = { ...store.profile, look: { ...store.profile.look } };
  // Convert older freeform looks to the first template if they do not match a preset.
  const templateLook = (template: (typeof CHARACTER_TEMPLATES)[number]) => ({ ...template.look });
  const savedTemplate = CHARACTER_TEMPLATES.find((template) => template.color === pick.color && sameLook(template.look, pick.look));
  if (!savedTemplate) {
    pick.look = templateLook(CHARACTER_TEMPLATES[0]);
    pick.color = CHARACTER_TEMPLATES[0].color;
  }
  const canvas = h('canvas', { 'aria-label': 'Your character, drag to spin' }) as HTMLCanvasElement;
  const preview = new Preview(canvas, pick);

  // Leave the name blank (or skip this) and you go by the made-up one in the box; 🎲 deals another.
  // Guest is what you were before you picked one, so it isn't a name to keep.
  const input = h('input', { type: 'text', maxlength: 24, value: pick.name === 'Guest' ? '' : pick.name, placeholder: randomName(), 'aria-label': 'Your name' }) as HTMLInputElement;
  const reroll = h('button.btn', { type: 'button', title: 'Random name', 'aria-label': 'Random name' }, '🎲');
  reroll.addEventListener('click', () => {
    let name = randomName();
    while (name === input.value || name === input.placeholder) name = randomName();
    input.value = input.placeholder = name;
    input.focus();
  });
  const typedName = () => input.value.trim().slice(0, 24) || input.placeholder;
  // Your account's name is the one everyone sees; only the look is yours to change here.
  const account = store.me.account;
  if (account) {
    input.value = account.name;
    input.readOnly = true;
    input.title = 'Your account name';
  }

  const templateList = h('div.character-templates', { role: 'group', 'aria-label': 'Choose a character' });

  const change = (template: (typeof CHARACTER_TEMPLATES)[number]) => {
    pick.look = templateLook(template);
    pick.color = template.color;
    preview.person.setLook(pick.look);
    preview.person.setColor(pick.color);
    preview.cheer();
    paint();
  };

  const paint = () => {
    const selected = CHARACTER_TEMPLATES.find((template) => template.color === pick.color && sameLook(template.look, pick.look));
    templateList.replaceChildren(...CHARACTER_TEMPLATES.map((template) => {
      const on = template.id === selected?.id;
      return h(
        'button.character-template',
        { type: 'button', 'aria-pressed': String(on), class: on ? 'selected' : '', style: `--character-shirt:${template.color};--character-skin:${SKIN_TONES[template.look.skin]};--character-hair:${HAIR_COLORS[template.look.hair]};`, onclick: () => change(template) },
        h('span.character-template-art', {}, h('span.character-template-hair', {}), h('span.character-template-face', {}), h('span.character-template-body', {}), h('span.character-template-mark', {}, template.mark)),
        h('span.character-template-copy', {}, h('strong', {}, template.name), h('small', {}, template.description)),
        on ? h('span.character-template-check', { 'aria-hidden': 'true' }, '✓') : null,
      );
    }));
  };
  paint();
  const save = h('button.btn.primary', { type: 'submit' }, first ? 'Enter the office 🚪' : 'Save');
  const close = h('button.btn.close', { type: 'button', 'aria-label': 'Close', title: first ? 'Skip: go in with this look (Esc)' : 'Close (Esc)' }, '✕');

  const form = h(
    'form.modal.charsel',
    { role: 'dialog', 'aria-label': 'Pick your character' },
    h('header', {}, h('h2', {}, first ? '👋 Pick your character' : '🧍 Your character'), close),
    h(
      'div.body',
      {},
      h('div.charsel-stage', {}, canvas, h('span.tip', {}, 'Drag to spin')),
      h(
        'div.charsel-opts',
        {},
        h('label', {}, 'Your name'),
        account ? input : h('div.webhook', {}, input, reroll),
        account ? h('p.setting-note', {}, `🔑 Signed in as ${account.name}, so that's your name here.`) : null,
        h('label', {}, 'Choose your character'),
        h('p.character-template-hint', {}, 'Pick one of five characters. Drag the preview to see them from every angle.'),
        templateList,
      ),
    ),
    h('footer', {}, h('span.grow'), save),
  ) as HTMLFormElement;

  let done = false;
  const finish = (name: string) => {
    done = true;
    store.profile = { name, color: pick.color, look: { ...pick.look } };
    saveProfile(store.profile);
    modal.close();
    onSave(store.profile);
  };
  const modal = openModal(form, {
    // A stray click shouldn't skip the first one; ✕ and Esc still do.
    backdropCloses: !first,
    doing: '🪞 picking a new look',
    onClose: () => {
      preview.dispose();
      // The office only lets you in with a character: skipping it goes in with this one, and the name in the box.
      if (first && !done) finish(typedName());
    },
  });
  close.addEventListener('click', () => modal.close());
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    finish(typedName());
  });
  if (!account) setTimeout(() => input.focus(), 30);
}
