import { useEffect, useState } from "react";
import { generateAvatarDataURL, BackgroundType, AvatarShape } from "@/lib/avatarGenerator";

interface AvatarPreviewProps {
  email: string;
  size?: number;
  className?: string;
  background?: BackgroundType;
  shape?: AvatarShape;
}

export const AvatarPreview = ({ email, size = 256, className = "", background = 'cosmos', shape = 'rounded' }: AvatarPreviewProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  
  useEffect(() => {
    if (email) {
      const url = generateAvatarDataURL(email, size, background, shape);
      setAvatarUrl(url);
    }
  }, [email, size, background, shape]);
  
  const getShapeClass = () => {
    if (shape === 'circle') return 'rounded-full';
    if (shape === 'triangle') return ''; // Triangle clip is handled by canvas
    return 'rounded-xl';
  };
  
  if (!email || !avatarUrl) {
    return (
      <div 
        className={`bg-muted flex items-center justify-center ${getShapeClass()} ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-muted-foreground text-sm">Enter email</span>
      </div>
    );
  }
  
  return (
    <img 
      src={avatarUrl} 
      alt={`Avatar for ${email}`}
      className={`${getShapeClass()} shadow-avatar ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
