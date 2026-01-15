import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Download, Copy, Check, Sparkles, Code2, Zap, Palette, AlertCircle, FileImage, FileCode, BookOpen, Circle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarPreview } from "@/components/AvatarPreview";
import { CharacterBreakdown } from "@/components/CharacterBreakdown";
import { CodeExample } from "@/components/CodeExample";
import { CavatarLogo } from "@/components/CavatarLogo";
import { generateAvatarDataURL, generateAvatarSVG, BackgroundType, AvatarShape, isValidEmail } from "@/lib/avatarGenerator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Publicly known email addresses of famous tech leaders
const CELEBRITY_EMAILS = [
  { email: "elon@tesla.com", name: "Elon Musk" },
  { email: "tcook@apple.com", name: "Tim Cook" },
  { email: "zuck@fb.com", name: "Mark Zuckerberg" },
  { email: "sundar@google.com", name: "Sundar Pichai" },
  { email: "jeff@amazon.com", name: "Jeff Bezos" },
  { email: "satyan@microsoft.com", name: "Satya Nadella" },
  { email: "sjobs@apple.com", name: "Steve Jobs" },
  { email: "billg@microsoft.com", name: "Bill Gates" },
];

type BackgroundOption = 'cosmos' | 'white' | 'custom';
type SizeOption = 128 | 256 | 512;

const Index = () => {
  const [email, setEmail] = useState("vikashshingh@gmail.com");
  const [copied, setCopied] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const [bgOption, setBgOption] = useState<BackgroundOption>('cosmos');
  const [customColor, setCustomColor] = useState('#6366f1');
  const [selectedSize, setSelectedSize] = useState<SizeOption>(256);
  const [selectedShape, setSelectedShape] = useState<AvatarShape>('rounded');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Validate email when it changes
  useEffect(() => {
    if (email && !isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError(null);
    }
  }, [email]);

  // Get the actual background value to pass to avatar generator
  const getBackground = (): BackgroundType => {
    if (bgOption === 'custom') return customColor;
    return bgOption;
  };

  // Rotate celebrity avatars
  useEffect(() => {
    const interval = setInterval(() => {
      setDemoIndex((prev) => (prev + 1) % CELEBRITY_EMAILS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadPNG = () => {
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    const dataUrl = generateAvatarDataURL(email, selectedSize, getBackground(), selectedShape);
    const link = document.createElement("a");
    link.download = `avatar-${email.split("@")[0]}-${selectedSize}px.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadSVG = () => {
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    const svgContent = generateAvatarSVG(email, selectedSize, getBackground(), selectedShape);
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `avatar-${email.split("@")[0]}-${selectedSize}px.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyUrl = async () => {
    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    const bgParam = bgOption === 'custom' ? encodeURIComponent(customColor) : bgOption;
    const url = `https://api.avatargen.io/v1/avatar?email=${encodeURIComponent(email)}&size=${selectedSize}&background=${bgParam}&shape=${selectedShape}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bgParam = bgOption === 'custom' ? customColor : bgOption;
  const curlExample = `curl "https://api.avatargen.io/v1/avatar?email=${email}&size=${selectedSize}&format=png&background=${bgParam}&shape=${selectedShape}" -o avatar.png`;

  const jsExample = `const email = '${email}';
const avatarUrl = \`https://api.avatargen.io/v1/avatar?email=\${encodeURIComponent(email)}&size=${selectedSize}&background=${bgParam}&shape=${selectedShape}\`;

// Use in img tag
<img src={avatarUrl} alt="User Avatar" />`;

  const pythonExample = `import requests

email = '${email}'
url = f'https://api.avatargen.io/v1/avatar?email={email}&size=${selectedSize}&format=png&background=${bgParam}&shape=${selectedShape}'
response = requests.get(url)

with open('avatar.png', 'wb') as f:
    f.write(response.content)`;

  const isEmailValid = isValidEmail(email);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsl(175_80%_50%/0.1),transparent_70%)]" />
        <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(325_80%_60%/0.08),transparent_70%)]" />
        
        <div className="container relative pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Unique avatars for everyone
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold font-display leading-tight">
                <span className="gradient-text">Connect to Your Roots</span>
              </h1>
              
              <p className="text-2xl lg:text-3xl font-display text-foreground/80 -mt-2">
                Generate your cave art avatar from email
              </p>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Every character in an email address maps to a unique design element. 
                Same email = same avatar, every time. Deterministic, beautiful, and fast.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button variant="hero" size="xl" onClick={() => document.getElementById("generator")?.scrollIntoView({ behavior: "smooth" })}>
                  Try it now
                </Button>
                <Button variant="heroOutline" size="xl" onClick={() => document.getElementById("docs")?.scrollIntoView({ behavior: "smooth" })}>
                  <Code2 className="w-5 h-5" />
                  API Docs
                </Button>
              </div>
              
              {/* Feature badges */}
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Fast API</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Palette className="w-4 h-4 text-secondary" />
                  <span>PNG & SVG</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Code2 className="w-4 h-4 text-accent" />
                  <span>RESTful</span>
                </div>
              </div>
            </motion.div>
            
            {/* Right: Animated avatar showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center py-12"
            >
              <TooltipProvider delayDuration={200}>
                <div className="relative w-[350px] h-[350px] flex items-center justify-center">
                  {/* Main avatar - rotating celebrity */}
                  <div className="animate-float z-10">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer">
                          <AvatarPreview email={CELEBRITY_EMAILS[demoIndex].email} size={280} className="glow-primary" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="bg-card border-border">
                        <p className="font-semibold">{CELEBRITY_EMAILS[demoIndex].name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{CELEBRITY_EMAILS[demoIndex].email}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* Floating smaller avatars - other celebrities */}
                  <motion.div
                    className="absolute -top-4 left-0 z-20"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer">
                          <AvatarPreview email="tcook@apple.com" size={80} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-card border-border">
                        <p className="font-semibold">Tim Cook</p>
                        <p className="text-xs text-muted-foreground font-mono">tcook@apple.com</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-4 right-0 z-20"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer">
                          <AvatarPreview email="zuck@fb.com" size={100} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-card border-border">
                        <p className="font-semibold">Mark Zuckerberg</p>
                        <p className="text-xs text-muted-foreground font-mono">zuck@fb.com</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                  <motion.div
                    className="absolute top-1/3 -right-8 z-20"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 5, repeat: Infinity, delay: 0.2 }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-pointer">
                          <AvatarPreview email="sundar@google.com" size={60} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-card border-border">
                        <p className="font-semibold">Sundar Pichai</p>
                        <p className="text-xs text-muted-foreground font-mono">sundar@google.com</p>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                </div>
              </TooltipProvider>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Generator Section */}
      <section id="generator" className="py-24 bg-card/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-display mb-4">
              Try it <span className="gradient-text-secondary">yourself</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enter any email address and watch your unique avatar generate in real-time
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Input section */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className={`w-full h-14 pl-12 pr-4 rounded-xl bg-muted/50 border ${
                        emailError ? 'border-destructive focus:border-destructive focus:ring-destructive/20' : 'border-border focus:border-primary focus:ring-primary/20'
                      } focus:ring-2 outline-none transition-all font-mono text-sm`}
                    />
                  </div>
                  {emailError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-destructive"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {emailError}
                    </motion.p>
                  )}
                </div>

                {/* Background selector */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Background
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBgOption('cosmos')}
                      className={`flex-1 h-10 rounded-lg font-medium text-sm transition-all ${
                        bgOption === 'cosmos'
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      Cosmos
                    </button>
                    <button
                      onClick={() => setBgOption('white')}
                      className={`flex-1 h-10 rounded-lg font-medium text-sm transition-all ${
                        bgOption === 'white'
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      White
                    </button>
                    <button
                      onClick={() => setBgOption('custom')}
                      className={`flex-1 h-10 rounded-lg font-medium text-sm transition-all ${
                        bgOption === 'custom'
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                  
                  {/* Custom hex input */}
                  {bgOption === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2 items-center"
                    >
                      <div 
                        className="w-10 h-10 rounded-lg border border-border shrink-0"
                        style={{ backgroundColor: customColor }}
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        placeholder="#6366f1"
                        className="flex-1 h-10 px-3 rounded-lg bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono text-sm uppercase"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Size selector */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Size
                  </label>
                  <div className="flex gap-2">
                    {([128, 256, 512] as SizeOption[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`flex-1 h-10 rounded-lg font-medium text-sm transition-all ${
                          selectedSize === size
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                      >
                        {size}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shape selector */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    Shape
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedShape('rounded')}
                      className={`flex-1 h-10 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        selectedShape === 'rounded'
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      <Square className="w-4 h-4" />
                      Rounded
                    </button>
                    <button
                      onClick={() => setSelectedShape('circle')}
                      className={`flex-1 h-10 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        selectedShape === 'circle'
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      <Circle className="w-4 h-4" />
                      Circle
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant="glow" 
                    className="flex-1" 
                    onClick={handleDownloadPNG}
                    disabled={!isEmailValid}
                  >
                    <FileImage className="w-4 h-4" />
                    PNG
                  </Button>
                  <Button 
                    variant="glow" 
                    className="flex-1" 
                    onClick={handleDownloadSVG}
                    disabled={!isEmailValid}
                  >
                    <FileCode className="w-4 h-4" />
                    SVG
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCopyUrl}
                    disabled={!isEmailValid}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "URL"}
                  </Button>
                </div>

                {/* Character breakdown */}
                {isEmailValid && <CharacterBreakdown email={email} />}
                
                {/* Link to full mapping */}
                <Link to="/character-mapping" className="block">
                  <Button variant="outline" className="w-full gap-2">
                    <BookOpen className="w-4 h-4" />
                    View Full Character Mapping
                  </Button>
                </Link>
              </motion.div>

              {/* Avatar preview */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center gap-6"
              >
                {isEmailValid ? (
                  <AvatarPreview email={email} size={320} background={getBackground()} shape={selectedShape} className="shadow-avatar" />
                ) : (
                  <div className={`w-[320px] h-[320px] ${selectedShape === 'circle' ? 'rounded-full' : 'rounded-xl'} bg-muted/50 border border-border flex items-center justify-center`}>
                    <p className="text-muted-foreground text-sm">Enter a valid email</p>
                  </div>
                )}
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">{selectedSize} × {selectedSize} pixels</p>
                  <p className="font-mono text-xs text-muted-foreground/60 break-all max-w-[300px]">
                    {email || "your-email@example.com"}
                  </p>
                </div>
                
                {/* Size preview row */}
                {isEmailValid && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full pt-4 border-t border-border"
                  >
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 text-center">
                      Size Preview
                    </p>
                    <div className="flex items-end justify-center gap-4">
                      <div className="flex flex-col items-center gap-1">
                        <AvatarPreview email={email} size={128} background={getBackground()} shape={selectedShape} />
                        <span className="text-xs text-muted-foreground">128px</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <AvatarPreview email={email} size={64} background={getBackground()} shape={selectedShape} />
                        <span className="text-xs text-muted-foreground">64px</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <AvatarPreview email={email} size={32} background={getBackground()} shape={selectedShape} />
                        <span className="text-xs text-muted-foreground">32px</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* API Documentation Section */}
      <section id="docs" className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold font-display mb-4">
              Simple <span className="gradient-text">REST API</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Integrate unique avatars into your app with a single API call
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Endpoint */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-lg bg-accent/20 text-accent font-mono text-sm font-semibold">
                  GET
                </span>
                <code className="font-mono text-foreground">
                  /api/v1/avatar
                </code>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Parameters:</p>
                <div className="grid gap-2 text-sm font-mono">
                  <div className="flex items-center gap-4">
                    <span className="text-primary">email</span>
                    <span className="text-muted-foreground">(required)</span>
                    <span className="text-foreground/70">Valid email address</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-primary">size</span>
                    <span className="text-muted-foreground">(optional)</span>
                    <span className="text-foreground/70">128, 256, or 512 (default: 256)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-primary">format</span>
                    <span className="text-muted-foreground">(optional)</span>
                    <span className="text-foreground/70">png or svg (default: png)</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-primary">background</span>
                    <span className="text-muted-foreground">(optional)</span>
                    <span className="text-foreground/70">cosmos, white, or hex color (default: cosmos)</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Code examples */}
            <div className="grid md:grid-cols-1 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <CodeExample code={curlExample} language="bash" title="cURL" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <CodeExample code={jsExample} language="javascript" title="JavaScript / React" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <CodeExample code={pythonExample} language="python" title="Python" />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <CavatarLogo size={32} />
            <p className="text-sm text-muted-foreground">
              Cave art inspired avatars, unique to every email
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
