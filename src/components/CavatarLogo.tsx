import { generateAvatarDataURL } from "@/lib/avatarGenerator";

interface CavatarLogoProps {
  size?: number;
  className?: string;
}

// Use "cavatar" to generate the logo using the same algorithm
const LOGO_EMAIL = "cavatar@cavatar.app";

export const CavatarLogo = ({ size = 40, className = "" }: CavatarLogoProps) => {
  const logoDataUrl = generateAvatarDataURL(LOGO_EMAIL, size * 2, 'cosmos', 'circle');
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoDataUrl} 
        alt="Cavatar Logo" 
        width={size} 
        height={size}
        className="rounded-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
      <span className="font-display font-bold text-xl tracking-tight">
        Cavatar
      </span>
    </div>
  );
};
