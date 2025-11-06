import { Trophy } from "lucide-react";

interface PointsDisplayProps {
  points: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PointsDisplay({ points, size = "md", className = "" }: PointsDisplayProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: 14,
    md: 20,
    lg: 28,
  };

  return (
    <div 
      className={`flex items-center gap-2 font-bold text-primary ${className}`}
      data-testid="display-points"
    >
      <Trophy size={iconSizes[size]} className="text-primary" />
      <span className={sizeClasses[size]}>{points.toLocaleString()}</span>
    </div>
  );
}
