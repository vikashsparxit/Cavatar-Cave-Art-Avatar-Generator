import { useEffect, useState } from "react";
import { generateAvatarDataURL, BackgroundType } from "@/lib/avatarGenerator";

interface AvatarPreviewProps {
  email: string;
  size?: number;
  className?: string;
  background?: BackgroundType;
}

export const AvatarPreview = ({ email, size = 256, className = "", background = 'cosmos' }: AvatarPreviewProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  
  useEffect(() => {
    if (email) {
      const url = generateAvatarDataURL(email, size, background);
      setAvatarUrl(url);
    }
  }, [email, size, background]);
  
  if (!email || !avatarUrl) {
    return (
      <div 
        className={`bg-muted rounded-xl flex items-center justify-center ${className}`}
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
      className={`rounded-xl shadow-avatar ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
