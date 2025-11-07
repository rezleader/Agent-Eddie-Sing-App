import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ChallengeBadge } from "@/components/ChallengeBadge";
import { ChallengeCard } from "@/components/ChallengeCard";
import { Plus } from "lucide-react";
import { type Challenge, type Song, challengeCategories, challengeTypes, categoryDisplayNames, type ChallengeCategory, type ChallengeType } from "@shared/schema";

interface ChallengesManagerProps {
  challenges: Challenge[];
  songs: Song[];
  onCreateChallenge: (data: {
    category: ChallengeCategory;
    type: ChallengeType;
    title: string;
    description: string;
    points: number;
    songId: string;
    segment: number;
  }) => void;
  onDeleteChallenge: (challengeId: string) => void;
}

export function ChallengesManager({ challenges, songs, onCreateChallenge, onDeleteChallenge }: ChallengesManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "" as ChallengeCategory | "",
    type: "" as ChallengeType | "",
    title: "",
    description: "",
    points: 50,
    songId: "",
    segment: 1,
  });

  const [filterCategory, setFilterCategory] = useState<ChallengeCategory | "all">("all");
  const [filterType, setFilterType] = useState<ChallengeType | "all">("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category && formData.type && formData.title && formData.description && formData.songId) {
      onCreateChallenge({
        category: formData.category,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        points: formData.points,
        songId: formData.songId,
        segment: formData.segment,
      });
      setFormData({
        category: "",
        type: "",
        title: "",
        description: "",
        points: 50,
        songId: "",
        segment: 1,
      });
      setDialogOpen(false);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const categoryMatch = filterCategory === "all" || challenge.category === filterCategory;
    const typeMatch = filterType === "all" || challenge.type === filterType;
    return categoryMatch && typeMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display">Challenges</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage ARG challenge cards
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" data-testid="button-add-challenge">
              <Plus className="w-5 h-5 mr-2" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
              <DialogDescription>
                Design an ACTION, SHARE, KNOW, or ALTERNATIVE challenge card
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as ChallengeCategory }))}
                  >
                    <SelectTrigger id="category" data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {challengeCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {categoryDisplayNames[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Challenge Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as ChallengeType }))}
                  >
                    <SelectTrigger id="type" data-testid="select-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {challengeTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Challenge Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Share a photo on Instagram..."
                  required
                  data-testid="input-challenge-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Post a photo with the hashtag #AmericanSplit and explain how you plan to stand up against racism..."
                  rows={4}
                  required
                  data-testid="input-challenge-description"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Points (1-100)</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.points}
                    onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                    required
                    data-testid="input-challenge-points"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="song">Song</Label>
                  <Select
                    value={formData.songId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, songId: value }))}
                  >
                    <SelectTrigger id="song" data-testid="select-song">
                      <SelectValue placeholder="Select song" />
                    </SelectTrigger>
                    <SelectContent>
                      {songs.map(song => (
                        <SelectItem key={song.id} value={song.id}>
                          {song.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="segment">Segment</Label>
                  <Select
                    value={formData.segment.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, segment: parseInt(value) }))}
                  >
                    <SelectTrigger id="segment" data-testid="select-segment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Minute 1</SelectItem>
                      <SelectItem value="2">Minute 2</SelectItem>
                      <SelectItem value="3">Minute 3</SelectItem>
                      <SelectItem value="4">Minute 4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full" data-testid="button-submit-challenge">
                Create Challenge
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                {challengeTypes.map(type => (
                  <Button
                    key={type}
                    variant={filterType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterCategory === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterCategory("all")}
                >
                  All
                </Button>
                {challengeCategories.map(cat => (
                  <Button
                    key={cat}
                    variant={filterCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterCategory(cat)}
                  >
                    {categoryDisplayNames[cat]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenges grid */}
      {filteredChallenges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="font-semibold text-lg mb-2">No challenges yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first challenge to get started
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChallenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
            />
          ))}
        </div>
      )}
    </div>
  );
}
