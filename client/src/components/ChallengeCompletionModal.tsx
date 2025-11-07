import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ExternalLink, Sparkles } from "lucide-react";
import { type Challenge, type ChallengeCategory } from "@shared/schema";

interface Organization {
  name: string;
  url: string;
  description: string;
}

const organizationsByCategory: Record<ChallengeCategory, Organization[]> = {
  love_romance: [
    {
      name: "Planned Parenthood",
      url: "https://www.plannedparenthood.org/",
      description: "Provides reproductive health care services and education."
    },
    {
      name: "The Trevor Project",
      url: "https://www.thetrevorproject.org/",
      description: "Crisis intervention and suicide prevention for LGBTQ+ youth."
    },
    {
      name: "Loveisrespect",
      url: "https://www.loveisrespect.org/",
      description: "Resources for healthy relationships and dating abuse prevention."
    }
  ],
  racism: [
    {
      name: "NAACP",
      url: "https://www.naacp.org/",
      description: "Promotes civil rights for African Americans and social justice."
    },
    {
      name: "Black Lives Matter",
      url: "https://www.blacklivesmatter.com/",
      description: "Fights against systemic racism and violence towards Black people."
    },
    {
      name: "Equal Justice Initiative",
      url: "https://eji.org/",
      description: "Legal representation for those wrongly convicted or unfairly treated."
    }
  ],
  sexism: [
    {
      name: "National Organization for Women",
      url: "https://now.org/",
      description: "Works to bring about equality for all women."
    },
    {
      name: "National Women's Law Center",
      url: "https://nwlc.org/",
      description: "Fights for gender justice in courts and public policy."
    },
    {
      name: "National Domestic Violence Hotline",
      url: "https://www.thehotline.org/",
      description: "Support for survivors of domestic violence and abuse."
    }
  ],
  homo_transphobia: [
    {
      name: "Human Rights Campaign",
      url: "https://www.hrc.org/",
      description: "America's largest LGBTQ+ civil rights organization."
    },
    {
      name: "The Trevor Project",
      url: "https://www.thetrevorproject.org/",
      description: "Crisis intervention and suicide prevention for LGBTQ+ youth."
    },
    {
      name: "GLAAD",
      url: "https://www.glaad.org/",
      description: "Accelerates LGBTQ+ acceptance through media representation."
    }
  ],
  threat_ai: [
    {
      name: "Rock the Vote",
      url: "https://www.rockthevote.org/",
      description: "Increases political participation among young people through voter registration."
    },
    {
      name: "When We All Vote",
      url: "https://www.whenweallvote.org/",
      description: "Works to increase voter registration and participation in every election."
    },
    {
      name: "League of Women Voters",
      url: "https://www.lwv.org/",
      description: "Encourages informed and active participation in government."
    }
  ]
};

interface ChallengeCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge | null;
  pointsEarned: number;
}

export function ChallengeCompletionModal({
  open,
  onOpenChange,
  challenge,
  pointsEarned,
}: ChallengeCompletionModalProps) {
  if (!challenge) return null;

  const organizations = organizationsByCategory[challenge.category as ChallengeCategory] || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-challenge-completion">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Challenge Completed!</DialogTitle>
              <DialogDescription className="text-lg">
                You earned <span className="font-bold text-primary">{pointsEarned} points</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Make an Even Bigger Impact
              </CardTitle>
              <CardDescription>
                Support organizations working on this cause
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {organizations.map((org) => (
                <Card key={org.name} className="hover-elevate">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{org.name}</CardTitle>
                    <CardDescription className="text-sm">{org.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      data-testid={`button-org-${org.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <a href={org.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Learn More
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-completion"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
