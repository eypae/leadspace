import { getAvatarPalette, getInitials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Avatar({
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const { bg, text } = getAvatarPalette(name);
  return (
    <div
      className={`avatar avatar-${size} ${className}`}
      style={{ background: bg, color: text }}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}
