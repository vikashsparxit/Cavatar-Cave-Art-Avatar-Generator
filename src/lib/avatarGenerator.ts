// Cave art / petroglyphic style avatar generation with white line drawings

export type BackgroundType = 'cosmos' | 'white' | string;
export type AvatarShape = 'rounded' | 'circle';

// Extract first alphabetic character from email for silhouette
function getFirstLetter(email: string): string {
  const match = email.match(/[a-zA-Z]/);
  return match ? match[0].toUpperCase() : '';
}

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

// Determine if a color is light or dark
function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

function getLineColor(background: BackgroundType): string {
  if (background === 'cosmos') return '#ffffff';
  if (background === 'white') return '#1a1a2e';
  // For custom hex colors, determine contrast
  if (background.startsWith('#')) {
    return isLightColor(background) ? '#1a1a2e' : '#ffffff';
  }
  return '#ffffff';
}

interface LayerElement {
  type: 'line-circle' | 'concentric' | 'spiral' | 'triangle' | 'cross' | 'dots' | 'wavy-line' | 'connection';
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  strokeWidth: number;
  variant?: number;
}

function generateLayers(email: string, size: number): LayerElement[] {
  const hash = hashString(email);
  const rand = seededRandom(hash);
  const chars = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '').split('');
  const layers: LayerElement[] = [];
  const center = size / 2;
  
  const cornerAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
  
  // ===== ZONE 1: CORNER CONCENTRIC CIRCLES =====
  for (let i = 0; i < 4; i++) {
    const angle = cornerAngles[i] + (rand() - 0.5) * 0.3;
    const distance = size * 0.32 + rand() * size * 0.08;
    
    layers.push({
      type: 'concentric',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.12 + rand() * size * 0.08,
      rotation: rand() * 360,
      opacity: 0.5 + rand() * 0.3,
      strokeWidth: 1.5 + rand() * 1,
      variant: 2 + Math.floor(rand() * 2),
    });
  }
  
  // ===== ZONE 2: PRIMARY LINE CIRCLES =====
  const numCircles = 3 + Math.floor(rand() * 2);
  for (let i = 0; i < numCircles; i++) {
    const angle = (i / numCircles) * Math.PI * 2 + rand() * 0.5;
    const distance = size * 0.08 + rand() * size * 0.2;
    
    layers.push({
      type: 'line-circle',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.06 + rand() * size * 0.08,
      rotation: rand() * 360,
      opacity: 0.7 + rand() * 0.3,
      strokeWidth: 1.5 + rand() * 1.5,
    });
  }
  
  // ===== ZONE 3: SPIRALS =====
  const numSpirals = 1 + Math.floor(rand() * 2);
  for (let i = 0; i < numSpirals; i++) {
    const angle = rand() * Math.PI * 2;
    const distance = size * 0.15 + rand() * size * 0.15;
    
    layers.push({
      type: 'spiral',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.08 + rand() * size * 0.06,
      rotation: rand() * 360,
      opacity: 0.6 + rand() * 0.3,
      strokeWidth: 1.5 + rand() * 1,
      variant: rand() > 0.5 ? 1 : -1, // clockwise or counter
    });
  }
  
  // ===== ZONE 4: TRIANGLES =====
  const numTriangles = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < numTriangles; i++) {
    const charIndex = i % chars.length;
    const angle = (i / numTriangles) * Math.PI * 2 + rand() * 0.8;
    const distance = size * 0.2 + rand() * size * 0.18;
    
    layers.push({
      type: 'triangle',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.04 + rand() * size * 0.04,
      rotation: (charIndex * 60) + rand() * 40,
      opacity: 0.7 + rand() * 0.3,
      strokeWidth: 1.5 + rand() * 1,
    });
  }
  
  // ===== ZONE 5: CROSS MARKS =====
  const numCrosses = 3 + Math.floor(rand() * 3);
  for (let i = 0; i < numCrosses; i++) {
    const angle = rand() * Math.PI * 2;
    const distance = size * 0.1 + rand() * size * 0.35;
    
    layers.push({
      type: 'cross',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.02 + rand() * size * 0.025,
      rotation: rand() * 45,
      opacity: 0.5 + rand() * 0.4,
      strokeWidth: 1 + rand() * 1,
    });
  }
  
  // ===== ZONE 6: DOT CLUSTERS =====
  const numDotClusters = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < numDotClusters; i++) {
    const angle = rand() * Math.PI * 2;
    const distance = size * 0.15 + rand() * size * 0.25;
    
    layers.push({
      type: 'dots',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.04 + rand() * size * 0.03,
      rotation: rand() * 360,
      opacity: 0.6 + rand() * 0.4,
      strokeWidth: 1,
      variant: 3 + Math.floor(rand() * 3), // number of dots
    });
  }
  
  // ===== ZONE 7: WAVY LINES =====
  const numWavyLines = 2 + Math.floor(rand() * 2);
  for (let i = 0; i < numWavyLines; i++) {
    const angle = (i / numWavyLines) * Math.PI * 2 + rand() * 0.5;
    const distance = size * 0.2 + rand() * size * 0.15;
    
    layers.push({
      type: 'wavy-line',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.1 + rand() * size * 0.1,
      rotation: rand() * 360,
      opacity: 0.5 + rand() * 0.3,
      strokeWidth: 1 + rand() * 1,
      variant: 2 + Math.floor(rand() * 2), // number of waves
    });
  }
  
  // ===== ZONE 8: CONNECTION LINES =====
  const numConnections = 4 + Math.floor(rand() * 3);
  for (let i = 0; i < numConnections; i++) {
    const angle = rand() * Math.PI * 2;
    const distance = size * 0.1 + rand() * size * 0.3;
    
    layers.push({
      type: 'connection',
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: size * 0.08 + rand() * size * 0.12,
      rotation: rand() * 360,
      opacity: 0.3 + rand() * 0.3,
      strokeWidth: 0.5 + rand() * 0.5,
    });
  }
  
  return layers;
}

function drawLineCircle(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(layer.x, layer.y, layer.size, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawConcentric(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  const rings = layer.variant || 3;
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  for (let i = 0; i < rings; i++) {
    const radius = layer.size * (0.4 + (i / rings) * 0.6);
    ctx.beginPath();
    ctx.arc(layer.x, layer.y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSpiral(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const direction = layer.variant || 1;
  ctx.beginPath();
  for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
    const radius = (angle / (Math.PI * 4)) * layer.size;
    const x = Math.cos(angle * direction) * radius;
    const y = Math.sin(angle * direction) * radius;
    if (angle === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
  ctx.restore();
}

function drawTriangle(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  const s = layer.size;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.866, s * 0.5);
  ctx.lineTo(-s * 0.866, s * 0.5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawCross(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const s = layer.size;
  ctx.beginPath();
  ctx.moveTo(-s, -s);
  ctx.lineTo(s, s);
  ctx.moveTo(s, -s);
  ctx.lineTo(-s, s);
  ctx.stroke();
  ctx.restore();
}

function drawDots(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  const numDots = layer.variant || 4;
  const hash = hashString(`${layer.x}${layer.y}`);
  const rand = seededRandom(hash);
  
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.fillStyle = lineColor;
  
  const dotPositions: {x: number, y: number}[] = [];
  
  for (let i = 0; i < numDots; i++) {
    const angle = (i / numDots) * Math.PI * 2 + rand() * 0.5;
    const dist = layer.size * (0.3 + rand() * 0.7);
    const dotX = layer.x + Math.cos(angle) * dist;
    const dotY = layer.y + Math.sin(angle) * dist;
    const dotSize = 1.5 + rand() * 1.5;
    
    dotPositions.push({x: dotX, y: dotY});
    
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Connect some dots with thin lines
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = layer.opacity * 0.5;
  for (let i = 0; i < dotPositions.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(dotPositions[i].x, dotPositions[i].y);
    ctx.lineTo(dotPositions[i + 1].x, dotPositions[i + 1].y);
    ctx.stroke();
  }
  
  ctx.restore();
}

function drawWavyLine(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const waves = layer.variant || 3;
  const amplitude = layer.size * 0.2;
  
  ctx.beginPath();
  ctx.moveTo(-layer.size, 0);
  
  for (let x = -layer.size; x <= layer.size; x += 2) {
    const progress = (x + layer.size) / (layer.size * 2);
    const y = Math.sin(progress * Math.PI * 2 * waves) * amplitude;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawConnection(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  const hash = hashString(`${layer.x}${layer.y}${layer.rotation}`);
  const rand = seededRandom(hash);
  
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  // Draw a simple line with slight curve
  const startX = -layer.size / 2;
  const endX = layer.size / 2;
  const curveY = (rand() - 0.5) * layer.size * 0.3;
  
  ctx.beginPath();
  ctx.moveTo(startX, 0);
  ctx.quadraticCurveTo(0, curveY, endX, 0);
  ctx.stroke();
  
  ctx.restore();
}

function drawLayer(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  switch (layer.type) {
    case 'line-circle': drawLineCircle(ctx, layer, lineColor); break;
    case 'concentric': drawConcentric(ctx, layer, lineColor); break;
    case 'spiral': drawSpiral(ctx, layer, lineColor); break;
    case 'triangle': drawTriangle(ctx, layer, lineColor); break;
    case 'cross': drawCross(ctx, layer, lineColor); break;
    case 'dots': drawDots(ctx, layer, lineColor); break;
    case 'wavy-line': drawWavyLine(ctx, layer, lineColor); break;
    case 'connection': drawConnection(ctx, layer, lineColor); break;
  }
}

import { getShapeForCharacter } from './characterShapes';

export function processEmail(email: string) {
  const chars = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '').split('');
  return chars.map((char) => {
    const shape = getShapeForCharacter(char);
    return {
      char,
      color: '#ffffff',
      shape: shape.type,
      label: shape.label,
      pattern: 'cave-art',
      rotation: (char.charCodeAt(0) * 37) % 360,
    };
  });
}

// Simple email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function generateAvatarCanvas(email: string, size: number = 256, background: BackgroundType = 'cosmos', shape: AvatarShape = 'rounded'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  
  const hash = hashString(email);
  const bgRand = seededRandom(hash + 999);
  const lineColor = getLineColor(background);
  
  // Draw background based on type
  if (background === 'cosmos') {
    // Dark cosmos background
    const bgGradient = ctx.createRadialGradient(
      size * 0.3, size * 0.3, 0,
      size / 2, size / 2, size * 0.9
    );
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(0.4, '#16213e');
    bgGradient.addColorStop(0.7, '#0f0f23');
    bgGradient.addColorStop(1, '#0a0a15');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, size, size);
    
    // Add subtle background stars (tiny white dots)
    const numBgStars = 40 + Math.floor(bgRand() * 30);
    for (let i = 0; i < numBgStars; i++) {
      const starX = bgRand() * size;
      const starY = bgRand() * size;
      const starSize = 0.3 + bgRand() * 0.8;
      const starOpacity = 0.15 + bgRand() * 0.25;
      
      ctx.save();
      ctx.globalAlpha = starOpacity;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (background === 'white') {
    // Light gradient background
    const bgGradient = ctx.createRadialGradient(
      size * 0.3, size * 0.3, 0,
      size / 2, size / 2, size * 0.9
    );
    bgGradient.addColorStop(0, '#ffffff');
    bgGradient.addColorStop(0.5, '#f8f9fa');
    bgGradient.addColorStop(1, '#e9ecef');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, size, size);
  } else {
    // Custom hex color - solid fill
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  }
  
  // Draw first letter silhouette (subtle watermark behind elements)
  const firstLetter = getFirstLetter(email);
  if (firstLetter) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = lineColor;
    ctx.font = `bold ${size * 0.75}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(firstLetter, size / 2, size / 2);
    ctx.restore();
  }
  
  // Generate and draw layers
  const layers = generateLayers(email, size);
  layers.forEach(layer => drawLayer(ctx, layer, lineColor));
  
  // Shape mask (rounded or circle)
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  } else {
    const radius = size * 0.15;
    ctx.roundRect(0, 0, size, size, radius);
  }
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  
  return canvas;
}

export function generateAvatarDataURL(email: string, size: number = 256, background: BackgroundType = 'cosmos', shape: AvatarShape = 'rounded'): string {
  const canvas = generateAvatarCanvas(email, size, background, shape);
  return canvas.toDataURL('image/png');
}

export function generateAvatarSVG(email: string, size: number = 256, background: BackgroundType = 'cosmos', shape: AvatarShape = 'rounded'): string {
  const hash = hashString(email);
  const rand = seededRandom(hash);
  const lineColor = getLineColor(background);
  
  let shapes = '';
  let bgDefs = '';
  let bgRect = '';
  
  // Background based on type
  if (background === 'cosmos') {
    bgDefs = `
      <radialGradient id="bgGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#1a1a2e"/>
        <stop offset="40%" style="stop-color:#16213e"/>
        <stop offset="70%" style="stop-color:#0f0f23"/>
        <stop offset="100%" style="stop-color:#0a0a15"/>
      </radialGradient>`;
    bgRect = `<rect width="${size}" height="${size}" fill="url(#bgGrad)"/>`;
    
    // Background stars
    const bgRand = seededRandom(hash + 999);
    const numBgStars = 40 + Math.floor(bgRand() * 30);
    for (let i = 0; i < numBgStars; i++) {
      const starX = bgRand() * size;
      const starY = bgRand() * size;
      const starSize = 0.3 + bgRand() * 0.8;
      const starOpacity = 0.15 + bgRand() * 0.25;
      shapes += `<circle cx="${starX}" cy="${starY}" r="${starSize}" fill="#ffffff" opacity="${starOpacity}"/>`;
    }
  } else if (background === 'white') {
    bgDefs = `
      <radialGradient id="bgGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#ffffff"/>
        <stop offset="50%" style="stop-color:#f8f9fa"/>
        <stop offset="100%" style="stop-color:#e9ecef"/>
      </radialGradient>`;
    bgRect = `<rect width="${size}" height="${size}" fill="url(#bgGrad)"/>`;
  } else {
    bgRect = `<rect width="${size}" height="${size}" fill="${background}"/>`;
  }
  
  // Add first letter silhouette
  const firstLetter = getFirstLetter(email);
  if (firstLetter) {
    shapes += `<text x="${size / 2}" y="${size / 2}" font-family="Arial, sans-serif" font-size="${size * 0.75}" font-weight="bold" fill="${lineColor}" opacity="0.12" text-anchor="middle" dominant-baseline="central">${firstLetter}</text>`;
  }
  
  // Generate layers and convert to SVG
  const layers = generateLayers(email, size);
  
  layers.forEach(layer => {
    const opacity = layer.opacity.toFixed(2);
    const sw = layer.strokeWidth.toFixed(1);
    
    switch (layer.type) {
      case 'line-circle':
        shapes += `<circle cx="${layer.x}" cy="${layer.y}" r="${layer.size}" fill="none" stroke="${lineColor}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round"/>`;
        break;
        
      case 'concentric':
        const rings = layer.variant || 3;
        for (let i = 0; i < rings; i++) {
          const radius = layer.size * (0.4 + (i / rings) * 0.6);
          shapes += `<circle cx="${layer.x}" cy="${layer.y}" r="${radius}" fill="none" stroke="${lineColor}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round"/>`;
        }
        break;
        
      case 'spiral':
        let spiralPath = '';
        const dir = layer.variant || 1;
        for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
          const r = (angle / (Math.PI * 4)) * layer.size;
          const x = layer.x + Math.cos(angle * dir + layer.rotation * Math.PI / 180) * r;
          const y = layer.y + Math.sin(angle * dir + layer.rotation * Math.PI / 180) * r;
          spiralPath += (angle === 0 ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)} `;
        }
        shapes += `<path d="${spiralPath}" fill="none" stroke="${lineColor}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round"/>`;
        break;
        
      case 'triangle':
        const s = layer.size;
        const rot = layer.rotation * Math.PI / 180;
        const points = [
          [0, -s],
          [s * 0.866, s * 0.5],
          [-s * 0.866, s * 0.5]
        ].map(([px, py]) => {
          const rx = px * Math.cos(rot) - py * Math.sin(rot) + layer.x;
          const ry = px * Math.sin(rot) + py * Math.cos(rot) + layer.y;
          return `${rx.toFixed(1)},${ry.toFixed(1)}`;
        }).join(' ');
        shapes += `<polygon points="${points}" fill="none" stroke="${lineColor}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
        break;
        
      case 'cross':
        const cs = layer.size;
        const crot = layer.rotation * Math.PI / 180;
        const crossLines = [
          [[-cs, -cs], [cs, cs]],
          [[cs, -cs], [-cs, cs]]
        ];
        crossLines.forEach(([[x1, y1], [x2, y2]]) => {
          const rx1 = x1 * Math.cos(crot) - y1 * Math.sin(crot) + layer.x;
          const ry1 = x1 * Math.sin(crot) + y1 * Math.cos(crot) + layer.y;
          const rx2 = x2 * Math.cos(crot) - y2 * Math.sin(crot) + layer.x;
          const ry2 = x2 * Math.sin(crot) + y2 * Math.cos(crot) + layer.y;
          shapes += `<line x1="${rx1.toFixed(1)}" y1="${ry1.toFixed(1)}" x2="${rx2.toFixed(1)}" y2="${ry2.toFixed(1)}" stroke="${lineColor}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round"/>`;
        });
        break;
        
      case 'dots':
        const numDots = layer.variant || 4;
        const dotRand = seededRandom(hashString(`${layer.x}${layer.y}`));
        const dotPositions: {x: number, y: number}[] = [];
        
        for (let i = 0; i < numDots; i++) {
          const angle = (i / numDots) * Math.PI * 2 + dotRand() * 0.5;
          const dist = layer.size * (0.3 + dotRand() * 0.7);
          const dotX = layer.x + Math.cos(angle) * dist;
          const dotY = layer.y + Math.sin(angle) * dist;
          const dotSize = 1.5 + dotRand() * 1.5;
          
          dotPositions.push({x: dotX, y: dotY});
          shapes += `<circle cx="${dotX.toFixed(1)}" cy="${dotY.toFixed(1)}" r="${dotSize.toFixed(1)}" fill="${lineColor}" opacity="${opacity}"/>`;
        }
        
        // Connect dots
        for (let i = 0; i < dotPositions.length - 1; i++) {
          shapes += `<line x1="${dotPositions[i].x.toFixed(1)}" y1="${dotPositions[i].y.toFixed(1)}" x2="${dotPositions[i + 1].x.toFixed(1)}" y2="${dotPositions[i + 1].y.toFixed(1)}" stroke="${lineColor}" stroke-width="0.5" opacity="${(layer.opacity * 0.5).toFixed(2)}"/>`;
        }
        break;
        
      case 'wavy-line':
        const waves = layer.variant || 3;
        const amplitude = layer.size * 0.2;
        const wrot = layer.rotation * Math.PI / 180;
        let wavePath = '';
        
        for (let x = -layer.size; x <= layer.size; x += 2) {
          const progress = (x + layer.size) / (layer.size * 2);
          const ly = Math.sin(progress * Math.PI * 2 * waves) * amplitude;
          const rx = x * Math.cos(wrot) - ly * Math.sin(wrot) + layer.x;
          const ry = x * Math.sin(wrot) + ly * Math.cos(wrot) + layer.y;
          wavePath += (x === -layer.size ? 'M' : 'L') + `${rx.toFixed(1)},${ry.toFixed(1)} `;
        }
        shapes += `<path d="${wavePath}" fill="none" stroke="${lineColor}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round"/>`;
        break;
        
      case 'connection':
        const connRand = seededRandom(hashString(`${layer.x}${layer.y}${layer.rotation}`));
        const connRot = layer.rotation * Math.PI / 180;
        const startX = -layer.size / 2;
        const endX = layer.size / 2;
        const curveY = (connRand() - 0.5) * layer.size * 0.3;
        
        const sx = startX * Math.cos(connRot) + layer.x;
        const sy = startX * Math.sin(connRot) + layer.y;
        const ex = endX * Math.cos(connRot) + layer.x;
        const ey = endX * Math.sin(connRot) + layer.y;
        const cx = layer.x;
        const cy = curveY * Math.cos(connRot) + layer.y;
        
        shapes += `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" fill="none" stroke="${lineColor}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round"/>`;
        break;
    }
  });
  
  // Clip path based on shape
  const clipPathDef = shape === 'circle'
    ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/>`
    : `<rect width="${size}" height="${size}" rx="${size * 0.15}" ry="${size * 0.15}"/>`;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>
      ${bgDefs}
      <clipPath id="avatarClip">
        ${clipPathDef}
      </clipPath>
    </defs>
    <g clip-path="url(#avatarClip)">
      ${bgRect}
      ${shapes}
    </g>
  </svg>`;
}
