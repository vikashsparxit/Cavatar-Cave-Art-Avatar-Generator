import { processEmail } from "@/lib/avatarGenerator";
import { motion } from "framer-motion";

interface CharacterBreakdownProps {
  email: string;
}

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
            className="flex flex-col items-center gap-1 p-2 bg-card/50 rounded-lg border border-border/50"
          >
            <span className="font-mono text-xs text-muted-foreground">{element.char}</span>
            <div
              className="w-6 h-6 rounded"
              style={{ backgroundColor: element.color }}
            />
            <span className="text-[10px] text-muted-foreground capitalize">{element.shape}</span>
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
