// Cave art / petroglyphic style avatar generation with white line drawings
// Each email character maps to a unique cave art shape

import { getShapeForCharacter, ShapeDefinition } from './characterShapes';

export type BackgroundType = 'cosmos' | 'white' | string;
export type AvatarShape = 'rounded' | 'circle' | 'triangle';
export type ImageFormat = 'png' | 'webp' | 'jpeg';
type DetailLevel = 'full' | 'medium' | 'minimal';

// All shape types from the character map
type ShapeType = 
  | 'triangle' | 'triangle-down' | 'concentric' | 'arc' | 'semicircle'
  | 'horizontal-lines' | 'spiral' | 'cross-plus' | 'vertical-line' | 'hook'
  | 'arrow-right' | 'corner' | 'zigzag' | 'circle' | 'lollipop' | 'circle-tail'
  | 'lollipop-kick' | 'wave' | 'tau' | 'cup' | 'cross' | 'fork' | 'ellipse'
  | 'line-dot' | 'triple-arc' | 'arrow-down' | 'flag' | 'angle' | 'dot'
  | 'underscore' | 'dash';

interface LayerElement {
  type: ShapeType;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  strokeWidth: number;
  variant?: number;
  char?: string;
}

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
  if (background.startsWith('#')) {
    return isLightColor(background) ? '#1a1a2e' : '#ffffff';
  }
  return '#ffffff';
}

// Size-adaptive detail level system
function getDetailLevel(size: number): DetailLevel {
  if (size >= 128) return 'full';
  if (size >= 64) return 'medium';
  return 'minimal';
}

// Get adaptive stroke width based on size
function getMinStrokeWidth(size: number): number {
  if (size < 64) return 2.5;
  if (size < 128) return 2;
  return 1.5;
}

// Get spread factor to push shapes apart at smaller sizes
function getSpreadFactor(size: number): number {
  if (size < 64) return 1.4;
  if (size < 128) return 1.2;
  return 1.0;
}

// Check if a point is inside a triangle (using barycentric coordinates)
function isPointInTriangleBounds(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number
): boolean {
  const denom = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
  const a = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / denom;
  const b = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / denom;
  const c = 1 - a - b;
  return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
}

// Check if a point (with element radius) is inside the safe zone for the given shape
function isPointInSafeZone(
  x: number, y: number,
  elementRadius: number,
  canvasSize: number,
  shape: AvatarShape
): boolean {
  const center = canvasSize / 2;
  const margin = elementRadius + canvasSize * 0.02;
  
  if (shape === 'circle') {
    const dist = Math.sqrt((x - center) ** 2 + (y - center) ** 2);
    return dist + margin < center;
  } 
  else if (shape === 'triangle') {
    const topMargin = margin * 1.5;
    const top = { x: center, y: topMargin };
    const bottomLeft = { x: margin, y: canvasSize - margin };
    const bottomRight = { x: canvasSize - margin, y: canvasSize - margin };
    
    return isPointInTriangleBounds(
      x, y,
      top.x, top.y,
      bottomLeft.x, bottomLeft.y,
      bottomRight.x, bottomRight.y
    );
  } 
  else {
    const cornerRadius = canvasSize * 0.15;
    const inBounds = x >= margin && x <= canvasSize - margin && 
                     y >= margin && y <= canvasSize - margin;
    
    if (!inBounds) return false;
    
    const corners = [
      { cx: cornerRadius, cy: cornerRadius },
      { cx: canvasSize - cornerRadius, cy: cornerRadius },
      { cx: cornerRadius, cy: canvasSize - cornerRadius },
      { cx: canvasSize - cornerRadius, cy: canvasSize - cornerRadius }
    ];
    
    for (const corner of corners) {
      const inCornerZone = (x < cornerRadius || x > canvasSize - cornerRadius) &&
                           (y < cornerRadius || y > canvasSize - cornerRadius);
      if (inCornerZone) {
        const distToCorner = Math.sqrt((x - corner.cx) ** 2 + (y - corner.cy) ** 2);
        if (distToCorner + margin > cornerRadius) return false;
      }
    }
    
    return true;
  }
}

// Constrain layers to fit within the avatar shape
function constrainLayersToShape(
  layers: LayerElement[],
  size: number,
  shape: AvatarShape
): LayerElement[] {
  const center = size / 2;
  
  return layers.map(layer => {
    let { x, y, size: elementSize } = layer;
    const elementRadius = elementSize;
    
    if (!isPointInSafeZone(x, y, elementRadius, size, shape)) {
      let pullFactor = 0.65;
      if (shape === 'triangle') {
        pullFactor = 0.55;
        const targetY = center + size * 0.1;
        y = targetY + (y - center) * pullFactor;
        x = center + (x - center) * pullFactor;
      } else {
        x = center + (x - center) * pullFactor;
        y = center + (y - center) * pullFactor;
      }
      
      elementSize *= 0.85;
      
      if (!isPointInSafeZone(x, y, elementSize, size, shape)) {
        elementSize *= 0.7;
        const extraPull = 0.7;
        x = center + (x - center) * extraPull;
        y = center + (y - center) * extraPull;
      }
    }
    
    return { ...layer, x, y, size: elementSize };
  }).filter(layer => {
    return isPointInSafeZone(layer.x, layer.y, layer.size * 0.5, size, shape);
  });
}

// Generate layers from email characters using CHARACTER_SHAPE_MAP
function generateLayers(email: string, size: number, shape: AvatarShape = 'rounded'): LayerElement[] {
  const hash = hashString(email);
  const rand = seededRandom(hash);
  const chars = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '').split('');
  const layers: LayerElement[] = [];
  const center = size / 2;
  const detailLevel = getDetailLevel(size);
  const minStroke = getMinStrokeWidth(size);
  const spread = getSpreadFactor(size);
  
  // Determine how many characters to render based on detail level
  const maxChars = detailLevel === 'full' ? chars.length : 
                   detailLevel === 'medium' ? Math.min(chars.length, 12) : 
                   Math.min(chars.length, 6);
  
  // Calculate positions using a spiral pattern for better distribution
  for (let i = 0; i < maxChars; i++) {
    const char = chars[i];
    const shapeDef = getShapeForCharacter(char);
    
    // Spiral placement with some randomization for organic feel
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const baseAngle = i * goldenAngle;
    const angleJitter = (rand() - 0.5) * 0.5;
    const angle = baseAngle + angleJitter;
    
    // Distance increases with index for spiral effect
    const normalizedIndex = i / Math.max(maxChars - 1, 1);
    const baseDistance = size * 0.12 + normalizedIndex * size * 0.28;
    const distanceJitter = rand() * size * 0.05;
    const distance = (baseDistance + distanceJitter) * spread;
    
    // Size varies based on character position and detail level
    const baseSize = detailLevel === 'minimal' ? size * 0.08 : 
                     detailLevel === 'medium' ? size * 0.06 : size * 0.05;
    const sizeVariation = rand() * size * 0.03;
    const elementSize = baseSize + sizeVariation;
    
    layers.push({
      type: shapeDef.type as ShapeType,
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      size: elementSize,
      rotation: rand() * 360,
      opacity: 0.6 + rand() * 0.4,
      strokeWidth: Math.max(minStroke, 1.5 + rand() * 1),
      variant: shapeDef.variant,
      char: char
    });
  }
  
  return constrainLayersToShape(layers, size, shape);
}

// ==================== CANVAS DRAW FUNCTIONS ====================

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

function drawTriangleDown(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
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
  ctx.moveTo(0, s);
  ctx.lineTo(s * 0.866, -s * 0.5);
  ctx.lineTo(-s * 0.866, -s * 0.5);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawConcentric(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  const rings = layer.variant || 2;
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
  
  // Variant 4 (@) has a center dot
  if (layer.variant === 4) {
    ctx.beginPath();
    ctx.arc(layer.x, layer.y, layer.size * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
  }
  ctx.restore();
}

function drawArc(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.arc(0, 0, layer.size, -Math.PI * 0.3, Math.PI * 0.3);
  ctx.stroke();
  ctx.restore();
}

function drawSemicircle(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.arc(0, 0, layer.size, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.restore();
}

function drawHorizontalLines(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  const lines = layer.variant || 2;
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const spacing = layer.size * 2 / (lines + 1);
  for (let i = 1; i <= lines; i++) {
    const y = -layer.size + i * spacing;
    ctx.beginPath();
    ctx.moveTo(-layer.size * 0.8, y);
    ctx.lineTo(layer.size * 0.8, y);
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
  
  // Variant 1 = CW, 2 = CCW, 3 = inverted
  const direction = layer.variant === 2 ? -1 : 1;
  const maxAngle = layer.variant === 3 ? Math.PI * 3 : Math.PI * 4;
  
  ctx.beginPath();
  for (let angle = 0; angle < maxAngle; angle += 0.1) {
    const radius = (angle / maxAngle) * layer.size;
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

function drawCrossPlus(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.variant === 2 ? layer.strokeWidth * 1.5 : layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const s = layer.size;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(0, s);
  ctx.moveTo(-s, 0);
  ctx.lineTo(s, 0);
  ctx.stroke();
  ctx.restore();
}

function drawVerticalLine(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(0, -layer.size);
  ctx.lineTo(0, layer.size);
  ctx.stroke();
  ctx.restore();
}

function drawHook(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const s = layer.size;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(0, s * 0.3);
  ctx.quadraticCurveTo(0, s, s * 0.5, s);
  ctx.stroke();
  ctx.restore();
}

function drawArrowRight(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
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
  ctx.moveTo(-s, 0);
  ctx.lineTo(s * 0.5, 0);
  ctx.lineTo(s * 0.2, -s * 0.4);
  ctx.moveTo(s * 0.5, 0);
  ctx.lineTo(s * 0.2, s * 0.4);
  ctx.stroke();
  ctx.restore();
}

function drawArrowDown(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
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
  ctx.lineTo(0, s * 0.5);
  ctx.lineTo(-s * 0.4, s * 0.2);
  ctx.moveTo(0, s * 0.5);
  ctx.lineTo(s * 0.4, s * 0.2);
  ctx.stroke();
  ctx.restore();
}

function drawCorner(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
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
  ctx.moveTo(-s, -s);
  ctx.lineTo(-s, s);
  ctx.lineTo(s, s);
  ctx.stroke();
  ctx.restore();
}

function drawZigzag(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  const variant = layer.variant || 1;
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
  
  if (variant === 1) {
    // Z shape
    ctx.moveTo(-s, -s * 0.5);
    ctx.lineTo(s, -s * 0.5);
    ctx.lineTo(-s, s * 0.5);
    ctx.lineTo(s, s * 0.5);
  } else if (variant === 2) {
    // Single peak (N)
    ctx.moveTo(-s, s);
    ctx.lineTo(-s, -s);
    ctx.lineTo(s, s);
    ctx.lineTo(s, -s);
  } else if (variant === 3) {
    // Mountain peaks (M)
    ctx.moveTo(-s, s);
    ctx.lineTo(-s * 0.5, -s);
    ctx.lineTo(0, s * 0.3);
    ctx.lineTo(s * 0.5, -s);
    ctx.lineTo(s, s);
  } else if (variant === 4) {
    // Double valley (W)
    ctx.moveTo(-s, -s);
    ctx.lineTo(-s * 0.5, s);
    ctx.lineTo(0, -s * 0.3);
    ctx.lineTo(s * 0.5, s);
    ctx.lineTo(s, -s);
  }
  
  ctx.stroke();
  ctx.restore();
}

function drawCircle(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
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

function drawLollipop(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const s = layer.size;
  // Stem
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.lineTo(0, -s * 0.2);
  ctx.stroke();
  
  // Circle
  ctx.beginPath();
  ctx.arc(0, -s * 0.5, s * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCircleTail(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const s = layer.size;
  // Circle
  ctx.beginPath();
  ctx.arc(0, -s * 0.3, s * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  
  // Diagonal tail
  ctx.beginPath();
  ctx.moveTo(s * 0.35, s * 0.1);
  ctx.lineTo(s * 0.7, s * 0.8);
  ctx.stroke();
  ctx.restore();
}

function drawLollipopKick(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const s = layer.size;
  // Stem
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.lineTo(0, -s * 0.2);
  ctx.stroke();
  
  // Circle
  ctx.beginPath();
  ctx.arc(0, -s * 0.5, s * 0.4, 0, Math.PI * 2);
  ctx.stroke();
  
  // Kick leg
  ctx.beginPath();
  ctx.moveTo(0, s * 0.5);
  ctx.lineTo(s * 0.6, s);
  ctx.stroke();
  ctx.restore();
}

function drawWave(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  const variant = layer.variant || 1;
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const s = layer.size;
  const waves = variant === 1 ? 1 : 2;
  const amplitude = s * 0.4;
  
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  
  for (let x = -s; x <= s; x += 2) {
    const progress = (x + s) / (s * 2);
    const y = Math.sin(progress * Math.PI * 2 * waves) * amplitude;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawTau(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const s = layer.size;
  ctx.beginPath();
  // Horizontal top
  ctx.moveTo(-s, -s);
  ctx.lineTo(s, -s);
  // Vertical stem
  ctx.moveTo(0, -s);
  ctx.lineTo(0, s);
  ctx.stroke();
  ctx.restore();
}

function drawCup(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
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
  ctx.lineTo(-s, s * 0.5);
  ctx.quadraticCurveTo(-s, s, 0, s);
  ctx.quadraticCurveTo(s, s, s, s * 0.5);
  ctx.lineTo(s, -s);
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

function drawFork(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
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
  // Stem
  ctx.moveTo(0, s);
  ctx.lineTo(0, 0);
  // Left branch
  ctx.lineTo(-s * 0.6, -s);
  ctx.moveTo(0, 0);
  // Right branch
  ctx.lineTo(s * 0.6, -s);
  ctx.stroke();
  ctx.restore();
}

function drawEllipse(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.ellipse(0, 0, layer.size * 0.5, layer.size, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawLineDot(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const s = layer.size;
  // Vertical line
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(0, s * 0.5);
  ctx.stroke();
  
  // Dot at bottom
  ctx.beginPath();
  ctx.arc(0, s * 0.8, layer.strokeWidth * 1.2, 0, Math.PI * 2);
  ctx.fillStyle = lineColor;
  ctx.fill();
  ctx.restore();
}

function drawTripleArc(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  const s = layer.size;
  for (let i = 0; i < 3; i++) {
    const y = -s + i * s * 0.8;
    const arcSize = s * (0.6 + i * 0.15);
    ctx.beginPath();
    ctx.arc(0, y, arcSize, 0, Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFlag(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
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
  // Pole
  ctx.moveTo(-s * 0.5, -s);
  ctx.lineTo(-s * 0.5, s);
  // Flag top
  ctx.moveTo(-s * 0.5, -s);
  ctx.lineTo(s * 0.5, -s * 0.5);
  ctx.lineTo(-s * 0.5, 0);
  ctx.stroke();
  ctx.restore();
}

function drawAngle(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
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
  ctx.moveTo(-s, -s);
  ctx.lineTo(s, -s);
  ctx.lineTo(s, s);
  ctx.stroke();
  ctx.restore();
}

function drawDot(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.globalAlpha = layer.opacity;
  ctx.fillStyle = lineColor;
  
  ctx.beginPath();
  ctx.arc(layer.x, layer.y, layer.size * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawUnderscore(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(-layer.size, layer.size * 0.5);
  ctx.lineTo(layer.size, layer.size * 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawDash(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  ctx.save();
  ctx.translate(layer.x, layer.y);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.globalAlpha = layer.opacity;
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = layer.strokeWidth;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(-layer.size * 0.6, 0);
  ctx.lineTo(layer.size * 0.6, 0);
  ctx.stroke();
  ctx.restore();
}

// Main draw function that routes to specific shape drawers
function drawLayer(ctx: CanvasRenderingContext2D, layer: LayerElement, lineColor: string): void {
  switch (layer.type) {
    case 'triangle': drawTriangle(ctx, layer, lineColor); break;
    case 'triangle-down': drawTriangleDown(ctx, layer, lineColor); break;
    case 'concentric': drawConcentric(ctx, layer, lineColor); break;
    case 'arc': drawArc(ctx, layer, lineColor); break;
    case 'semicircle': drawSemicircle(ctx, layer, lineColor); break;
    case 'horizontal-lines': drawHorizontalLines(ctx, layer, lineColor); break;
    case 'spiral': drawSpiral(ctx, layer, lineColor); break;
    case 'cross-plus': drawCrossPlus(ctx, layer, lineColor); break;
    case 'vertical-line': drawVerticalLine(ctx, layer, lineColor); break;
    case 'hook': drawHook(ctx, layer, lineColor); break;
    case 'arrow-right': drawArrowRight(ctx, layer, lineColor); break;
    case 'arrow-down': drawArrowDown(ctx, layer, lineColor); break;
    case 'corner': drawCorner(ctx, layer, lineColor); break;
    case 'zigzag': drawZigzag(ctx, layer, lineColor); break;
    case 'circle': drawCircle(ctx, layer, lineColor); break;
    case 'lollipop': drawLollipop(ctx, layer, lineColor); break;
    case 'circle-tail': drawCircleTail(ctx, layer, lineColor); break;
    case 'lollipop-kick': drawLollipopKick(ctx, layer, lineColor); break;
    case 'wave': drawWave(ctx, layer, lineColor); break;
    case 'tau': drawTau(ctx, layer, lineColor); break;
    case 'cup': drawCup(ctx, layer, lineColor); break;
    case 'cross': drawCross(ctx, layer, lineColor); break;
    case 'fork': drawFork(ctx, layer, lineColor); break;
    case 'ellipse': drawEllipse(ctx, layer, lineColor); break;
    case 'line-dot': drawLineDot(ctx, layer, lineColor); break;
    case 'triple-arc': drawTripleArc(ctx, layer, lineColor); break;
    case 'flag': drawFlag(ctx, layer, lineColor); break;
    case 'angle': drawAngle(ctx, layer, lineColor); break;
    case 'dot': drawDot(ctx, layer, lineColor); break;
    case 'underscore': drawUnderscore(ctx, layer, lineColor); break;
    case 'dash': drawDash(ctx, layer, lineColor); break;
  }
}

// ==================== SVG GENERATION ====================

function layerToSVG(layer: LayerElement, lineColor: string, minStroke: number): string {
  const opacity = layer.opacity.toFixed(2);
  const sw = Math.max(minStroke, layer.strokeWidth).toFixed(1);
  const rot = layer.rotation;
  const s = layer.size;
  const x = layer.x;
  const y = layer.y;
  
  const transform = `transform="translate(${x.toFixed(1)}, ${y.toFixed(1)}) rotate(${rot.toFixed(1)})"`;
  const style = `fill="none" stroke="${lineColor}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"`;
  
  switch (layer.type) {
    case 'triangle': {
      const points = `0,${-s.toFixed(1)} ${(s * 0.866).toFixed(1)},${(s * 0.5).toFixed(1)} ${(-s * 0.866).toFixed(1)},${(s * 0.5).toFixed(1)}`;
      return `<polygon points="${points}" ${transform} ${style}/>`;
    }
    
    case 'triangle-down': {
      const points = `0,${s.toFixed(1)} ${(s * 0.866).toFixed(1)},${(-s * 0.5).toFixed(1)} ${(-s * 0.866).toFixed(1)},${(-s * 0.5).toFixed(1)}`;
      return `<polygon points="${points}" ${transform} ${style}/>`;
    }
    
    case 'concentric': {
      const rings = layer.variant || 2;
      let shapes = '';
      for (let i = 0; i < rings; i++) {
        const radius = s * (0.4 + (i / rings) * 0.6);
        shapes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(1)}" fill="none" stroke="${lineColor}" stroke-width="${sw}" opacity="${opacity}"/>`;
      }
      if (layer.variant === 4) {
        shapes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s * 0.15).toFixed(1)}" fill="${lineColor}" opacity="${opacity}"/>`;
      }
      return shapes;
    }
    
    case 'arc': {
      const arcPath = `M ${(Math.cos(-Math.PI * 0.3) * s).toFixed(1)} ${(Math.sin(-Math.PI * 0.3) * s).toFixed(1)} A ${s.toFixed(1)} ${s.toFixed(1)} 0 0 1 ${(Math.cos(Math.PI * 0.3) * s).toFixed(1)} ${(Math.sin(Math.PI * 0.3) * s).toFixed(1)}`;
      return `<path d="${arcPath}" ${transform} ${style}/>`;
    }
    
    case 'semicircle': {
      const semiPath = `M 0 ${(-s).toFixed(1)} A ${s.toFixed(1)} ${s.toFixed(1)} 0 0 1 0 ${s.toFixed(1)}`;
      return `<path d="${semiPath}" ${transform} ${style}/>`;
    }
    
    case 'horizontal-lines': {
      const lines = layer.variant || 2;
      let shapes = '';
      const spacing = s * 2 / (lines + 1);
      for (let i = 1; i <= lines; i++) {
        const ly = -s + i * spacing;
        shapes += `<line x1="${(-s * 0.8).toFixed(1)}" y1="${ly.toFixed(1)}" x2="${(s * 0.8).toFixed(1)}" y2="${ly.toFixed(1)}" ${transform} ${style}/>`;
      }
      return shapes;
    }
    
    case 'spiral': {
      const direction = layer.variant === 2 ? -1 : 1;
      const maxAngle = layer.variant === 3 ? Math.PI * 3 : Math.PI * 4;
      let path = '';
      for (let angle = 0; angle < maxAngle; angle += 0.1) {
        const radius = (angle / maxAngle) * s;
        const px = Math.cos(angle * direction) * radius;
        const py = Math.sin(angle * direction) * radius;
        path += (angle === 0 ? 'M' : 'L') + `${px.toFixed(1)},${py.toFixed(1)} `;
      }
      return `<path d="${path}" ${transform} ${style}/>`;
    }
    
    case 'cross-plus': {
      const strokeWidth = layer.variant === 2 ? (parseFloat(sw) * 1.5).toFixed(1) : sw;
      return `<g ${transform}><line x1="0" y1="${(-s).toFixed(1)}" x2="0" y2="${s.toFixed(1)}" fill="none" stroke="${lineColor}" stroke-width="${strokeWidth}" opacity="${opacity}" stroke-linecap="round"/><line x1="${(-s).toFixed(1)}" y1="0" x2="${s.toFixed(1)}" y2="0" fill="none" stroke="${lineColor}" stroke-width="${strokeWidth}" opacity="${opacity}" stroke-linecap="round"/></g>`;
    }
    
    case 'vertical-line':
      return `<line x1="0" y1="${(-s).toFixed(1)}" x2="0" y2="${s.toFixed(1)}" ${transform} ${style}/>`;
    
    case 'hook':
      return `<path d="M 0 ${(-s).toFixed(1)} L 0 ${(s * 0.3).toFixed(1)} Q 0 ${s.toFixed(1)} ${(s * 0.5).toFixed(1)} ${s.toFixed(1)}" ${transform} ${style}/>`;
    
    case 'arrow-right':
      return `<path d="M ${(-s).toFixed(1)} 0 L ${(s * 0.5).toFixed(1)} 0 L ${(s * 0.2).toFixed(1)} ${(-s * 0.4).toFixed(1)} M ${(s * 0.5).toFixed(1)} 0 L ${(s * 0.2).toFixed(1)} ${(s * 0.4).toFixed(1)}" ${transform} ${style}/>`;
    
    case 'arrow-down':
      return `<path d="M 0 ${(-s).toFixed(1)} L 0 ${(s * 0.5).toFixed(1)} L ${(-s * 0.4).toFixed(1)} ${(s * 0.2).toFixed(1)} M 0 ${(s * 0.5).toFixed(1)} L ${(s * 0.4).toFixed(1)} ${(s * 0.2).toFixed(1)}" ${transform} ${style}/>`;
    
    case 'corner':
      return `<path d="M ${(-s).toFixed(1)} ${(-s).toFixed(1)} L ${(-s).toFixed(1)} ${s.toFixed(1)} L ${s.toFixed(1)} ${s.toFixed(1)}" ${transform} ${style}/>`;
    
    case 'zigzag': {
      const variant = layer.variant || 1;
      let path = '';
      if (variant === 1) {
        path = `M ${(-s).toFixed(1)} ${(-s * 0.5).toFixed(1)} L ${s.toFixed(1)} ${(-s * 0.5).toFixed(1)} L ${(-s).toFixed(1)} ${(s * 0.5).toFixed(1)} L ${s.toFixed(1)} ${(s * 0.5).toFixed(1)}`;
      } else if (variant === 2) {
        path = `M ${(-s).toFixed(1)} ${s.toFixed(1)} L ${(-s).toFixed(1)} ${(-s).toFixed(1)} L ${s.toFixed(1)} ${s.toFixed(1)} L ${s.toFixed(1)} ${(-s).toFixed(1)}`;
      } else if (variant === 3) {
        path = `M ${(-s).toFixed(1)} ${s.toFixed(1)} L ${(-s * 0.5).toFixed(1)} ${(-s).toFixed(1)} L 0 ${(s * 0.3).toFixed(1)} L ${(s * 0.5).toFixed(1)} ${(-s).toFixed(1)} L ${s.toFixed(1)} ${s.toFixed(1)}`;
      } else if (variant === 4) {
        path = `M ${(-s).toFixed(1)} ${(-s).toFixed(1)} L ${(-s * 0.5).toFixed(1)} ${s.toFixed(1)} L 0 ${(-s * 0.3).toFixed(1)} L ${(s * 0.5).toFixed(1)} ${s.toFixed(1)} L ${s.toFixed(1)} ${(-s).toFixed(1)}`;
      }
      return `<path d="${path}" ${transform} ${style}/>`;
    }
    
    case 'circle':
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}" fill="none" stroke="${lineColor}" stroke-width="${sw}" opacity="${opacity}"/>`;
    
    case 'lollipop':
      return `<g ${transform}><line x1="0" y1="${s.toFixed(1)}" x2="0" y2="${(-s * 0.2).toFixed(1)}" ${style}/><circle cx="0" cy="${(-s * 0.5).toFixed(1)}" r="${(s * 0.4).toFixed(1)}" ${style}/></g>`;
    
    case 'circle-tail':
      return `<g ${transform}><circle cx="0" cy="${(-s * 0.3).toFixed(1)}" r="${(s * 0.5).toFixed(1)}" ${style}/><line x1="${(s * 0.35).toFixed(1)}" y1="${(s * 0.1).toFixed(1)}" x2="${(s * 0.7).toFixed(1)}" y2="${(s * 0.8).toFixed(1)}" ${style}/></g>`;
    
    case 'lollipop-kick':
      return `<g ${transform}><line x1="0" y1="${s.toFixed(1)}" x2="0" y2="${(-s * 0.2).toFixed(1)}" ${style}/><circle cx="0" cy="${(-s * 0.5).toFixed(1)}" r="${(s * 0.4).toFixed(1)}" ${style}/><line x1="0" y1="${(s * 0.5).toFixed(1)}" x2="${(s * 0.6).toFixed(1)}" y2="${s.toFixed(1)}" ${style}/></g>`;
    
    case 'wave': {
      const variant = layer.variant || 1;
      const waves = variant === 1 ? 1 : 2;
      const amplitude = s * 0.4;
      let path = `M ${(-s).toFixed(1)} 0 `;
      for (let px = -s; px <= s; px += 2) {
        const progress = (px + s) / (s * 2);
        const py = Math.sin(progress * Math.PI * 2 * waves) * amplitude;
        path += `L ${px.toFixed(1)} ${py.toFixed(1)} `;
      }
      return `<path d="${path}" ${transform} ${style}/>`;
    }
    
    case 'tau':
      return `<g ${transform}><line x1="${(-s).toFixed(1)}" y1="${(-s).toFixed(1)}" x2="${s.toFixed(1)}" y2="${(-s).toFixed(1)}" ${style}/><line x1="0" y1="${(-s).toFixed(1)}" x2="0" y2="${s.toFixed(1)}" ${style}/></g>`;
    
    case 'cup':
      return `<path d="M ${(-s).toFixed(1)} ${(-s).toFixed(1)} L ${(-s).toFixed(1)} ${(s * 0.5).toFixed(1)} Q ${(-s).toFixed(1)} ${s.toFixed(1)} 0 ${s.toFixed(1)} Q ${s.toFixed(1)} ${s.toFixed(1)} ${s.toFixed(1)} ${(s * 0.5).toFixed(1)} L ${s.toFixed(1)} ${(-s).toFixed(1)}" ${transform} ${style}/>`;
    
    case 'cross':
      return `<g ${transform}><line x1="${(-s).toFixed(1)}" y1="${(-s).toFixed(1)}" x2="${s.toFixed(1)}" y2="${s.toFixed(1)}" ${style}/><line x1="${s.toFixed(1)}" y1="${(-s).toFixed(1)}" x2="${(-s).toFixed(1)}" y2="${s.toFixed(1)}" ${style}/></g>`;
    
    case 'fork':
      return `<path d="M 0 ${s.toFixed(1)} L 0 0 L ${(-s * 0.6).toFixed(1)} ${(-s).toFixed(1)} M 0 0 L ${(s * 0.6).toFixed(1)} ${(-s).toFixed(1)}" ${transform} ${style}/>`;
    
    case 'ellipse':
      return `<ellipse cx="0" cy="0" rx="${(s * 0.5).toFixed(1)}" ry="${s.toFixed(1)}" ${transform} ${style}/>`;
    
    case 'line-dot':
      return `<g ${transform}><line x1="0" y1="${(-s).toFixed(1)}" x2="0" y2="${(s * 0.5).toFixed(1)}" ${style}/><circle cx="0" cy="${(s * 0.8).toFixed(1)}" r="${(parseFloat(sw) * 1.2).toFixed(1)}" fill="${lineColor}" opacity="${opacity}"/></g>`;
    
    case 'triple-arc': {
      let shapes = '';
      for (let i = 0; i < 3; i++) {
        const arcY = -s + i * s * 0.8;
        const arcSize = s * (0.6 + i * 0.15);
        const arcPath = `M ${(-arcSize).toFixed(1)} ${arcY.toFixed(1)} A ${arcSize.toFixed(1)} ${arcSize.toFixed(1)} 0 0 1 ${arcSize.toFixed(1)} ${arcY.toFixed(1)}`;
        shapes += `<path d="${arcPath}" ${transform} ${style}/>`;
      }
      return shapes;
    }
    
    case 'flag':
      return `<path d="M ${(-s * 0.5).toFixed(1)} ${(-s).toFixed(1)} L ${(-s * 0.5).toFixed(1)} ${s.toFixed(1)} M ${(-s * 0.5).toFixed(1)} ${(-s).toFixed(1)} L ${(s * 0.5).toFixed(1)} ${(-s * 0.5).toFixed(1)} L ${(-s * 0.5).toFixed(1)} 0" ${transform} ${style}/>`;
    
    case 'angle':
      return `<path d="M ${(-s).toFixed(1)} ${(-s).toFixed(1)} L ${s.toFixed(1)} ${(-s).toFixed(1)} L ${s.toFixed(1)} ${s.toFixed(1)}" ${transform} ${style}/>`;
    
    case 'dot':
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(s * 0.4).toFixed(1)}" fill="${lineColor}" opacity="${opacity}"/>`;
    
    case 'underscore':
      return `<line x1="${(-s).toFixed(1)}" y1="${(s * 0.5).toFixed(1)}" x2="${s.toFixed(1)}" y2="${(s * 0.5).toFixed(1)}" ${transform} ${style}/>`;
    
    case 'dash':
      return `<line x1="${(-s * 0.6).toFixed(1)}" y1="0" x2="${(s * 0.6).toFixed(1)}" y2="0" ${transform} ${style}/>`;
    
    default:
      return '';
  }
}

// ==================== PUBLIC API ====================

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
  const detailLevel = getDetailLevel(size);
  
  // Draw background based on type
  if (background === 'cosmos') {
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
    
    const starCount = detailLevel === 'full' ? (40 + Math.floor(bgRand() * 30)) :
                      detailLevel === 'medium' ? 20 : 10;
    for (let i = 0; i < starCount; i++) {
      const starX = bgRand() * size;
      const starY = bgRand() * size;
      const starSize = detailLevel === 'minimal' ? 0.5 : (0.3 + bgRand() * 0.8);
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
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  }
  
  // Draw first letter silhouette with crosshatch pattern
  const firstLetter = getFirstLetter(email);
  if (firstLetter) {
    const textX = size / 2;
    const textY = size / 2 + size * 0.02;
    const fontSize = size * 0.85;
    
    const lineSpacing = detailLevel === 'minimal' ? Math.max(6, size * 0.1) :
                        detailLevel === 'medium' ? Math.max(4, size * 0.04) :
                        Math.max(3, size * 0.025);
    const diagonal = size * 1.5;
    
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = size;
    maskCanvas.height = size;
    const maskCtx = maskCanvas.getContext('2d')!;
    maskCtx.font = `bold ${fontSize}px Arial, sans-serif`;
    maskCtx.textAlign = 'center';
    maskCtx.textBaseline = 'middle';
    maskCtx.fillStyle = 'white';
    maskCtx.fillText(firstLetter, textX, textY);
    
    const crosshatchCanvas = document.createElement('canvas');
    crosshatchCanvas.width = size;
    crosshatchCanvas.height = size;
    const crossCtx = crosshatchCanvas.getContext('2d')!;
    
    const crosshatchStroke = detailLevel === 'minimal' ? Math.max(2, size * 0.03) :
                             detailLevel === 'medium' ? Math.max(1.5, size * 0.015) :
                             Math.max(1.5, size * 0.012);
    crossCtx.strokeStyle = lineColor;
    crossCtx.lineWidth = crosshatchStroke;
    crossCtx.lineCap = 'round';
    
    for (let i = -diagonal; i < diagonal; i += lineSpacing) {
      crossCtx.beginPath();
      crossCtx.moveTo(i, 0);
      crossCtx.lineTo(i + size, size);
      crossCtx.stroke();
    }
    
    if (detailLevel !== 'minimal') {
      for (let i = -diagonal; i < diagonal; i += lineSpacing) {
        crossCtx.beginPath();
        crossCtx.moveTo(size - i, 0);
        crossCtx.lineTo(-i, size);
        crossCtx.stroke();
      }
    }
    
    crossCtx.globalCompositeOperation = 'destination-in';
    crossCtx.drawImage(maskCanvas, 0, 0);
    
    const baseFillOpacity = detailLevel === 'minimal' ? 0.2 : 
                            detailLevel === 'medium' ? 0.15 : 0.12;
    ctx.save();
    ctx.globalAlpha = baseFillOpacity;
    ctx.fillStyle = lineColor;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(firstLetter, textX, textY);
    ctx.restore();
    
    const crosshatchOpacity = detailLevel === 'minimal' ? 0.35 :
                              detailLevel === 'medium' ? 0.3 : 0.28;
    ctx.save();
    ctx.globalAlpha = crosshatchOpacity;
    ctx.drawImage(crosshatchCanvas, 0, 0);
    ctx.restore();
    
    const borderOpacity = detailLevel === 'minimal' ? 0.35 :
                          detailLevel === 'medium' ? 0.25 : 0.2;
    const borderWidth = detailLevel === 'minimal' ? Math.max(2.5, size * 0.04) :
                        detailLevel === 'medium' ? Math.max(2, size * 0.02) :
                        Math.max(1.5, size * 0.015);
    ctx.save();
    ctx.globalAlpha = borderOpacity;
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = borderWidth;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(firstLetter, textX, textY);
    ctx.restore();
  }
  
  // Generate and draw layers from email characters
  const layers = generateLayers(email, size, shape);
  layers.forEach(layer => drawLayer(ctx, layer, lineColor));
  
  // Shape mask
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  if (shape === 'circle') {
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  } else if (shape === 'triangle') {
    ctx.moveTo(size / 2, 0);
    ctx.lineTo(size, size);
    ctx.lineTo(0, size);
    ctx.closePath();
  } else {
    const radius = size * 0.15;
    ctx.roundRect(0, 0, size, size, radius);
  }
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  
  return canvas;
}

export function generateAvatarDataURL(
  email: string, 
  size: number = 256, 
  background: BackgroundType = 'cosmos', 
  shape: AvatarShape = 'rounded',
  format: ImageFormat = 'png',
  quality: number = 0.92
): string {
  const canvas = generateAvatarCanvas(email, size, background, shape);
  const mimeType = format === 'webp' ? 'image/webp' : format === 'jpeg' ? 'image/jpeg' : 'image/png';
  return canvas.toDataURL(mimeType, quality);
}

export function generateAvatarSVG(email: string, size: number = 256, background: BackgroundType = 'cosmos', shape: AvatarShape = 'rounded'): string {
  const hash = hashString(email);
  const rand = seededRandom(hash);
  const lineColor = getLineColor(background);
  const detailLevel = getDetailLevel(size);
  const minStroke = getMinStrokeWidth(size);
  
  let shapes = '';
  let bgDefs = '';
  let bgRect = '';
  
  // Background
  if (background === 'cosmos') {
    bgDefs = `
      <radialGradient id="bgGrad" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:#1a1a2e"/>
        <stop offset="40%" style="stop-color:#16213e"/>
        <stop offset="70%" style="stop-color:#0f0f23"/>
        <stop offset="100%" style="stop-color:#0a0a15"/>
      </radialGradient>`;
    bgRect = `<rect width="${size}" height="${size}" fill="url(#bgGrad)"/>`;
    
    const bgRand = seededRandom(hash + 999);
    const starCount = detailLevel === 'full' ? (40 + Math.floor(bgRand() * 30)) :
                      detailLevel === 'medium' ? 20 : 10;
    for (let i = 0; i < starCount; i++) {
      const starX = bgRand() * size;
      const starY = bgRand() * size;
      const starSize = detailLevel === 'minimal' ? 0.5 : (0.3 + bgRand() * 0.8);
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
  
  // First letter silhouette with crosshatch
  const firstLetter = getFirstLetter(email);
  if (firstLetter) {
    const lineSpacing = detailLevel === 'minimal' ? Math.max(6, size * 0.1) :
                        detailLevel === 'medium' ? Math.max(4, size * 0.04) :
                        Math.max(4, size * 0.035);
    const clipId = `letterClip-${Math.random().toString(36).substr(2, 9)}`;
    
    bgDefs += `
      <clipPath id="${clipId}">
        <text x="${size / 2}" y="${size / 2}" dy="0.35em" font-family="Arial, sans-serif" font-size="${size * 0.85}" font-weight="bold" text-anchor="middle">${firstLetter}</text>
      </clipPath>`;
    
    const baseFillOpacity = detailLevel === 'minimal' ? 0.2 : 
                            detailLevel === 'medium' ? 0.15 : 0.10;
    shapes += `<text x="${size / 2}" y="${size / 2}" dy="0.35em" font-family="Arial, sans-serif" font-size="${size * 0.85}" font-weight="bold" fill="${lineColor}" opacity="${baseFillOpacity}" text-anchor="middle">${firstLetter}</text>`;
    
    let crosshatchLines = '';
    const diagonal = size * 1.5;
    const crosshatchStroke = detailLevel === 'minimal' ? Math.max(2, size * 0.03) :
                             detailLevel === 'medium' ? Math.max(1.5, size * 0.012) :
                             Math.max(1, size * 0.006);
    
    for (let i = -diagonal; i < diagonal; i += lineSpacing) {
      crosshatchLines += `<line x1="${i}" y1="0" x2="${i + size}" y2="${size}" stroke="${lineColor}" stroke-width="${crosshatchStroke}" stroke-linecap="round"/>`;
    }
    
    if (detailLevel !== 'minimal') {
      for (let i = -diagonal; i < diagonal; i += lineSpacing) {
        crosshatchLines += `<line x1="${size - i}" y1="0" x2="${-i}" y2="${size}" stroke="${lineColor}" stroke-width="${crosshatchStroke}" stroke-linecap="round"/>`;
      }
    }
    
    const crosshatchOpacity = detailLevel === 'minimal' ? 0.35 :
                              detailLevel === 'medium' ? 0.2 : 0.15;
    shapes += `<g clip-path="url(#${clipId})" opacity="${crosshatchOpacity}">${crosshatchLines}</g>`;
    
    const borderOpacity = detailLevel === 'minimal' ? 0.35 :
                          detailLevel === 'medium' ? 0.18 : 0.12;
    const borderWidth = detailLevel === 'minimal' ? Math.max(2.5, size * 0.04) :
                        detailLevel === 'medium' ? Math.max(2, size * 0.018) :
                        size * 0.012;
    shapes += `<text x="${size / 2}" y="${size / 2}" dy="0.35em" font-family="Arial, sans-serif" font-size="${size * 0.85}" font-weight="bold" fill="none" stroke="${lineColor}" stroke-width="${borderWidth}" opacity="${borderOpacity}" text-anchor="middle">${firstLetter}</text>`;
  }
  
  // Generate layers from email characters and convert to SVG
  const layers = generateLayers(email, size, shape);
  layers.forEach(layer => {
    shapes += layerToSVG(layer, lineColor, minStroke);
  });
  
  // Clip path based on shape
  const clipPathDef = shape === 'circle'
    ? `<circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/>`
    : shape === 'triangle'
    ? `<polygon points="${size / 2},0 ${size},${size} 0,${size}"/>`
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
