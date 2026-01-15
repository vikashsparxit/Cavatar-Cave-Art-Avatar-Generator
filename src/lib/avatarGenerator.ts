// Advanced avatar generation with layered, artistic compositions

const CHARACTER_PALETTES: Record<string, string[]> = {
  'A': ['#FF6B6B', '#FF8E8E', '#FFB3B3'], 'B': ['#4ECDC4', '#6FE7DF', '#A8F5F0'],
  'C': ['#45B7D1', '#6BCAE2', '#A3DFF0'], 'D': ['#96CEB4', '#B5E0CC', '#D4F0E4'],
  'E': ['#FFEAA7', '#FFF0C0', '#FFF7DA'], 'F': ['#DDA0DD', '#E8BFE8', '#F3DFF3'],
  'G': ['#98D8C8', '#B5E5D9', '#D2F2EA'], 'H': ['#F7DC6F', '#FAE79C', '#FCF2C9'],
  'I': ['#BB8FCE', '#CEADE0', '#E1CBF2'], 'J': ['#85C1E9', '#A6D4F0', '#C7E7F7'],
  'K': ['#F8B739', '#FACB6B', '#FCDF9D'], 'L': ['#82E0AA', '#A8EBC4', '#CEF6DE'],
  'M': ['#F1948A', '#F5B3AB', '#F9D2CC'], 'N': ['#85929E', '#A3ADB8', '#C1C8D2'],
  'O': ['#76D7C4', '#9BE4D6', '#C0F1E8'], 'P': ['#F0B27A', '#F4C69E', '#F8DAC2'],
  'Q': ['#D7BDE2', '#E3D1EB', '#EFE5F4'], 'R': ['#A9CCE3', '#C4DCEC', '#DFECF5'],
  'S': ['#A3E4D7', '#C0EDE4', '#DDF6F1'], 'T': ['#FAD7A0', '#FCE3BC', '#FEEFD8'],
  'U': ['#D5A6BD', '#E2C0D1', '#EFDAE5'], 'V': ['#AED6F1', '#C7E3F6', '#E0F0FB'],
  'W': ['#A2D9CE', '#C0E6DD', '#DEF3EC'], 'X': ['#F9E79F', '#FBEDB8', '#FDF3D1'],
  'Y': ['#E8DAEF', '#EFE5F4', '#F6F0F9'], 'Z': ['#D6EAF8', '#E5F1FA', '#F4F8FC'],
  '0': ['#FF9F43', '#FFB76B', '#FFCF93'], '1': ['#EE5A24', '#F27D54', '#F6A084'],
  '2': ['#0ABDE3', '#42CEE9', '#7ADFEF'], '3': ['#10AC84', '#4CC3A5', '#88DAC6'],
  '4': ['#5F27CD', '#8658DB', '#AD89E9'], '5': ['#FF6B81', '#FF8FA0', '#FFB3BF'],
  '6': ['#2E86AB', '#5AA3C2', '#86C0D9'], '7': ['#A55EEA', '#BC87F0', '#D3B0F6'],
  '8': ['#26DE81', '#5BE7A3', '#90F0C5'], '9': ['#FD79A8', '#FE9BBF', '#FFBDD6'],
  '@': ['#2C3E50', '#3D5467', '#4E6A7E'], '.': ['#6C5CE7', '#8F83ED', '#B2AAF3'],
  '_': ['#00CEC9', '#33DBD7', '#66E8E5'], '-': ['#E17055', '#E99580', '#F1BAAB'],
  '+': ['#00B894', '#33CBAE', '#66DEC8'],
};

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

interface LayerElement {
  type: 'orb' | 'ring' | 'arc' | 'blob' | 'wave' | 'crystal' | 'spark';
  x: number;
  y: number;
  size: number;
  rotation: number;
  colors: string[];
  opacity: number;
  blur: number;
}

function getCharacterPalette(char: string): string[] {
  const upper = char.toUpperCase();
  return CHARACTER_PALETTES[upper] || ['#8E44AD', '#9B59B6', '#BF84D0'];
}

function generateLayers(email: string, size: number): LayerElement[] {
  const hash = hashString(email);
  const rand = seededRandom(hash);
  const chars = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '').split('');
  const layers: LayerElement[] = [];
  const center = size / 2;
  
  // Layer 1: Background orbs (large, blurred, low opacity)
  const numOrbs = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < numOrbs; i++) {
    const charIndex = Math.floor(rand() * chars.length);
    const palette = getCharacterPalette(chars[charIndex] || 'A');
    const angle = rand() * Math.PI * 2;
    const distance = size * 0.15 + rand() * size * 0.25;
    
    layers.push({
      type: 'orb',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.4 + rand() * size * 0.3,
      rotation: rand() * 360,
      colors: palette,
      opacity: 0.3 + rand() * 0.2,
      blur: size * 0.08,
    });
  }
  
  // Layer 2: Flowing rings
  const numRings = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < numRings; i++) {
    const charIndex = (i * 3) % chars.length;
    const palette = getCharacterPalette(chars[charIndex] || 'B');
    
    layers.push({
      type: 'ring',
      x: center,
      y: center,
      size: size * 0.25 + i * size * 0.15,
      rotation: rand() * 360,
      colors: palette,
      opacity: 0.4 + rand() * 0.3,
      blur: 0,
    });
  }
  
  // Layer 3: Crystalline shapes based on characters
  const numCrystals = Math.min(chars.length, 8);
  for (let i = 0; i < numCrystals; i++) {
    const palette = getCharacterPalette(chars[i]);
    const angle = (i / numCrystals) * Math.PI * 2 + rand() * 0.5;
    const distance = size * 0.18 + rand() * size * 0.12;
    
    layers.push({
      type: 'crystal',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.08 + rand() * size * 0.06,
      rotation: (angle * 180 / Math.PI) + rand() * 30,
      colors: palette,
      opacity: 0.7 + rand() * 0.3,
      blur: 0,
    });
  }
  
  // Layer 4: Arcs emanating from center
  const numArcs = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < numArcs; i++) {
    const charIndex = Math.floor(rand() * chars.length);
    const palette = getCharacterPalette(chars[charIndex] || 'C');
    
    layers.push({
      type: 'arc',
      x: center,
      y: center,
      size: size * 0.2 + i * size * 0.08,
      rotation: (i * 60) + rand() * 40,
      colors: palette,
      opacity: 0.5 + rand() * 0.3,
      blur: 0,
    });
  }
  
  // Layer 5: Central blob
  const centralPalette = getCharacterPalette(chars[0] || 'X');
  layers.push({
    type: 'blob',
    x: center,
    y: center,
    size: size * 0.25,
    rotation: rand() * 360,
    colors: centralPalette,
    opacity: 0.9,
    blur: size * 0.01,
  });
  
  // Layer 6: Sparkles/highlights
  const numSparks = 5 + Math.floor(rand() * 5);
  for (let i = 0; i < numSparks; i++) {
    const angle = rand() * Math.PI * 2;
    const distance = size * 0.1 + rand() * size * 0.35;
    
    layers.push({
      type: 'spark',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.01 + rand() * size * 0.02,
      rotation: rand() * 360,
      colors: ['#FFFFFF', '#F8F9FA', '#E9ECEF'],
      opacity: 0.6 + rand() * 0.4,
      blur: size * 0.005,
    });
  }
  
  return layers;
}

function drawOrb(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  const gradient = ctx.createRadialGradient(
    layer.x, layer.y, 0,
    layer.x, layer.y, layer.size / 2
  );
  gradient.addColorStop(0, layer.colors[0] + 'CC');
  gradient.addColorStop(0.5, layer.colors[1] + '88');
  gradient.addColorStop(1, layer.colors[2] + '00');
  
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.filter = `blur(${layer.blur}px)`;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(layer.x, layer.y, layer.size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawRing(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  
  const gradient = ctx.createLinearGradient(-layer.size, 0, layer.size, 0);
  gradient.addColorStop(0, layer.colors[0] + '00');
  gradient.addColorStop(0.3, layer.colors[0]);
  gradient.addColorStop(0.5, layer.colors[1]);
  gradient.addColorStop(0.7, layer.colors[2]);
  gradient.addColorStop(1, layer.colors[2] + '00');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = layer.size * 0.08;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, layer.size, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();
}

function drawArc(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  
  const gradient = ctx.createLinearGradient(0, -layer.size, 0, layer.size);
  gradient.addColorStop(0, layer.colors[0]);
  gradient.addColorStop(1, layer.colors[2] + '00');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = layer.size * 0.15;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, layer.size, -Math.PI * 0.3, Math.PI * 0.3);
  ctx.stroke();
  ctx.restore();
}

function drawCrystal(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  
  const s = layer.size;
  const gradient = ctx.createLinearGradient(-s, -s, s, s);
  gradient.addColorStop(0, layer.colors[0]);
  gradient.addColorStop(0.5, layer.colors[1]);
  gradient.addColorStop(1, layer.colors[2]);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.6, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(-s * 0.6, 0);
  ctx.closePath();
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.3, -s * 0.2);
  ctx.lineTo(0, s * 0.3);
  ctx.lineTo(-s * 0.2, -s * 0.1);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

function drawBlob(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, layer.size);
  gradient.addColorStop(0, layer.colors[0]);
  gradient.addColorStop(0.6, layer.colors[1]);
  gradient.addColorStop(1, layer.colors[2]);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  
  // Organic blob shape using bezier curves
  const points = 8;
  const variance = layer.size * 0.15;
  const hash = hashString(layer.colors[0]);
  const rand = seededRandom(hash);
  
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = layer.size * 0.8 + (rand() - 0.5) * variance * 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevAngle = ((i - 1) / points) * Math.PI * 2;
      const midAngle = (prevAngle + angle) / 2;
      const cpR = layer.size * 0.9 + (rand() - 0.5) * variance;
      const cpX = Math.cos(midAngle) * cpR;
      const cpY = Math.sin(midAngle) * cpR;
      ctx.quadraticCurveTo(cpX, cpY, x, y);
    }
  }
  
  ctx.closePath();
  ctx.fill();
  
  // Inner glow
  const innerGradient = ctx.createRadialGradient(
    -layer.size * 0.2, -layer.size * 0.2, 0,
    0, 0, layer.size * 0.7
  );
  innerGradient.addColorStop(0, 'rgba(255,255,255,0.4)');
  innerGradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = innerGradient;
  ctx.fill();
  
  ctx.restore();
}

function drawSpark(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.filter = `blur(${layer.blur}px)`;
  
  const gradient = ctx.createRadialGradient(
    layer.x, layer.y, 0,
    layer.x, layer.y, layer.size
  );
  gradient.addColorStop(0, '#FFFFFF');
  gradient.addColorStop(0.5, '#FFFFFFAA');
  gradient.addColorStop(1, '#FFFFFF00');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(layer.x, layer.y, layer.size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawLayer(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  switch (layer.type) {
    case 'orb': drawOrb(ctx, layer); break;
    case 'ring': drawRing(ctx, layer); break;
    case 'arc': drawArc(ctx, layer); break;
    case 'crystal': drawCrystal(ctx, layer); break;
    case 'blob': drawBlob(ctx, layer); break;
    case 'spark': drawSpark(ctx, layer); break;
  }
}

export function processEmail(email: string) {
  const chars = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '').split('');
  return chars.map((char, index) => ({
    char,
    color: getCharacterPalette(char)[0],
    shape: ['orb', 'crystal', 'ring', 'arc', 'blob'][index % 5] as LayerElement['type'],
    pattern: 'gradient',
    rotation: (index * 45) % 360,
  }));
}

export function generateAvatarCanvas(email: string, size: number = 256): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const hash = hashString(email);
  const rand = seededRandom(hash);
  
  // Background gradient
  const bgHue1 = (hash % 60) + 200; // Cool tones
  const bgHue2 = ((hash >> 8) % 60) + 260;
  const bgGradient = ctx.createRadialGradient(
    size * 0.3, size * 0.3, 0,
    size / 2, size / 2, size * 0.8
  );
  bgGradient.addColorStop(0, `hsl(${bgHue1}, 30%, 18%)`);
  bgGradient.addColorStop(0.5, `hsl(${(bgHue1 + bgHue2) / 2}, 25%, 12%)`);
  bgGradient.addColorStop(1, `hsl(${bgHue2}, 35%, 8%)`);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);
  
  // Generate and draw layers
  const layers = generateLayers(email, size);
  layers.forEach(layer => drawLayer(ctx, layer));
  
  // Vignette overlay
  const vignette = ctx.createRadialGradient(
    size / 2, size / 2, size * 0.2,
    size / 2, size / 2, size * 0.7
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);
  
  // Rounded corners mask
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const radius = size * 0.15;
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  
  return canvas;
}

export function generateAvatarDataURL(email: string, size: number = 256): string {
  const canvas = generateAvatarCanvas(email, size);
  return canvas.toDataURL('image/png');
}

export function generateAvatarSVG(email: string, size: number = 256): string {
  // Simplified SVG version
  const hash = hashString(email);
  const chars = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '').split('');
  const center = size / 2;
  
  const bgHue1 = (hash % 60) + 200;
  const bgHue2 = ((hash >> 8) % 60) + 260;
  
  let shapes = '';
  const numShapes = Math.min(chars.length, 8);
  
  for (let i = 0; i < numShapes; i++) {
    const palette = getCharacterPalette(chars[i]);
    const angle = (i / numShapes) * Math.PI * 2;
    const distance = size * 0.2;
    const x = center + Math.cos(angle) * distance;
    const y = center + Math.sin(angle) * distance;
    const shapeSize = size * 0.12;
    
    shapes += `
      <circle cx="${x}" cy="${y}" r="${shapeSize}" fill="${palette[0]}" opacity="0.8">
        <animate attributeName="opacity" values="0.6;0.9;0.6" dur="${2 + i * 0.3}s" repeatCount="indefinite"/>
      </circle>`;
  }
  
  // Central blob
  const centralPalette = getCharacterPalette(chars[0] || 'A');
  shapes += `<circle cx="${center}" cy="${center}" r="${size * 0.18}" fill="url(#centralGrad)"/>`;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="bgGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:hsl(${bgHue1}, 30%, 18%)"/>
        <stop offset="100%" style="stop-color:hsl(${bgHue2}, 35%, 8%)"/>
      </radialGradient>
      <radialGradient id="centralGrad">
        <stop offset="0%" style="stop-color:${centralPalette[0]}"/>
        <stop offset="100%" style="stop-color:${centralPalette[2]}"/>
      </radialGradient>
      <clipPath id="rounded">
        <rect width="${size}" height="${size}" rx="${size * 0.15}" ry="${size * 0.15}"/>
      </clipPath>
    </defs>
    <g clip-path="url(#rounded)">
      <rect width="${size}" height="${size}" fill="url(#bgGrad)"/>
      ${shapes}
    </g>
  </svg>`;
}