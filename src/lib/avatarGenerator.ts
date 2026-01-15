// Advanced avatar generation with cosmic/nebula artistic compositions

// Rich, saturated color palettes - vibrant cores with darker variants
const CHARACTER_PALETTES: Record<string, string[]> = {
  'A': ['#FF4444', '#CC2222', '#881111'], 'B': ['#00D9B5', '#009E7F', '#006B55'],
  'C': ['#00B4D8', '#0077B6', '#004D73'], 'D': ['#2DD4BF', '#0D9488', '#065F5B'],
  'E': ['#FBBF24', '#D97706', '#92400E'], 'F': ['#E879F9', '#C026D3', '#7E22CE'],
  'G': ['#34D399', '#059669', '#065F46'], 'H': ['#FCD34D', '#F59E0B', '#B45309'],
  'I': ['#A78BFA', '#7C3AED', '#5B21B6'], 'J': ['#38BDF8', '#0284C7', '#075985'],
  'K': ['#FB923C', '#EA580C', '#9A3412'], 'L': ['#4ADE80', '#16A34A', '#166534'],
  'M': ['#F87171', '#DC2626', '#991B1B'], 'N': ['#94A3B8', '#64748B', '#475569'],
  'O': ['#2DD4BF', '#14B8A6', '#0F766E'], 'P': ['#FB7185', '#E11D48', '#9F1239'],
  'Q': ['#C084FC', '#9333EA', '#6B21A8'], 'R': ['#60A5FA', '#2563EB', '#1E40AF'],
  'S': ['#5EEAD4', '#14B8A6', '#0D9488'], 'T': ['#FDE047', '#EAB308', '#A16207'],
  'U': ['#F472B6', '#DB2777', '#9D174D'], 'V': ['#7DD3FC', '#0EA5E9', '#0369A1'],
  'W': ['#6EE7B7', '#10B981', '#047857'], 'X': ['#FEF08A', '#FACC15', '#CA8A04'],
  'Y': ['#D8B4FE', '#A855F7', '#7E22CE'], 'Z': ['#93C5FD', '#3B82F6', '#1D4ED8'],
  '0': ['#FF7849', '#EA580C', '#C2410C'], '1': ['#FF5722', '#D84315', '#BF360C'],
  '2': ['#00BCD4', '#0097A7', '#00838F'], '3': ['#00E676', '#00C853', '#00A044'],
  '4': ['#7C4DFF', '#651FFF', '#4A148C'], '5': ['#FF4081', '#F50057', '#C51162'],
  '6': ['#448AFF', '#2979FF', '#2962FF'], '7': ['#E040FB', '#D500F9', '#AA00FF'],
  '8': ['#00E676', '#00C853', '#009624'], '9': ['#FF4081', '#F50057', '#AD1457'],
  '@': ['#7C4DFF', '#536DFE', '#3D5AFE'], '.': ['#E040FB', '#AA00FF', '#7B1FA2'],
  '_': ['#00BFA5', '#00897B', '#00695C'], '-': ['#FF6E40', '#FF3D00', '#DD2C00'],
  '+': ['#69F0AE', '#00E676', '#00C853'],
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
  type: 'nebula' | 'glow-orb' | 'ring' | 'crystal' | 'star' | 'arc';
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
  return CHARACTER_PALETTES[upper] || ['#8B5CF6', '#7C3AED', '#5B21B6'];
}

function generateLayers(email: string, size: number): LayerElement[] {
  const hash = hashString(email);
  const rand = seededRandom(hash);
  const chars = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '').split('');
  const layers: LayerElement[] = [];
  const center = size / 2;
  
  // Layer 1: Nebula clouds (large, blurred, low opacity - 2-3 max)
  const numNebulae = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < numNebulae; i++) {
    const charIndex = Math.floor(rand() * chars.length);
    const palette = getCharacterPalette(chars[charIndex] || 'A');
    const angle = rand() * Math.PI * 2;
    const distance = size * 0.1 + rand() * size * 0.2;
    
    layers.push({
      type: 'nebula',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.5 + rand() * size * 0.3,
      rotation: rand() * 360,
      colors: palette,
      opacity: 0.2 + rand() * 0.15,
      blur: size * 0.12,
    });
  }
  
  // Layer 2: Glowing orbs (core elements - 3-4)
  const numOrbs = 3 + Math.floor(rand() * 2);
  for (let i = 0; i < numOrbs; i++) {
    const charIndex = (i * 2) % chars.length;
    const palette = getCharacterPalette(chars[charIndex] || 'B');
    const angle = (i / numOrbs) * Math.PI * 2 + rand() * 0.5;
    const distance = size * 0.15 + rand() * size * 0.12;
    
    layers.push({
      type: 'glow-orb',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.12 + rand() * size * 0.08,
      rotation: rand() * 360,
      colors: palette,
      opacity: 0.85 + rand() * 0.15,
      blur: size * 0.02,
    });
  }
  
  // Layer 3: Accent rings (2-3 thin glowing rings)
  const numRings = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < numRings; i++) {
    const charIndex = (i * 3) % chars.length;
    const palette = getCharacterPalette(chars[charIndex] || 'C');
    
    layers.push({
      type: 'ring',
      x: center,
      y: center,
      size: size * 0.2 + i * size * 0.12,
      rotation: rand() * 360,
      colors: palette,
      opacity: 0.6 + rand() * 0.3,
      blur: 0,
    });
  }
  
  // Layer 4: Crystalline shapes based on characters (4-6)
  const numCrystals = Math.min(chars.length, 6);
  for (let i = 0; i < numCrystals; i++) {
    const palette = getCharacterPalette(chars[i]);
    const angle = (i / numCrystals) * Math.PI * 2 + rand() * 0.4;
    const distance = size * 0.22 + rand() * size * 0.1;
    
    layers.push({
      type: 'crystal',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.06 + rand() * size * 0.04,
      rotation: (angle * 180 / Math.PI) + rand() * 20,
      colors: palette,
      opacity: 0.9 + rand() * 0.1,
      blur: 0,
    });
  }
  
  // Layer 5: Arcs (sweeping energy trails - 2-3)
  const numArcs = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < numArcs; i++) {
    const charIndex = Math.floor(rand() * chars.length);
    const palette = getCharacterPalette(chars[charIndex] || 'D');
    
    layers.push({
      type: 'arc',
      x: center,
      y: center,
      size: size * 0.25 + i * size * 0.08,
      rotation: (i * 90) + rand() * 60,
      colors: palette,
      opacity: 0.7 + rand() * 0.2,
      blur: size * 0.005,
    });
  }
  
  // Layer 6: Colored stars (NOT white - small accent highlights - 4-6)
  const numStars = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < numStars; i++) {
    const charIndex = Math.floor(rand() * chars.length);
    const palette = getCharacterPalette(chars[charIndex] || 'E');
    const angle = rand() * Math.PI * 2;
    const distance = size * 0.1 + rand() * size * 0.35;
    
    layers.push({
      type: 'star',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.015 + rand() * size * 0.015,
      rotation: rand() * 360,
      colors: palette,
      opacity: 0.8 + rand() * 0.2,
      blur: size * 0.003,
    });
  }
  
  return layers;
}

function drawNebula(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  const gradient = ctx.createRadialGradient(
    layer.x, layer.y, 0,
    layer.x, layer.y, layer.size / 2
  );
  // Fade from bright core to dark (not white)
  gradient.addColorStop(0, layer.colors[0]);
  gradient.addColorStop(0.4, layer.colors[1] + 'AA');
  gradient.addColorStop(0.7, layer.colors[2] + '55');
  gradient.addColorStop(1, 'transparent');
  
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.filter = `blur(${layer.blur}px)`;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(layer.x, layer.y, layer.size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGlowOrb(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  // Outer glow
  const outerGlow = ctx.createRadialGradient(
    layer.x, layer.y, 0,
    layer.x, layer.y, layer.size * 1.5
  );
  outerGlow.addColorStop(0, layer.colors[0] + 'CC');
  outerGlow.addColorStop(0.3, layer.colors[1] + '66');
  outerGlow.addColorStop(0.6, layer.colors[2] + '22');
  outerGlow.addColorStop(1, 'transparent');
  
  ctx.save();
  ctx.globalAlpha = layer.opacity * 0.6;
  ctx.filter = `blur(${layer.blur * 2}px)`;
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(layer.x, layer.y, layer.size * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  
  // Core orb
  const coreGradient = ctx.createRadialGradient(
    layer.x - layer.size * 0.2, layer.y - layer.size * 0.2, 0,
    layer.x, layer.y, layer.size
  );
  coreGradient.addColorStop(0, layer.colors[0]);
  coreGradient.addColorStop(0.5, layer.colors[1]);
  coreGradient.addColorStop(1, layer.colors[2]);
  
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(layer.x, layer.y, layer.size, 0, Math.PI * 2);
  ctx.fill();
  
  // Subtle highlight (colored, not white)
  const highlightGradient = ctx.createRadialGradient(
    layer.x - layer.size * 0.3, layer.y - layer.size * 0.3, 0,
    layer.x, layer.y, layer.size * 0.6
  );
  highlightGradient.addColorStop(0, layer.colors[0] + '80');
  highlightGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = highlightGradient;
  ctx.fill();
  ctx.restore();
}

function drawRing(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  
  const gradient = ctx.createLinearGradient(-layer.size, 0, layer.size, 0);
  gradient.addColorStop(0, 'transparent');
  gradient.addColorStop(0.2, layer.colors[2] + '88');
  gradient.addColorStop(0.5, layer.colors[0]);
  gradient.addColorStop(0.8, layer.colors[1] + '88');
  gradient.addColorStop(1, 'transparent');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = layer.size * 0.04;
  ctx.lineCap = 'round';
  ctx.shadowColor = layer.colors[0];
  ctx.shadowBlur = layer.size * 0.05;
  ctx.beginPath();
  ctx.arc(0, 0, layer.size, 0, Math.PI * 1.6);
  ctx.stroke();
  ctx.restore();
}

function drawCrystal(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  
  const s = layer.size;
  
  // Outer glow
  ctx.shadowColor = layer.colors[0];
  ctx.shadowBlur = s * 0.5;
  
  const gradient = ctx.createLinearGradient(-s, -s, s, s);
  gradient.addColorStop(0, layer.colors[0]);
  gradient.addColorStop(0.5, layer.colors[1]);
  gradient.addColorStop(1, layer.colors[2]);
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.5, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(-s * 0.5, 0);
  ctx.closePath();
  ctx.fill();
  
  // Inner facet highlight (colored)
  const facetGradient = ctx.createLinearGradient(-s * 0.3, -s, s * 0.3, 0);
  facetGradient.addColorStop(0, layer.colors[0] + '99');
  facetGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = facetGradient;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.25, -s * 0.3);
  ctx.lineTo(0, s * 0.2);
  ctx.lineTo(-s * 0.15, -s * 0.2);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

function drawArc(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  
  const gradient = ctx.createLinearGradient(0, -layer.size, 0, layer.size);
  gradient.addColorStop(0, layer.colors[0]);
  gradient.addColorStop(0.5, layer.colors[1] + 'CC');
  gradient.addColorStop(1, 'transparent');
  
  ctx.strokeStyle = gradient;
  ctx.lineWidth = layer.size * 0.08;
  ctx.lineCap = 'round';
  ctx.shadowColor = layer.colors[0];
  ctx.shadowBlur = layer.size * 0.1;
  ctx.beginPath();
  ctx.arc(0, 0, layer.size, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  
  // Colored star glow (NOT white)
  const gradient = ctx.createRadialGradient(
    layer.x, layer.y, 0,
    layer.x, layer.y, layer.size * 2
  );
  gradient.addColorStop(0, layer.colors[0]);
  gradient.addColorStop(0.3, layer.colors[1] + 'AA');
  gradient.addColorStop(0.6, layer.colors[2] + '44');
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(layer.x, layer.y, layer.size * 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Bright core
  ctx.fillStyle = layer.colors[0];
  ctx.beginPath();
  ctx.arc(layer.x, layer.y, layer.size * 0.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawLayer(ctx: CanvasRenderingContext2D, layer: LayerElement): void {
  switch (layer.type) {
    case 'nebula': drawNebula(ctx, layer); break;
    case 'glow-orb': drawGlowOrb(ctx, layer); break;
    case 'ring': drawRing(ctx, layer); break;
    case 'crystal': drawCrystal(ctx, layer); break;
    case 'arc': drawArc(ctx, layer); break;
    case 'star': drawStar(ctx, layer); break;
  }
}

export function processEmail(email: string) {
  const chars = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '').split('');
  return chars.map((char, index) => ({
    char,
    color: getCharacterPalette(char)[0],
    shape: ['glow-orb', 'crystal', 'ring', 'arc', 'star'][index % 5] as string,
    pattern: 'cosmic',
    rotation: (index * 45) % 360,
  }));
}

export function generateAvatarCanvas(email: string, size: number = 256): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const hash = hashString(email);
  
  // Deep cosmic background - dark with subtle color
  const bgHue = (hash % 40) + 250; // Purple-blue spectrum
  const bgHue2 = ((hash >> 8) % 30) + 280;
  
  const bgGradient = ctx.createRadialGradient(
    size * 0.3, size * 0.3, 0,
    size / 2, size / 2, size * 0.9
  );
  bgGradient.addColorStop(0, `hsl(${bgHue}, 50%, 12%)`);
  bgGradient.addColorStop(0.5, `hsl(${(bgHue + bgHue2) / 2}, 40%, 7%)`);
  bgGradient.addColorStop(1, `hsl(${bgHue2}, 60%, 4%)`);
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, size, size);
  
  // Subtle background stars (tiny dots)
  const rand = seededRandom(hash);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 20; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = rand() * 0.8 + 0.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Generate and draw layers
  const layers = generateLayers(email, size);
  layers.forEach(layer => drawLayer(ctx, layer));
  
  // Strong vignette to darken edges
  const vignette = ctx.createRadialGradient(
    size / 2, size / 2, size * 0.15,
    size / 2, size / 2, size * 0.6
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.7, 'rgba(0,0,0,0.3)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
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
  const hash = hashString(email);
  const chars = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '').split('');
  const center = size / 2;
  
  const bgHue = (hash % 40) + 250;
  const bgHue2 = ((hash >> 8) % 30) + 280;
  
  let shapes = '';
  const numShapes = Math.min(chars.length, 6);
  
  // Glowing orbs
  for (let i = 0; i < numShapes; i++) {
    const palette = getCharacterPalette(chars[i]);
    const angle = (i / numShapes) * Math.PI * 2;
    const distance = size * 0.2;
    const x = center + Math.cos(angle) * distance;
    const y = center + Math.sin(angle) * distance;
    const shapeSize = size * 0.08;
    
    shapes += `
      <circle cx="${x}" cy="${y}" r="${shapeSize * 2}" fill="url(#glow${i})" opacity="0.4"/>
      <circle cx="${x}" cy="${y}" r="${shapeSize}" fill="${palette[0]}"/>`;
  }
  
  // Generate gradient defs
  let gradientDefs = '';
  for (let i = 0; i < numShapes; i++) {
    const palette = getCharacterPalette(chars[i]);
    gradientDefs += `
      <radialGradient id="glow${i}">
        <stop offset="0%" style="stop-color:${palette[0]}"/>
        <stop offset="60%" style="stop-color:${palette[1]};stop-opacity:0.5"/>
        <stop offset="100%" style="stop-color:${palette[2]};stop-opacity:0"/>
      </radialGradient>`;
  }
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <radialGradient id="bgGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:hsl(${bgHue}, 50%, 12%)"/>
        <stop offset="50%" style="stop-color:hsl(${(bgHue + bgHue2) / 2}, 40%, 7%)"/>
        <stop offset="100%" style="stop-color:hsl(${bgHue2}, 60%, 4%)"/>
      </radialGradient>
      ${gradientDefs}
      <clipPath id="rounded">
        <rect width="${size}" height="${size}" rx="${size * 0.15}" ry="${size * 0.15}"/>
      </clipPath>
      <radialGradient id="vignette" cx="50%" cy="50%">
        <stop offset="15%" style="stop-color:transparent"/>
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.6)"/>
      </radialGradient>
    </defs>
    <g clip-path="url(#rounded)">
      <rect width="${size}" height="${size}" fill="url(#bgGrad)"/>
      ${shapes}
      <rect width="${size}" height="${size}" fill="url(#vignette)"/>
    </g>
  </svg>`;
}
