import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShapeIcon } from "@/components/ShapeIcon";
import { CHARACTER_SHAPE_MAP, verifyUniqueShapes, ShapeDefinition } from "@/lib/characterShapes";

const CharacterMapping = () => {
  const verification = verifyUniqueShapes();
  
  // Group characters by category
  const letters = Object.values(CHARACTER_SHAPE_MAP).filter(s => /[A-Z]/.test(s.char));
  const numbers = Object.values(CHARACTER_SHAPE_MAP).filter(s => /[0-9]/.test(s.char));
  const special = Object.values(CHARACTER_SHAPE_MAP).filter(s => /[@._\-+]/.test(s.char));

  const CharacterCard = ({ shape, index }: { shape: ShapeDefinition; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="flex flex-col items-center p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors group"
    >
      <span className="text-2xl font-mono font-bold text-primary mb-2">{shape.char}</span>
      <div className="w-16 h-16 flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
        <ShapeIcon shape={shape} size={48} />
      </div>
      <span className="text-sm font-medium mt-2">{shape.label}</span>
      <span className="text-xs text-muted-foreground text-center mt-1">{shape.description}</span>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Generator
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold font-display mb-4">
              Character <span className="gradient-text">Shape Mapping</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
              Every character in your email address maps to a unique shape. This deterministic mapping ensures 
              the same email always generates the same avatar.
            </p>
            
            {/* Verification Status */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
              verification.isUnique 
                ? 'bg-green-500/10 text-green-500 border border-green-500/30' 
                : 'bg-destructive/10 text-destructive border border-destructive/30'
            }`}>
              {verification.isUnique ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">All {Object.keys(CHARACTER_SHAPE_MAP).length} characters have unique shapes</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Duplicate shapes detected!</span>
                </>
              )}
            </div>
            
            {!verification.isUnique && verification.duplicates.length > 0 && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg text-left max-w-md mx-auto">
                <p className="text-sm text-destructive font-medium mb-2">Duplicates:</p>
                <ul className="text-sm text-destructive/80">
                  {verification.duplicates.map((dup, i) => (
                    <li key={i}>{dup}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Letters Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono">A</span>
              Letters (A-Z)
              <span className="text-sm font-normal text-muted-foreground ml-2">{letters.length} shapes</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-4">
              {letters.map((shape, index) => (
                <CharacterCard key={shape.char} shape={shape} index={index} />
              ))}
            </div>
          </section>

          {/* Numbers Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center font-mono">0</span>
              Numbers (0-9)
              <span className="text-sm font-normal text-muted-foreground ml-2">{numbers.length} shapes</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-4">
              {numbers.map((shape, index) => (
                <CharacterCard key={shape.char} shape={shape} index={index} />
              ))}
            </div>
          </section>

          {/* Special Characters Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold font-display mb-6 flex items-center gap-3">
              <span className="w-10 h-10 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-mono">@</span>
              Special Characters
              <span className="text-sm font-normal text-muted-foreground ml-2">{special.length} shapes</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {special.map((shape, index) => (
                <CharacterCard key={shape.char} shape={shape} index={index} />
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section className="p-8 bg-card rounded-2xl border border-border">
            <h2 className="text-2xl font-bold font-display mb-4">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">1</div>
                <h3 className="font-semibold">Parse Email</h3>
                <p className="text-sm text-muted-foreground">
                  The email address is converted to uppercase and each valid character is extracted.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">2</div>
                <h3 className="font-semibold">Map to Shapes</h3>
                <p className="text-sm text-muted-foreground">
                  Each character is mapped to its unique shape type and variant from the table above.
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold">3</div>
                <h3 className="font-semibold">Compose Avatar</h3>
                <p className="text-sm text-muted-foreground">
                  Shapes are positioned using a deterministic algorithm based on the email's hash value.
                </p>
              </div>
            </div>
          </section>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container text-center">
          <Link to="/">
            <Button variant="hero">
              Try the Generator
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default CharacterMapping;
