import { processEmail } from "@/lib/avatarGenerator";
import { motion } from "framer-motion";

interface CharacterBreakdownProps {
  email: string;
}

// Mini SVG icons for each element type
const ElementIcon = ({ type }: { type: string }) => {
  const iconProps = { 
    className: "w-6 h-6", 
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (type) {
    case 'line-circle':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
    case 'concentric':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case 'spiral':
      return (
        <svg {...iconProps}>
          <path d="M12 12 C12 8, 16 8, 16 12 C16 18, 6 18, 6 12 C6 4, 20 4, 20 12" />
        </svg>
      );
    case 'triangle':
      return (
        <svg {...iconProps}>
          <polygon points="12,4 20,18 4,18" fill="none" />
        </svg>
      );
    case 'cross':
      return (
        <svg {...iconProps}>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      );
    case 'dots':
      return (
        <svg {...iconProps}>
          <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
          <circle cx="16" cy="8" r="2" fill="currentColor" stroke="none" />
          <circle cx="12" cy="16" r="2" fill="currentColor" stroke="none" />
          <line x1="8" y1="8" x2="16" y2="8" strokeWidth="1" />
          <line x1="16" y1="8" x2="12" y2="16" strokeWidth="1" />
        </svg>
      );
    case 'wavy-line':
      return (
        <svg {...iconProps}>
          <path d="M4 12 Q8 6, 12 12 Q16 18, 20 12" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
};

export const CharacterBreakdown = ({ email }: CharacterBreakdownProps) => {
  const elements = processEmail(email);
  
  if (!email) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
        Character Mapping
      </h3>
      <div className="flex flex-wrap gap-2">
        {elements.slice(0, 20).map((element, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="flex flex-col items-center gap-1 p-2 bg-muted rounded-lg border border-border/50"
          >
            <span className="font-mono text-xs text-muted-foreground">{element.char}</span>
            <div className="w-6 h-6 text-foreground flex items-center justify-center">
              <ElementIcon type={element.shape} />
            </div>
            <span className="text-[10px] text-muted-foreground capitalize">{element.shape.replace('-', ' ')}</span>
          </motion.div>
        ))}
        {elements.length > 20 && (
          <div className="flex items-center px-3 text-muted-foreground text-sm">
            +{elements.length - 20} more
          </div>
        )}
      </div>
    </div>
  );
};
