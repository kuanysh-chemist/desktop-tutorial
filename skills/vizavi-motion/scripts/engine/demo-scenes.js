// Demo / smoke test (8 s): night→dawn over layered ridges. Shows the intended way to build a shot:
// camera function of t → depth layers (far→near) with fog between → particles with DOF + motion blur →
// light (glow, shafts, bloom) → grade → grain/vignette → type. Copy as scenes.js to try the pipeline end to end.
window.DURATION = 8;
window.FONTS = ['600 120px CormSC', '500 56px Corm'];

const DUST = new Particles(700, 3, { wind: [40, -30], depth: 2600, size: 2.4, sway: 60 });
function camA(t) { const k = seg(t, 0, 8); return { x: lerp(-260, 220, E.s(k)), y: lerp(-330, -420, E.io(k)), z: lerp(0, 700, E.io(k)), roll: lerp(-.04, .025, E.io(k)) }; }

function shot(t) {
  const c = camA(t), cp = camA(t - 1 / 60), dawn = E.io(seg(t, 1, 6.5));
  sky(ctx, mixColor('#060b18', '#2a3f6b', dawn), mixColor('#10213a', '#f2a46b', dawn), [W * .62, H * .62, 900, `rgba(255,190,120,${.15 + .5 * dawn})`]);
  const layers = [ // far → near: lighter, bluer, hazier with distance (aerial perspective); rim light from the sunrise
    [16000, 'rA', '#3a4c74', '#ffd2a6', 11, 1500, 22000, 6500],
    [8000, 'rB', '#24335a', '#ffc08a', 12, 1150, 11000, 3200],
    [4000, 'rC', '#141f3a', '#e8935f', 13, 900, 5400, 1600],
    [2200, 'rD', '#080d18', '#b8653d', 14, 760, 3000, 880],
  ];
  const sun = proj(c, 1600, lerp(-900, -3600, dawn), 15000);
  layers.forEach(([D, key, col, lit, seed, y, ww, hh], i) => {
    if (i === 1) { // the sun sits between the far ridges: glow + crepuscular rays fanning upward
      radialGlow(ctx, sun[0], sun[1], 520, `rgba(255,214,160,${.85 * dawn})`, 'screen');
      for (let k = 0; k < 7; k++) lightShaft(sun[0], sun[1], -Math.PI / 2 + (k - 3) * .32 + Math.sin(t * .3 + k) * .03, 1400, 20, 320, '#ffe2b8', .16 * dawn, 36);
    }
    drawRidge(ctx, c, D, ridgeSprite(key, 2400, 700, col, lit, seed), y, ww, hh);
    if (i < 3) fogBand(ctx, c, D * .85, y - 20, 220, '#f2c49a', .08 + .22 * dawn);
  });
  DUST.draw(ctx, t, c, cp, { focus: 900, dofK: 12, color: '255,226,180', alpha: .5 + .4 * dawn, comp: 'screen' });
  // foreground pine branch: out of focus, strongest parallax (sells depth)
  layerFX(g => {
    camT(c, 1100, g); g.translate(-1150, -560); g.strokeStyle = '#04060b'; g.fillStyle = '#04060b'; g.lineCap = 'round';
    g.lineWidth = 22; g.beginPath(); g.moveTo(-500, -200); g.quadraticCurveTo(0, 0, 480, 60); g.stroke(); g.lineWidth = 5;
    for (let i = 0; i < 90; i++) { const u = i / 90, bx = lerp(-480, 470, u), by = lerp(-190, 55, u) + Math.sin(u * 3) * 25, a = (i % 2 ? 1 : -1) * (.5 + hash(i) * .5) + 1.3, L = 70 + hash(i * 3) * 60; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + Math.cos(a) * L, by + Math.sin(a) * L); g.stroke(); }
  }, { blur: dof(c, 1100, 4000), smear: screenVel(c, cp, -800, -500, 1100) });
  bloom(.3 + .25 * dawn);
  grade(mixColor('#9fb4ff', '#fff1e0', dawn), 'multiply');
  post(t, { vig: .6 });
}
function overlays(t) { dip(pulse(t, 7.3, 8, 8.1), '0,0,0'); }
function texts(t) {
  titleReveal('VIZAVI', W / 2, H * .36, t, 2.2, { color: '#fff4e6', glow: 'rgba(255,170,90,.6)', out: [6.6, 7.4] });
  maskReveal('движение — это история', W / 2, H * .36 + 110, seg(t, 3.4, 4.8), { color: 'rgba(255,240,225,.9)' });
}
window.renderAt = makeRenderer([[0, 8, shot]], { overlays, texts });
