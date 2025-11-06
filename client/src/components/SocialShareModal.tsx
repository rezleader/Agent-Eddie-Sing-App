import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SiFacebook, SiInstagram, SiSnapchat, SiTiktok } from "react-icons/si";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { type Challenge, categoryDisplayNames, type ChallengeCategory } from "@shared/schema";

interface SocialShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge | null;
  points: number;
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

export function SocialShareModal({ open, onOpenChange, challenge, points }: SocialShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!challenge) return null;

  const shareText = `I just completed a challenge in American Split AI ARG!\n\n"${challenge.title}"\n\nCategory: ${categoryDisplayNames[challenge.category as ChallengeCategory]}\nPoints Earned: ${points}\n\n#AmericanSplit #ARG #AgentEddieSing #${categoryDisplayNames[challenge.category as ChallengeCategory].replace(/[^a-zA-Z0-9]/g, '')}`;

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
    
    // Use Web Share API if available (works on mobile)
    if (navigator.share && (platform === 'instagram' || platform === 'snapchat' || platform === 'tiktok')) {
      navigator.share({
        title: 'American Split AI Challenge',
        text: shareText,
        url: window.location.href,
      }).catch(err => console.log('Share cancelled', err));
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
                Copy to Clipboard
              </>
            )}
          </Button>

          {/* Social platforms */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">Share directly to:</p>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(platformConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={key}
                    onClick={() => handleShare(key as keyof typeof platformConfig)}
                    className={`${config.color} text-white`}
                    data-testid={`button-share-${key}`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {config.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
