import { Badge } from "@/components/ui/badge";
import { type ChallengeCategory, categoryDisplayNames } from "@shared/schema";

interface CategoryBadgeProps {
  category: ChallengeCategory;
  className?: string;
}

const categoryColors: Record<ChallengeCategory, string> = {
  love_romance: "bg-category-love border-category-love text-white",
  racism: "bg-category-racism border-category-racism text-white",
  sexism: "bg-category-sexism border-category-sexism text-white",
  homo_transphobia: "bg-category-homo border-category-homo text-white",
  threat_ai: "bg-category-ai border-category-ai text-white",
};

export function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  return (
    <Badge 
      className={`${categoryColors[category]} ${className} uppercase text-xs font-bold tracking-wide`}
      data-testid={`badge-category-${category}`}
    >
      {categoryDisplayNames[category]}
    </Badge>
  );
}
