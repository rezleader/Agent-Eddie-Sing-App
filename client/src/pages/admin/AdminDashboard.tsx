import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Music2, FileText, Users, TrendingUp } from "lucide-react";

interface AdminDashboardProps {
  stats: {
    totalSongs: number;
    totalChallenges: number;
    totalUsers: number;
    totalPoints: number;
  };
}

export function AdminDashboard({ stats }: AdminDashboardProps) {
  const statCards = [
    {
      title: "Total Songs",
      value: stats.totalSongs,
      icon: Music2,
      description: "Agent Eddie Sing tracks",
      color: "text-chart-1",
    },
    {
      title: "Total Challenges",
      value: stats.totalChallenges,
      icon: FileText,
      description: "Across all categories",
      color: "text-chart-2",
    },
    {
      title: "Active Players",
      value: stats.totalUsers,
      icon: Users,
      description: "Current sessions",
      color: "text-chart-4",
    },
    {
      title: "Points Distributed",
      value: stats.totalPoints.toLocaleString(),
      icon: TrendingUp,
      description: "Total earned points",
      color: "text-chart-5",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-display">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to the American Split AI admin panel
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-testid="grid-stats">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const testId = stat.title.toLowerCase().replace(/\s+/g, '-');
          return (
            <Card key={index} className="hover-elevate" data-testid={`card-stat-${testId}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid={`text-stat-${testId}-value`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-4 hover-elevate active-elevate-2 cursor-pointer" data-testid="action-upload-song">
            <h3 className="font-semibold">Upload a New Song</h3>
            <p className="text-sm text-muted-foreground">
              Add another Agent Eddie Sing track to the catalog
            </p>
          </div>
          <div className="rounded-lg border p-4 hover-elevate active-elevate-2 cursor-pointer" data-testid="action-create-challenge">
            <h3 className="font-semibold">Create Challenge Card</h3>
            <p className="text-sm text-muted-foreground">
              Design a new ACTION, SHARE, KNOW, or ALTERNATIVE challenge
            </p>
          </div>
          <div className="rounded-lg border p-4 hover-elevate active-elevate-2 cursor-pointer" data-testid="action-assign-challenges">
            <h3 className="font-semibold">Assign Challenges to Segments</h3>
            <p className="text-sm text-muted-foreground">
              Map challenges to specific time segments of songs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
