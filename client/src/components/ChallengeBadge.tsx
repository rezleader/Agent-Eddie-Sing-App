import { Badge } from "@/components/ui/badge";
import { type ChallengeType } from "@shared/schema";

interface ChallengeBadgeProps {
  type: ChallengeType;
  className?: string;
}

const typeColors: Record<ChallengeType, string> = {
  ACTION: "bg-chart-1 border-chart-1 text-white",
  SHARE: "bg-chart-2 border-chart-2 text-white",
  KNOW: "bg-chart-4 border-chart-4 text-white",
  ALTERNATIVE: "bg-chart-5 border-chart-5 text-white",
};

export function ChallengeBadge({ type, className = "" }: ChallengeBadgeProps) {
  return (
    <Badge 
      className={`${typeColors[type]} ${className} uppercase text-xs font-bold`}
      data-testid={`badge-challenge-${type.toLowerCase()}`}
    >
      {type}
    </Badge>
  );
}
