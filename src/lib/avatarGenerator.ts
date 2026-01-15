// Character to design element mapping
const CHARACTER_COLORS: Record<string, string> = {
  'A': '#FF6B6B', 'B': '#4ECDC4', 'C': '#45B7D1', 'D': '#96CEB4',
  'E': '#FFEAA7', 'F': '#DDA0DD', 'G': '#98D8C8', 'H': '#F7DC6F',
  'I': '#BB8FCE', 'J': '#85C1E9', 'K': '#F8B739', 'L': '#82E0AA',
  'M': '#F1948A', 'N': '#85929E', 'O': '#76D7C4', 'P': '#F0B27A',
  'Q': '#D7BDE2', 'R': '#A9CCE3', 'S': '#A3E4D7', 'T': '#FAD7A0',
  'U': '#D5A6BD', 'V': '#AED6F1', 'W': '#A2D9CE', 'X': '#F9E79F',
  'Y': '#E8DAEF', 'Z': '#D6EAF8', '0': '#FCF3CF', '1': '#D5F5E3',
  '2': '#FADBD8', '3': '#E8F8F5', '4': '#FEF9E7', '5': '#F5EEF8',
  '6': '#EBF5FB', '7': '#E9F7EF', '8': '#FDEDEC', '9': '#F4ECF7',
  '@': '#2C3E50', '.': '#34495E', '_': '#5D6D7E', '-': '#7F8C8D',
  '+': '#95A5A6',
};

const SHAPES = ['circle', 'square', 'triangle', 'hexagon', 'diamond', 'pentagon', 'star'] as const;
type Shape = typeof SHAPES[number];

const PATTERNS = ['solid', 'striped', 'dotted', 'grid', 'waves'] as const;
type Pattern = typeof PATTERNS[number];

interface CharacterElement {
  char: string;
  color: string;
  shape: Shape;
  pattern: Pattern;
  rotation: number;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getCharacterElement(char: string, index: number, email: string): CharacterElement {
  const upperChar = char.toUpperCase();
  const hash = hashString(email + index);
  
  const color = CHARACTER_COLORS[upperChar] || `hsl(${(upperChar.charCodeAt(0) * 37) % 360}, 70%, 60%)`;
  const shape = SHAPES[hash % SHAPES.length];
  const pattern = PATTERNS[(hash >> 3) % PATTERNS.length];
  const rotation = (hash % 8) * 45;
  
  return { char: upperChar, color, shape, pattern, rotation };
}

export function processEmail(email: string): CharacterElement[] {
  const normalized = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '');
  return normalized.split('').map((char, index) => getCharacterElement(char, index, email));
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape,
  x: number,
  y: number,
  size: number,
  color: string,
  rotation: number
): void {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.fillStyle = color;
  ctx.beginPath();
  
  const r = size * 0.4;
  
  switch (shape) {
    case 'circle':
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(-r, -r, r * 2, r * 2);
      break;
    case 'triangle':
      ctx.moveTo(0, -r);
      ctx.lineTo(r, r);
      ctx.lineTo(-r, r);
      ctx.closePath();
      break;
    case 'hexagon':
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case 'diamond':
      ctx.moveTo(0, -r);
      ctx.lineTo(r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r, 0);
      ctx.closePath();
      break;
    case 'pentagon':
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      break;
    case 'star':
      for (let i = 0; i < 5; i++) {
        const outerAngle = (Math.PI * 2 / 5) * i - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        const outerX = Math.cos(outerAngle) * r;
        const outerY = Math.sin(outerAngle) * r;
        const innerX = Math.cos(innerAngle) * r * 0.5;
        const innerY = Math.sin(innerAngle) * r * 0.5;
        if (i === 0) ctx.moveTo(outerX, outerY);
        else ctx.lineTo(outerX, outerY);
        ctx.lineTo(innerX, innerY);
      }
      ctx.closePath();
      break;
  }
  
  ctx.fill();
  ctx.restore();
}

export function generateAvatarCanvas(email: string, size: number = 256): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const elements = processEmail(email);
  const gridSize = Math.ceil(Math.sqrt(Math.max(elements.length, 9)));
  const cellSize = size / gridSize;
  
  // Background gradient based on email hash
  const hash = hashString(email);
  const bgHue1 = hash % 360;
  const bgHue2 = (hash >> 8) % 360;
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, `hsl(${bgHue1}, 20%, 15%)`);
  gradient.addColorStop(1, `hsl(${bgHue2}, 25%, 20%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw elements
  elements.slice(0, gridSize * gridSize).forEach((element, index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const x = col * cellSize;
    const y = row * cellSize;
    
    drawShape(ctx, element.shape, x, y, cellSize, element.color, element.rotation);
  });
  
  // Add subtle overlay pattern
  ctx.globalAlpha = 0.03;
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < size; i += 4) {
    for (let j = 0; j < size; j += 4) {
      if ((i + j) % 8 === 0) {
        ctx.fillRect(i, j, 2, 2);
      }
    }
  }
  ctx.globalAlpha = 1;
  
  // Rounded corners mask
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const radius = size * 0.12;
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
  const elements = processEmail(email);
  const gridSize = Math.ceil(Math.sqrt(Math.max(elements.length, 9)));
  const cellSize = size / gridSize;
  
  const hash = hashString(email);
  const bgHue1 = hash % 360;
  const bgHue2 = (hash >> 8) % 360;
  
  let shapes = '';
  elements.slice(0, gridSize * gridSize).forEach((element, index) => {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const cx = col * cellSize + cellSize / 2;
    const cy = row * cellSize + cellSize / 2;
    const r = cellSize * 0.4;
    
    let shape = '';
    switch (element.shape) {
      case 'circle':
        shape = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${element.color}" transform="rotate(${element.rotation} ${cx} ${cy})"/>`;
        break;
      case 'square':
        shape = `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${element.color}" transform="rotate(${element.rotation} ${cx} ${cy})"/>`;
        break;
      default:
        shape = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${element.color}"/>`;
    }
    shapes += shape;
  });
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:hsl(${bgHue1}, 20%, 15%)"/>
        <stop offset="100%" style="stop-color:hsl(${bgHue2}, 25%, 20%)"/>
      </linearGradient>
      <clipPath id="rounded">
        <rect width="${size}" height="${size}" rx="${size * 0.12}" ry="${size * 0.12}"/>
      </clipPath>
    </defs>
    <g clip-path="url(#rounded)">
      <rect width="${size}" height="${size}" fill="url(#bg)"/>
      ${shapes}
    </g>
  </svg>`;
}
