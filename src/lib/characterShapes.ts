// Unique shape definition for each character
// Each character maps to a unique shape type + variant combination

export interface ShapeDefinition {
  char: string;
  type: string;
  variant: number;
  label: string;
  description: string;
}

// All supported characters and their unique shapes
export const CHARACTER_SHAPE_MAP: Record<string, ShapeDefinition> = {
  // Letters A-Z (26 unique shapes)
  'A': { char: 'A', type: 'triangle', variant: 1, label: 'Triangle Up', description: 'Upward pointing triangle' },
  'B': { char: 'B', type: 'concentric', variant: 2, label: 'Double Ring', description: 'Two concentric circles' },
  'C': { char: 'C', type: 'arc', variant: 1, label: 'Open Arc', description: 'Open curved arc' },
  'D': { char: 'D', type: 'semicircle', variant: 1, label: 'Half Moon', description: 'Right-facing semicircle' },
  'E': { char: 'E', type: 'horizontal-lines', variant: 3, label: 'Triple Lines', description: 'Three horizontal lines' },
  'F': { char: 'F', type: 'horizontal-lines', variant: 2, label: 'Double Lines', description: 'Two horizontal lines' },
  'G': { char: 'G', type: 'spiral', variant: 1, label: 'Spiral CW', description: 'Clockwise spiral' },
  'H': { char: 'H', type: 'cross-plus', variant: 1, label: 'Plus', description: 'Plus sign cross' },
  'I': { char: 'I', type: 'vertical-line', variant: 1, label: 'Pillar', description: 'Single vertical line' },
  'J': { char: 'J', type: 'hook', variant: 1, label: 'Hook', description: 'Curved hook shape' },
  'K': { char: 'K', type: 'arrow-right', variant: 1, label: 'Arrow Right', description: 'Right pointing arrow' },
  'L': { char: 'L', type: 'corner', variant: 1, label: 'Corner', description: 'Right angle corner' },
  'M': { char: 'M', type: 'zigzag', variant: 3, label: 'Mountain', description: 'Mountain peaks zigzag' },
  'N': { char: 'N', type: 'zigzag', variant: 2, label: 'Wave Peak', description: 'Single wave peak' },
  'O': { char: 'O', type: 'circle', variant: 1, label: 'Circle', description: 'Simple circle' },
  'P': { char: 'P', type: 'lollipop', variant: 1, label: 'Lollipop', description: 'Circle on a stem' },
  'Q': { char: 'Q', type: 'circle-tail', variant: 1, label: 'Circle Tail', description: 'Circle with diagonal tail' },
  'R': { char: 'R', type: 'lollipop-kick', variant: 1, label: 'Lollipop Kick', description: 'Lollipop with leg' },
  'S': { char: 'S', type: 'wave', variant: 2, label: 'Snake', description: 'S-shaped wave' },
  'T': { char: 'T', type: 'tau', variant: 1, label: 'Tau', description: 'T-shaped tau' },
  'U': { char: 'U', type: 'cup', variant: 1, label: 'Cup', description: 'U-shaped cup' },
  'V': { char: 'V', type: 'triangle-down', variant: 1, label: 'Triangle Down', description: 'Downward pointing triangle' },
  'W': { char: 'W', type: 'zigzag', variant: 4, label: 'Double Valley', description: 'Double valley zigzag' },
  'X': { char: 'X', type: 'cross', variant: 1, label: 'Cross X', description: 'Diagonal cross' },
  'Y': { char: 'Y', type: 'fork', variant: 1, label: 'Fork', description: 'Y-shaped fork' },
  'Z': { char: 'Z', type: 'zigzag', variant: 1, label: 'Zag', description: 'Z-shaped zigzag' },
  
  // Numbers 0-9 (10 unique shapes)
  '0': { char: '0', type: 'ellipse', variant: 1, label: 'Ellipse', description: 'Vertical ellipse' },
  '1': { char: '1', type: 'line-dot', variant: 1, label: 'Line & Dot', description: 'Vertical line with dot' },
  '2': { char: '2', type: 'wave', variant: 1, label: 'Gentle Wave', description: 'Gentle wave curve' },
  '3': { char: '3', type: 'triple-arc', variant: 1, label: 'Triple Arc', description: 'Three stacked arcs' },
  '4': { char: '4', type: 'arrow-down', variant: 1, label: 'Arrow Down', description: 'Downward arrow' },
  '5': { char: '5', type: 'flag', variant: 1, label: 'Flag', description: 'Flag shape' },
  '6': { char: '6', type: 'spiral', variant: 2, label: 'Spiral CCW', description: 'Counter-clockwise spiral' },
  '7': { char: '7', type: 'angle', variant: 1, label: 'Angle', description: 'Right angle' },
  '8': { char: '8', type: 'concentric', variant: 3, label: 'Triple Ring', description: 'Three concentric circles' },
  '9': { char: '9', type: 'spiral', variant: 3, label: 'Reverse Spiral', description: 'Inverted spiral' },
  
  // Special characters (5 unique shapes)
  '@': { char: '@', type: 'concentric', variant: 4, label: 'At Ring', description: 'Ring with center dot' },
  '.': { char: '.', type: 'dot', variant: 1, label: 'Dot', description: 'Single dot' },
  '_': { char: '_', type: 'underscore', variant: 1, label: 'Base', description: 'Horizontal base line' },
  '-': { char: '-', type: 'dash', variant: 1, label: 'Dash', description: 'Horizontal dash' },
  '+': { char: '+', type: 'cross-plus', variant: 2, label: 'Plus Bold', description: 'Bold plus sign' },
};

// Get all unique characters
export const ALL_CHARACTERS = Object.keys(CHARACTER_SHAPE_MAP);

// Get shape for a character (with fallback)
export function getShapeForCharacter(char: string): ShapeDefinition {
  const upperChar = char.toUpperCase();
  return CHARACTER_SHAPE_MAP[upperChar] || {
    char: upperChar,
    type: 'dot',
    variant: 1,
    label: 'Unknown',
    description: 'Fallback shape'
  };
}

// Verify all characters are unique
export function verifyUniqueShapes(): { isUnique: boolean; duplicates: string[] } {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];
  
  for (const [char, shape] of Object.entries(CHARACTER_SHAPE_MAP)) {
    const key = `${shape.type}-${shape.variant}`;
    if (seen.has(key)) {
      duplicates.push(`${char} and ${seen.get(key)} both use ${key}`);
    } else {
      seen.set(key, char);
    }
  }
  
  return {
    isUnique: duplicates.length === 0,
    duplicates
  };
}
