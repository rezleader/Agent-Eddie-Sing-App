import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ResourcesProps {
  onBack: () => void;
}

interface Organization {
  name: string;
  url: string;
  description: string;
}

const organizationsByCategory: Record<string, Organization[]> = {
  "Racism & Civil Rights": [
    {
      name: "NAACP",
      url: "https://www.naacp.org/",
      description: "Promotes civil rights for African Americans and advocates for social justice."
    },
    {
      name: "Black Lives Matter",
      url: "https://www.blacklivesmatter.com/",
      description: "A global organization that fights against systemic racism and violence towards Black people."
    },
    {
      name: "Equal Justice Initiative",
      url: "https://eji.org/",
      description: "Provides legal representation to people who have been wrongly convicted or unfairly treated in the criminal justice system."
    },
    {
      name: "Color of Change",
      url: "https://colorofchange.org/",
      description: "A racial justice organization that works to hold corporations and government accountable."
    },
    {
      name: "Southern Poverty Law Center",
      url: "https://www.splcenter.org/",
      description: "Monitors hate groups and extremist organizations and works to combat bigotry and discrimination."
    },
    {
      name: "The Anti-Defamation League",
      url: "https://www.adl.org/",
      description: "A civil rights organization that fights against anti-Semitism and all forms of hate."
    },
    {
      name: "National Urban League",
      url: "https://www.nul.org/",
      description: "Advocates for economic empowerment and social justice for African Americans."
    }
  ],
  "LGBTQ+ Rights": [
    {
      name: "The Trevor Project",
      url: "https://www.thetrevorproject.org/",
      description: "Provides crisis intervention and suicide prevention services for LGBTQ+ youth."
    },
    {
      name: "Human Rights Campaign",
      url: "https://www.hrc.org/",
      description: "America's largest civil rights organization working to achieve LGBTQ+ equality."
    },
    {
      name: "GLAAD",
      url: "https://www.glaad.org/",
      description: "Works to accelerate acceptance for the LGBTQ+ community through media representation."
    }
  ],
  "Women's Rights": [
    {
      name: "Planned Parenthood",
      url: "https://www.plannedparenthood.org/",
      description: "Provides reproductive health care services, including education, contraception, and abortion services."
    },
    {
      name: "National Organization for Women (NOW)",
      url: "https://now.org/",
      description: "Works to bring about equality for all women through grassroots activism."
    },
    {
      name: "National Women's Law Center",
      url: "https://nwlc.org/",
      description: "Fights for gender justice in courts, public policy, and society."
    },
    {
      name: "National Domestic Violence Hotline",
      url: "https://www.thehotline.org/",
      description: "Provides support and resources for survivors of domestic violence and abuse."
    }
  ],
  "Gun Violence Prevention": [
    {
      name: "Brady Campaign to Prevent Gun Violence",
      url: "https://www.bradycampaign.org/",
      description: "A national organization working to reduce gun violence through education and advocacy."
    },
    {
      name: "Everytown for Gun Safety",
      url: "https://www.everytown.org/",
      description: "A national organization working to end gun violence and build safer communities."
    },
    {
      name: "Giffords Law Center",
      url: "https://lawcenter.giffords.org/",
      description: "Works to protect people from gun violence through legal means."
    },
    {
      name: "Moms Demand Action",
      url: "https://momsdemandaction.org/",
      description: "A grassroots organization working to improve gun safety laws."
    },
    {
      name: "March for Our Lives",
      url: "https://www.marchforourlives.com/",
      description: "Works to reduce gun violence through advocacy and activism."
    }
  ],
  "Political Engagement": [
    {
      name: "Rock the Vote",
      url: "https://www.rockthevote.org/",
      description: "Aims to increase political participation among young people through voter registration and mobilization."
    },
    {
      name: "Voto Latino",
      url: "https://votolatino.org/",
      description: "Works to engage, educate, and empower Latino youth to participate in the civic process."
    },
    {
      name: "League of Women Voters",
      url: "https://www.lwv.org/",
      description: "Encourages informed and active participation in government and influences public policy."
    },
    {
      name: "When We All Vote",
      url: "https://www.whenweallvote.org/",
      description: "Works to increase voter registration and participation in every election."
    },
    {
      name: "HeadCount",
      url: "https://www.headcount.org/",
      description: "Works to register voters and promote participation in democracy through the power of music."
    }
  ],
  "Love & Relationships": [
    {
      name: "The Gottman Institute",
      url: "https://www.gottman.com/",
      description: "Provides resources and training for couples to strengthen their relationships."
    },
    {
      name: "Loveisrespect",
      url: "https://www.loveisrespect.org/",
      description: "Provides resources and support for healthy relationships, including information on dating abuse."
    },
    {
      name: "The Center for Relationship and Sexual Health",
      url: "https://www.crsh.net/",
      description: "Provides counseling and therapy services for individuals and couples."
    }
  ]
};

export function Resources({ onBack }: ResourcesProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Resources & Organizations</h1>
          <p className="text-lg text-muted-foreground">
            Support these organizations working to create positive change
          </p>
        </div>

        <div className="space-y-8">
          {Object.entries(organizationsByCategory).map(([category, organizations]) => (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-base">
                    {category}
                  </Badge>
                  <CardTitle className="text-2xl">{organizations.length} Organizations</CardTitle>
                </div>
                <CardDescription>
                  Learn more and get involved with these trusted organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {organizations.map((org) => (
                    <Card key={org.name} className="hover-elevate">
                      <CardHeader>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {org.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          data-testid={`button-org-${org.name.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <a href={org.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Visit Website
                          </a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 bg-muted/50">
          <CardContent className="py-8 text-center">
            <p className="text-lg font-semibold mb-2">
              Make a Difference
            </p>
            <p className="text-muted-foreground">
              Complete challenges to earn points and discover more ways to support these causes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
