import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { type Challenge } from "@shared/schema";
import { ExternalLink } from "lucide-react";
import albumCover from "@assets/American Split Cover_1763172339559.png";

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

          <div className="space-y-3">
            <Label htmlFor="answer" className="text-base font-semibold">
              Answer Your Challenge Below
            </Label>
            <Textarea
              id="answer"
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[120px] resize-none"
              data-testid="input-answer"
            />
            
            {/* Yellow buttons below the text box */}
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3"
                data-testid="button-submit-answer"
              >
                Share & Complete
              </Button>
              {onReject && (
                <Button
                  onClick={handleReject}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3"
                  data-testid="button-reject-challenge"
                >
                  Reject Challenge
                </Button>
              )}
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Your answer will be included when you share this challenge on social media.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
