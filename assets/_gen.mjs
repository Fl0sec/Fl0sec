// Generates the GitHub profile assets (animated banner, cards, chips) with all
// text outlined to paths — GitHub serves SVG as <img>, so web fonts never load.
// usage: node profile.mjs <fontDir> <outDir>
import fs from 'node:fs'
import path from 'node:path'
import opentype from 'opentype.js'

const [fontDir, outDir, brandDir = 'D:/git_sync/fl0sec/brand'] = process.argv.slice(2)
// Stills of the website's 3D scene, from the brand kit
const still = (n) => `data:image/png;base64,${fs.readFileSync(path.join(brandDir, 'logo', '3d', n)).toString('base64')}`
const HERO3D = still('ring0-3d-hero-512.png')
const ICON3D = still('ring0-3d-icon-64.png')
fs.mkdirSync(outDir, { recursive: true })

const C = { bg: '#08090b', panel: '#0e1013', fg: '#f4f5f8', muted: '#8a8f98', dim: '#5d626b', line: '#ffffff14', brand: '#7c6cf2', brandHi: '#a99dff' }
const F = {
  400: opentype.parse(fs.readFileSync(path.join(fontDir, 'Inter-400.woff')).buffer),
  600: opentype.parse(fs.readFileSync(path.join(fontDir, 'Inter-600.woff')).buffer),
}

function measure(text, size, w = 400, track = 0) {
  const f = F[w]; let x = 0
  for (const ch of text) x += (f.charToGlyph(ch).advanceWidth / f.unitsPerEm) * size + track * size
  return x - track * size
}
// Outlined text. `colors` lets single characters take another fill (the accent 0).
function text(str, x, y, size, { w = 400, fill = C.fg, track = 0, colors = {}, cls = '' } = {}) {
  const f = F[w]; let cx = x; const out = []
  for (const ch of str) {
    const g = f.charToGlyph(ch)
    const d = g.getPath(cx, y, size).toPathData(2)
    if (d) out.push(`<path${cls ? ` class="${cls}"` : ''} fill="${colors[ch] ?? fill}" d="${d}"/>`)
    cx += (g.advanceWidth / f.unitsPerEm) * size + track * size
  }
  return out.join('')
}
function wrap(str, size, maxW, w = 400) {
  const lines = []; let line = ''
  for (const word of str.split(' ')) {
    const t = line ? `${line} ${word}` : word
    if (measure(t, size, w) > maxW && line) { lines.push(line); line = word } else line = t
  }
  if (line) lines.push(line)
  return lines
}

// Ring 0 mark centered at (cx, cy), scale s (64-unit design). Optional animation classes.
// Lit gradients match public/brand/mark-full.svg (graphite rings, violet glass).
const LIT_DEFS = `
  <linearGradient id="la" x1="-24" y1="-26" x2="24" y2="26" gradientUnits="userSpaceOnUse"><stop stop-color="#c9ccd6"/><stop offset=".45" stop-color="#5d6170"/><stop offset="1" stop-color="#2a2d36"/></linearGradient>
  <linearGradient id="lb" x1="-18" y1="-19" x2="18" y2="19" gradientUnits="userSpaceOnUse"><stop stop-color="#eceef4"/><stop offset=".5" stop-color="#9a9eab"/><stop offset="1" stop-color="#5b5f6c"/></linearGradient>
  <linearGradient id="lc" x1="-12" y1="-12" x2="12" y2="12" gradientUnits="userSpaceOnUse"><stop stop-color="#b9b0ff"/><stop offset="1" stop-color="#6553e8"/></linearGradient>
  <linearGradient id="ld" x1="-6" y1="-6" x2="6" y2="6" gradientUnits="userSpaceOnUse"><stop stop-color="#c4bcff"/><stop offset="1" stop-color="#7c6cf2"/></linearGradient>`
function mark(cx, cy, s, animated = false, lit = false) {
  const r = (h, rad, op, stroke, cls) =>
    `<rect${animated ? ` class="${cls}"` : ''} x="${-h}" y="${-h}" width="${2 * h}" height="${2 * h}" rx="${rad}" fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="2.6"/>`
  return `<g transform="translate(${cx} ${cy}) scale(${s})">
    ${lit ? r(27, 12, 1, 'url(#la)', 'r3') : r(27, 12, 0.3, C.fg, 'r3')}
    ${lit ? r(19.5, 8.5, 1, 'url(#lb)', 'r2') : r(19.5, 8.5, 0.6, C.fg, 'r2')}
    ${r(12, 5.5, 1, lit ? 'url(#lc)' : C.brand, 'r1')}
    <rect${animated ? ' class="core"' : ''} x="-6" y="-6" width="12" height="12" rx="3" fill="${lit ? 'url(#ld)' : C.brand}"/>
    ${lit ? '<rect x="-4.8" y="-5.4" width="9.6" height="1.1" rx=".55" fill="#fff" fill-opacity=".45"/>' : ''}
  </g>`
}

const dotGrid = (id) => `<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#ffffff" fill-opacity=".05"/></pattern>`

// ---------------- Banner ----------------
function banner() {
  const W = 1200, H = 380
  const tx = 452
  const title = 'Offensive security,'
  const title2 = 'down to ring 0.'
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<style>
  .r3,.r2,.r1,.core{transform-box:fill-box;transform-origin:center}
  .r3{animation:breathe 7s cubic-bezier(.45,0,.2,1) infinite}
  .r2{animation:breathe 7s cubic-bezier(.45,0,.2,1) infinite .25s}
  .r1{animation:breathe 7s cubic-bezier(.45,0,.2,1) infinite .5s}
  .core{animation:core 7s ease-in-out infinite}
  .halo{animation:halo 7s ease-in-out infinite}
  .float{transform-box:fill-box;transform-origin:center;animation:float 8s ease-in-out infinite}
  @keyframes float{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.02)}}
  .glitch{animation:glitch 9s steps(1) infinite}
  .scan{animation:scan 7s linear infinite}
  @keyframes breathe{0%,100%{transform:scale(1)}45%,55%{transform:scale(1.06)}}
  @keyframes core{0%,100%{opacity:1}50%{opacity:.78}}
  @keyframes halo{0%,100%{opacity:.55}50%{opacity:1}}
  @keyframes glitch{0%,93%,100%{transform:translate(0,0);opacity:1}94%{transform:translate(3px,0);opacity:.7}95%{transform:translate(-2px,0)}96%{transform:translate(1px,0);opacity:1}}
  @keyframes scan{0%{transform:translateY(-40px);opacity:0}10%{opacity:.5}60%{opacity:.5}70%,100%{transform:translateY(${H}px);opacity:0}}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<defs>
  ${LIT_DEFS}
  ${dotGrid('dots')}
  <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(250 190) scale(260)">
    <stop offset="0" stop-color="${C.brand}" stop-opacity=".32"/><stop offset=".55" stop-color="${C.brand}" stop-opacity=".06"/><stop offset="1" stop-color="${C.brand}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="${C.brand}" stop-opacity="0"/><stop offset=".5" stop-color="${C.brandHi}" stop-opacity=".9"/><stop offset="1" stop-color="${C.brand}" stop-opacity="0"/></linearGradient>
  <linearGradient id="edge" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".16"/><stop offset=".7" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <clipPath id="clip"><rect width="${W}" height="${H}" rx="20"/></clipPath>
</defs>
<g clip-path="url(#clip)">
  <rect width="${W}" height="${H}" fill="${C.bg}"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect class="halo" width="${W}" height="${H}" fill="url(#glow)"/>
  <rect class="scan" x="60" y="0" width="380" height="1" fill="url(#fade)"/>
  <g class="float"><image x="80" y="20" width="340" height="340" href="${HERO3D}"/></g>
  <rect x="0" y="0" width="${W}" height="1" fill="url(#edge)"/>
  ${text('fl0sec', tx, 112, 30, { w: 600, track: -0.035, colors: { 0: C.brand } })}
  ${text('OFFENSIVE SECURITY  ·  PENTESTING  ·  LOW-LEVEL RESEARCH', tx + 132, 108, 13, { w: 600, fill: C.dim, track: 0.14 })}
  ${text(title, tx, 186, 52, { w: 600, track: -0.03 })}
  <g class="glitch">${text(title2, tx, 248, 52, { w: 600, track: -0.03, colors: { 0: C.brandHi } })}</g>
  ${text('Web, API and Windows pentesting, backed by kernel and anti-cheat research.', tx, 296, 18.5, { fill: C.muted })}
  ${text('fl0sec.com', tx, 338, 17, { w: 600, fill: C.fg })}
  ${text('·   florent@fl0sec.com', tx + measure('fl0sec.com', 17, 600) + 14, 338, 17, { fill: C.muted })}
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="#fff" stroke-opacity=".08"/>
</g>
</svg>`
}

// ---------------- Cards ----------------
function card({ kicker, title, body, foot, w = 460, h = 210 }) {
  const pad = 26
  const tl = wrap(title, 22, w - pad * 2, 600).slice(0, 2)
  const bl = wrap(body, 15.5, w - pad * 2).slice(0, 4 - tl.length) // keeps the footer clear
  let y = pad + 14
  const parts = [text(kicker.toUpperCase(), pad, y, 11.5, { w: 600, fill: C.brandHi, track: 0.14 })]
  y += 34
  tl.forEach((l) => { parts.push(text(l, pad, y, 22, { w: 600, track: -0.02 })); y += 28 })
  y += 2
  bl.forEach((l) => { parts.push(text(l, pad, y, 15.5, { fill: C.muted })); y += 23 })
  parts.push(text(foot, pad, h - pad + 4, 13, { w: 600, fill: C.dim }))
  parts.push(`<path d="M${w - pad - 14} ${h - pad} h13 m-5 -5 l5 5 l-5 5" fill="none" stroke="${C.brandHi}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs><linearGradient id="e" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".25" stop-color="#fff" stop-opacity=".14"/><stop offset=".75" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<radialGradient id="g" cx="1" cy="0" r="1"><stop offset="0" stop-color="${C.brand}" stop-opacity=".16"/><stop offset="1" stop-color="${C.brand}" stop-opacity="0"/></radialGradient></defs>
<rect width="${w}" height="${h}" rx="16" fill="${C.panel}"/><rect width="${w}" height="${h}" rx="16" fill="url(#g)"/>
<rect x="16" y="0" width="${w - 32}" height="1" fill="url(#e)"/>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="15.5" fill="none" stroke="#fff" stroke-opacity=".08"/>
${parts.join('\n')}
</svg>`
}

// ---------------- Chips (credentials / focus) ----------------
function chips(items, { w = 1200 } = {}) {
  const h = 44, gap = 10, size = 14
  let x = 0; const out = []
  for (const it of items) {
    const tw = measure(it.label, size, 600)
    const cw = tw + 40 + (it.dot ? 14 : 0)
    out.push(`<rect x="${x + .5}" y=".5" width="${cw - 1}" height="${h - 1}" rx="${(h - 1) / 2}" fill="${C.panel}" stroke="#fff" stroke-opacity=".09"/>`)
    let tx = x + 20
    if (it.dot) { out.push(`<circle cx="${tx + 3}" cy="${h / 2}" r="3.5" fill="${it.dot}"/>`); tx += 14 }
    out.push(text(it.label, tx, h / 2 + 5, size, { w: 600, fill: C.fg }))
    x += cw + gap
  }
  const total = x - gap
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${h}" width="${total}" height="${h}">${out.join('')}</svg>`
}

// ---------------- Section header ----------------
function header(label, w = 830) {
  const h = 40
  const tw = measure(label.toUpperCase(), 12, 600) + 12 * 0.18 * label.length
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs><linearGradient id="l" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
<image x="-2" y="9" width="22" height="22" href="${ICON3D}"/>
${text(label.toUpperCase(), 30, 25, 12, { w: 600, fill: C.muted, track: 0.18 })}
<rect x="${30 + tw + 18}" y="20" width="${w - (30 + tw + 18)}" height="1" fill="url(#l)"/>
</svg>`
}

const files = {
  'banner.svg': banner(),
  'credentials.svg': chips([
    { label: 'OSCP', dot: C.brand },
    { label: 'Hack The Box  ·  Pro Hacker', dot: '#9fef00' },
    { label: 'TryHackMe  ·  Top 2%', dot: '#ff4d4d' },
    { label: 'C++23  ·  4+ years', dot: '#5ea3ff' },
  ]),
  'h-focus.svg': header('What I do'),
  'h-research.svg': header('Research'),
  'h-projects.svg': header('Open source'),
  'h-contact.svg': header('Work with me'),
  'card-pentest.svg': card({ kicker: 'Offensive', title: 'Penetration testing', body: 'Web apps, APIs and Windows environments. Every finding comes with proof and a fix.', foot: 'Web  ·  API  ·  Active Directory' }),
  'card-research.svg': card({ kicker: 'Research', title: 'Low-level & anti-cheat RE', body: 'Kernel drivers, protections and Windows internals: how the mechanism really works, from userland to ring 0.', foot: 'Kernel  ·  Anti-tamper  ·  Syscalls' }),
  'card-tbmke.svg': card({ kicker: 'Reversing  ·  2026-09-13', title: 'Inside a rare kernel anti-cheat CTF', body: 'A game process, a watchdog and a self-signed kernel driver defend two integers. Three small mistakes are enough to take both.', foot: 'fl0sec.com/research' }),
  'card-pivotgate.svg': card({ kicker: 'Windows internals  ·  2026-09-17', title: 'PivotGate: syscalls, no stack fiction', body: "A hidden gap in ntdll's syscall layout becomes an SSN resolver, through the genuine Windows wrapper.", foot: 'fl0sec.com/research' }),
  'card-repo-pivotgate.svg': card({ kicker: 'C  ·  repository', title: 'PivotGate', body: 'Measured ntdll geometry and target-owned hardware-breakpoint syscalls, without stack fabrication.', foot: 'github.com/Fl0sec/PivotGate' }),
  'card-repo-labs.svg': card({ kicker: 'C++  ·  repository', title: 'fl0sec-labs', body: 'Companion source code, proofs of concept and reproducible artifacts for the research published on fl0sec.com.', foot: 'github.com/Fl0sec/fl0sec-labs' }),
  'contact.svg': chips([{ label: 'florent@fl0sec.com', dot: C.brand }, { label: 'fl0sec.com' }]),
}
for (const [n, s] of Object.entries(files)) fs.writeFileSync(path.join(outDir, n), s)
console.log('wrote', Object.keys(files).length, 'profile assets')
