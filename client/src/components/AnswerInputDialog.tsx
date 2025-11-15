import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { type Challenge } from "@shared/schema";
import { ExternalLink } from "lucide-react";
import albumCover from "@assets/American Split Cover_1763171359272.png";

interface AnswerInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge | null;
  onSubmit: (answer: string) => void;
  onReject?: () => void;
  songTitle?: string;
}

export function AnswerInputDialog({ open, onOpenChange, challenge, onSubmit, onReject, songTitle }: AnswerInputDialogProps) {
  const [answer, setAnswer] = useState("");

  if (!challenge) return null;

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim());
      setAnswer(""); // Reset for next time
    }
  };

  const handleReject = () => {
    setAnswer("");
    onOpenChange(false);
    if (onReject) {
      onReject();
    }
  };

  const handleCancel = () => {
    setAnswer("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-answer-input">
        <DialogHeader>
          <DialogTitle className="text-2xl">Answer This Challenge</DialogTitle>
          <DialogDescription>
            Share your thoughts or response to this challenge before sharing it with others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Album Cover */}
          <div className="flex justify-center">
            <img 
              src={albumCover} 
              alt="American Split AI Album Cover" 
              className="w-40 h-40 rounded-lg shadow-lg object-cover"
              data-testid="img-answer-dialog-album-cover"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer" className="text-base font-semibold">
              {challenge.title}
            </Label>
            <p className="text-sm text-muted-foreground">
              {challenge.description}
            </p>
          </div>

          {challenge.organization && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
              <p className="text-sm font-semibold text-foreground">Related Organization:</p>
              <p className="text-sm text-muted-foreground">{challenge.organization}</p>
              {challenge.organizationUrl && (
                <a 
                  href={challenge.organizationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  data-testid="link-organization-dialog"
                >
                  Learn More <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="answer">Your Answer</Label>
            <Textarea
              id="answer"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[120px] resize-none"
              data-testid="input-answer"
            />
            <p className="text-xs text-muted-foreground">
              Your answer will be included when you share this challenge on social media.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          {onReject && (
            <Button
              variant="outline"
              onClick={handleReject}
              className="w-full sm:w-auto"
              data-testid="button-reject-challenge"
            >
              Reject Challenge
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            className="w-full sm:w-auto"
            data-testid="button-submit-answer"
          >
            Share & Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
