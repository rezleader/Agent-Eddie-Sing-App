import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./CategoryBadge";
import { ChallengeBadge } from "./ChallengeBadge";
import { PointsDisplay } from "./PointsDisplay";
import { type Challenge, type ChallengeCategory, type ChallengeType } from "@shared/schema";
import { CheckCircle2, Share2, ExternalLink } from "lucide-react";

interface ChallengeCardProps {
  challenge: Challenge;
  isCompleted?: boolean;
  isActive?: boolean;
  onAccept?: (challengeId: string) => void;
  onShare?: (challengeId: string) => void;
  className?: string;
}

export function ChallengeCard({ 
  challenge, 
  isCompleted = false, 
  isActive = false,
  onAccept,
  onShare,
  className = "" 
}: ChallengeCardProps) {
  return (
    <Card 
      className={`relative overflow-hidden transition-all ${
        isActive ? "ring-2 ring-primary shadow-lg" : ""
      } ${isCompleted ? "opacity-60" : ""} ${className} hover-elevate`}
      data-testid={`card-challenge-${challenge.id}`}
    >
      {isCompleted && (
        <div className="absolute top-4 right-4 z-10">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
      )}
      
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <CategoryBadge category={challenge.category as ChallengeCategory} />
          <ChallengeBadge type={challenge.type as ChallengeType} />
        </div>
        <CardTitle className="text-xl font-bold leading-tight">
          {challenge.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-base text-foreground/80 leading-relaxed">
          {challenge.description}
        </CardDescription>
        
        {challenge.organization && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Related Organization:</p>
              <p className="text-sm text-muted-foreground">{challenge.organization}</p>
              {challenge.organizationUrl && (
                <a 
                  href={challenge.organizationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                  data-testid={`link-organization-${challenge.id}`}
                >
                  Learn More <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-4 pt-4 border-t flex-wrap">
        <PointsDisplay points={challenge.points} size="md" />
        
        <div className="flex gap-2">
          {onShare && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(challenge.id)}
              data-testid={`button-share-${challenge.id}`}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
          {onAccept && !isCompleted && (
            <Button
              size="sm"
              onClick={() => onAccept(challenge.id)}
              data-testid={`button-accept-${challenge.id}`}
            >
              Accept Challenge
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
