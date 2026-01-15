import { ShapeDefinition } from "@/lib/characterShapes";

interface ShapeIconProps {
  shape: ShapeDefinition;
  size?: number;
  className?: string;
}

export const ShapeIcon = ({ shape, size = 48, className = "" }: ShapeIconProps) => {
  const strokeWidth = 2;
  const iconProps = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  const renderShape = () => {
    switch (shape.type) {
      case 'triangle':
        return <polygon points="24,8 40,38 8,38" />;
      
      case 'triangle-down':
        return <polygon points="24,40 8,10 40,10" />;
      
      case 'concentric':
        if (shape.variant === 2) {
          return (
            <>
              <circle cx="24" cy="24" r="16" />
              <circle cx="24" cy="24" r="8" />
            </>
          );
        } else if (shape.variant === 3) {
          return (
            <>
              <circle cx="24" cy="24" r="18" />
              <circle cx="24" cy="24" r="11" />
              <circle cx="24" cy="24" r="4" />
            </>
          );
        } else if (shape.variant === 4) {
          return (
            <>
              <circle cx="24" cy="24" r="16" />
              <circle cx="24" cy="24" r="3" fill="currentColor" />
            </>
          );
        }
        return <circle cx="24" cy="24" r="16" />;
      
      case 'arc':
        return <path d="M12 32 Q24 8, 36 32" />;
      
      case 'semicircle':
        return <path d="M12 24 A12 12 0 0 1 36 24" />;
      
      case 'horizontal-lines':
        if (shape.variant === 3) {
          return (
            <>
              <line x1="10" y1="14" x2="38" y2="14" />
              <line x1="10" y1="24" x2="38" y2="24" />
              <line x1="10" y1="34" x2="38" y2="34" />
            </>
          );
        } else {
          return (
            <>
              <line x1="10" y1="18" x2="38" y2="18" />
              <line x1="10" y1="30" x2="38" y2="30" />
            </>
          );
        }
      
      case 'spiral':
        if (shape.variant === 2) {
          return <path d="M24 24 C24 20, 20 20, 20 24 C20 30, 30 30, 30 24 C30 16, 16 16, 16 24 C16 34, 34 34, 34 24" />;
        } else if (shape.variant === 3) {
          return <path d="M24 24 C24 28, 28 28, 28 24 C28 18, 18 18, 18 24 C18 32, 32 32, 32 24" />;
        }
        return <path d="M24 24 C24 20, 28 20, 28 24 C28 30, 18 30, 18 24 C18 16, 32 16, 32 24 C32 34, 14 34, 14 24" />;
      
      case 'cross-plus':
        if (shape.variant === 2) {
          return (
            <>
              <line x1="24" y1="8" x2="24" y2="40" strokeWidth={3} />
              <line x1="8" y1="24" x2="40" y2="24" strokeWidth={3} />
            </>
          );
        }
        return (
          <>
            <line x1="24" y1="10" x2="24" y2="38" />
            <line x1="10" y1="24" x2="38" y2="24" />
          </>
        );
      
      case 'vertical-line':
        return <line x1="24" y1="8" x2="24" y2="40" />;
      
      case 'hook':
        return <path d="M20 10 L20 30 Q20 38, 28 38 Q36 38, 36 30" />;
      
      case 'arrow-right':
        return (
          <>
            <line x1="10" y1="24" x2="38" y2="24" />
            <polyline points="28,14 38,24 28,34" />
          </>
        );
      
      case 'arrow-down':
        return (
          <>
            <line x1="24" y1="10" x2="24" y2="38" />
            <polyline points="14,28 24,38 34,28" />
          </>
        );
      
      case 'corner':
        return <polyline points="10,10 10,38 38,38" />;
      
      case 'zigzag':
        if (shape.variant === 1) {
          return <polyline points="10,10 38,38 10,38" />;
        } else if (shape.variant === 2) {
          return <polyline points="10,32 24,12 38,32" />;
        } else if (shape.variant === 3) {
          return <polyline points="8,32 16,12 24,32 32,12 40,32" />;
        } else {
          return <polyline points="8,12 16,32 24,12 32,32 40,12" />;
        }
      
      case 'circle':
        return <circle cx="24" cy="24" r="14" />;
      
      case 'lollipop':
        return (
          <>
            <circle cx="24" cy="16" r="10" />
            <line x1="24" y1="26" x2="24" y2="42" />
          </>
        );
      
      case 'circle-tail':
        return (
          <>
            <circle cx="24" cy="20" r="12" />
            <line x1="32" y1="28" x2="40" y2="40" />
          </>
        );
      
      case 'lollipop-kick':
        return (
          <>
            <circle cx="20" cy="16" r="10" />
            <line x1="20" y1="26" x2="20" y2="38" />
            <line x1="20" y1="32" x2="34" y2="40" />
          </>
        );
      
      case 'wave':
        if (shape.variant === 2) {
          return <path d="M10 16 Q18 8, 24 24 Q30 40, 38 32" />;
        }
        return <path d="M10 24 Q18 10, 24 24 Q30 38, 38 24" />;
      
      case 'tau':
        return (
          <>
            <line x1="10" y1="12" x2="38" y2="12" />
            <line x1="24" y1="12" x2="24" y2="40" />
          </>
        );
      
      case 'cup':
        return <path d="M12 10 L12 28 Q12 40, 24 40 Q36 40, 36 28 L36 10" />;
      
      case 'cross':
        return (
          <>
            <line x1="10" y1="10" x2="38" y2="38" />
            <line x1="38" y1="10" x2="10" y2="38" />
          </>
        );
      
      case 'fork':
        return (
          <>
            <line x1="10" y1="10" x2="24" y2="24" />
            <line x1="38" y1="10" x2="24" y2="24" />
            <line x1="24" y1="24" x2="24" y2="40" />
          </>
        );
      
      case 'ellipse':
        return <ellipse cx="24" cy="24" rx="10" ry="16" />;
      
      case 'line-dot':
        return (
          <>
            <line x1="24" y1="16" x2="24" y2="40" />
            <circle cx="24" cy="10" r="3" fill="currentColor" />
          </>
        );
      
      case 'triple-arc':
        return (
          <>
            <path d="M14 14 Q24 8, 34 14" />
            <path d="M14 24 Q24 18, 34 24" />
            <path d="M14 34 Q24 28, 34 34" />
          </>
        );
      
      case 'flag':
        return (
          <>
            <line x1="14" y1="10" x2="14" y2="40" />
            <path d="M14 10 L34 10 L34 24 L14 24" />
          </>
        );
      
      case 'angle':
        return <polyline points="10,12 10,12 38,12 10,40" />;
      
      case 'dot':
        return <circle cx="24" cy="24" r="4" fill="currentColor" />;
      
      case 'underscore':
        return <line x1="8" y1="36" x2="40" y2="36" />;
      
      case 'dash':
        return <line x1="12" y1="24" x2="36" y2="24" />;
      
      default:
        return <circle cx="24" cy="24" r="8" />;
    }
  };

  return (
    <svg {...iconProps}>
      {renderShape()}
    </svg>
  );
};
