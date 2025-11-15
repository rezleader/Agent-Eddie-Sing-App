import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SiFacebook, SiInstagram, SiSnapchat, SiTiktok } from "react-icons/si";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { type Challenge, categoryDisplayNames, type ChallengeCategory } from "@shared/schema";
import albumCover from "@assets/American Split Cover_1763171359272.png";

interface SocialShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge | null;
  points: number;
  userAnswer?: string;
}

const platformConfig = {
  facebook: {
    name: "Facebook",
    icon: SiFacebook,
    color: "bg-[#1877F2] hover:bg-[#0C63D4]",
    shareUrl: (text: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(text)}`,
  },
  instagram: {
    name: "Instagram",
    icon: SiInstagram,
    color: "bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4] hover:opacity-90",
    shareUrl: null, // Instagram doesn't support direct web sharing
  },
  snapchat: {
    name: "Snapchat",
    icon: SiSnapchat,
    color: "bg-[#FFFC00] text-black hover:bg-[#E6E300]",
    shareUrl: null, // Snapchat doesn't support direct web sharing
  },
  tiktok: {
    name: "TikTok",
    icon: SiTiktok,
    color: "bg-black hover:bg-gray-900",
    shareUrl: null, // TikTok doesn't support direct web sharing
  },
};

export function SocialShareModal({ open, onOpenChange, challenge, points, userAnswer = "" }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!challenge) return null;

  const answerSection = userAnswer ? `\n\nMy Answer:\n"${userAnswer}"\n` : "";
  const endingMessage = "\n\nScan the album American Split AI available at AgentEddieSing.com to scan the songs and take part in the ARG game.\n\nVisit: https://agenteddiesing.replit.app\n\nSkabe din fremtid, Eddie Sing & The 31 Days.";
  
  const shareText = `I just completed a challenge in American Split AI ARG!\n\n"${challenge.title}"${answerSection}\nCategory: ${categoryDisplayNames[challenge.category as ChallengeCategory]}\nPoints Earned: ${points}${endingMessage}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: keyof typeof platformConfig) => {
    const config = platformConfig[platform];
    
    // For Instagram and Snapchat, just copy the text
    if (platform === 'instagram' || platform === 'snapchat') {
      handleCopy();
      return;
    }

    // Desktop sharing for Facebook
    if (config.shareUrl) {
      window.open(config.shareUrl(shareText), '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-social-share">
        <DialogHeader>
          <DialogTitle className="text-2xl">Share Your Challenge!</DialogTitle>
          <DialogDescription>
            Spread the word about your completed challenge and inspire others to take action.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Album Cover */}
          <div className="flex justify-center">
            <img 
              src={albumCover} 
              alt="American Split AI Album Cover" 
              className="w-48 h-48 rounded-lg shadow-lg object-cover"
              data-testid="img-album-cover"
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap" data-testid="text-share-preview">
            {shareText}
          </div>

          {/* Copy button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCopy}
            data-testid="button-copy-text"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy the Post
              </>
            )}
          </Button>

          {/* Social platforms */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Share to:</p>
            
            {/* Facebook - Direct share */}
            <Button
              onClick={() => handleShare('facebook')}
              className="w-full bg-[#1877F2] hover:bg-[#0C63D4] text-white"
              data-testid="button-share-facebook"
            >
              <SiFacebook className="w-5 h-5 mr-2" />
              Share on Facebook
            </Button>

            {/* Instagram - Copy and open */}
            <div className="space-y-2">
              <Button
                onClick={() => handleShare('instagram')}
                className="w-full bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4] hover:opacity-90 text-white"
                data-testid="button-share-instagram"
              >
                <SiInstagram className="w-5 h-5 mr-2" />
                Copy for Instagram
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Text copied! Open Instagram and paste into your story or post with the album cover image.
              </p>
            </div>

            {/* Snapchat - Copy and open */}
            <div className="space-y-2">
              <Button
                onClick={() => handleShare('snapchat')}
                className="w-full bg-[#FFFC00] text-black hover:bg-[#E6E300]"
                data-testid="button-share-snapchat"
              >
                <SiSnapchat className="w-5 h-5 mr-2" />
                Copy for Snapchat
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Text copied! Open Snapchat and paste into your story with the album cover image.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
