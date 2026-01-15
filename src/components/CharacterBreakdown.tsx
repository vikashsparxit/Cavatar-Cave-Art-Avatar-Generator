import { getShapeForCharacter } from "@/lib/characterShapes";
import { ShapeIcon } from "@/components/ShapeIcon";
import { motion } from "framer-motion";

interface CharacterBreakdownProps {
  email: string;
}

export const CharacterBreakdown = ({ email }: CharacterBreakdownProps) => {
  const chars = email.toUpperCase().replace(/[^A-Z0-9@._\-+]/g, '').split('');
  const elements = chars.map(char => getShapeForCharacter(char));
  
  if (!email) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
        Character Mapping
      </h3>
      <div className="flex flex-wrap gap-2">
        {elements.slice(0, 16).map((element, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className="flex flex-col items-center gap-1 p-2 bg-muted rounded-lg border border-border/50"
          >
            <span className="font-mono text-xs text-muted-foreground">{element.char}</span>
            <div className="w-8 h-8 text-foreground flex items-center justify-center">
              <ShapeIcon shape={element} size={32} />
            </div>
            <span className="text-[9px] text-muted-foreground text-center leading-tight max-w-[60px] truncate">
              {element.label}
            </span>
          </motion.div>
        ))}
        {elements.length > 16 && (
          <div className="flex items-center px-3 text-muted-foreground text-sm">
            +{elements.length - 16} more
          </div>
        )}
      </div>
    </div>
  );
};
