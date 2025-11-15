import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SiFacebook, SiInstagram, SiSnapchat, SiTiktok } from "react-icons/si";
import { Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { type Challenge, categoryDisplayNames, type ChallengeCategory } from "@shared/schema";
import albumCover from "@assets/American Split Cover_1763172339559.png";

interface SocialShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge | null;
  points: number;
  userAnswer?: string;
  songTitle?: string;
  songArtist?: string;
}

const platformConfig = {
  facebook: {
    name: "Facebook",
    icon: SiFacebook,
    color: "bg-[#1877F2] hover:bg-[#0C63D4]",
    shareUrl: (text: string, imageUrl: string) => {
      // Facebook Feed Dialog with image
      const params = new URLSearchParams({
        app_id: '966242223397117', // Generic Facebook app ID for sharing
        display: 'popup',
        link: 'https://agenteddiesing.replit.app',
        quote: text,
        picture: imageUrl,
      });
      return `https://www.facebook.com/dialog/feed?${params.toString()}`;
    },
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

export function SocialShareModal({ open, onOpenChange, challenge, points, userAnswer = "", songTitle, songArtist }: SocialShareModalProps) {
  const [copiedText, setCopiedText] = useState(false);

  // Get the full URL to the album cover image
  const albumCoverUrl = new URL(albumCover, window.location.origin).href;
  const shareLink = "https://agenteddiesing.replit.app";
  const endingMessage = "\n\nScan the album American Split AI available at AgentEddieSing.com to scan the songs and take part in the ARG game.\n\nVisit: https://agenteddiesing.replit.app\n\nSkabe din fremtid, Eddie Sing & The 31 Days.";
  
  // If no challenge (song-only share), create simple share text
  if (!challenge && songTitle) {
    const shareText = `Just discovered this amazing song: ${songTitle} by ${songArtist}!${endingMessage}`;
    return renderShareDialog(shareText);
  }
  
  if (!challenge) return null;

  const answerSection = userAnswer ? `\n\nMy Answer:\n"${userAnswer}"\n` : "";
  const shareText = `I just completed a challenge in American Split AI ARG!\n\n"${challenge.title}"${answerSection}\nCategory: ${categoryDisplayNames[challenge.category as ChallengeCategory]}\nPoints Earned: ${points}${endingMessage}`;

  return renderShareDialog(shareText);

  function renderShareDialog(text: string) {
    const handleCopyText = async () => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    };

    const handleShareFacebook = () => {
      window.open(platformConfig.facebook.shareUrl!(text, albumCoverUrl), '_blank', 'width=600,height=400');
    };

    const handleShareInstagram = () => {
      // Open Instagram
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // On mobile, try to open Instagram app
        window.open('instagram://', '_blank');
      } else {
        // On desktop, open Instagram website
        window.open('https://www.instagram.com/', '_blank');
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
          <div className="rounded-lg bg-muted p-4 text-sm whitespace-pre-wrap max-h-48 overflow-y-auto" data-testid="text-share-preview">
            {text}
          </div>

          {/* Copy button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCopyText}
            data-testid="button-copy-text"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Post Text Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Post Text
              </>
            )}
          </Button>

          {/* Social platforms */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-muted-foreground">Share to:</p>
            
            {/* Facebook - Direct share with embedded image */}
            <div className="space-y-2">
              <Button
                onClick={handleShareFacebook}
                className="w-full bg-[#1877F2] hover:bg-[#0C63D4] text-white gap-2"
                data-testid="button-share-facebook"
              >
                <SiFacebook className="w-5 h-5" />
                Share on Facebook
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Opens Facebook with your post and album cover ready to share
              </p>
            </div>

            {/* Instagram - Open Instagram */}
            <div className="space-y-2">
              <Button
                onClick={handleShareInstagram}
                className="w-full bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4] hover:opacity-90 text-white gap-2"
                data-testid="button-share-instagram"
              >
                <SiInstagram className="w-5 h-5" />
                Open Instagram
              </Button>
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-xs font-semibold">How to share on Instagram:</p>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Click "Copy Post Text" above</li>
                  <li>Save the album cover image (long-press or right-click)</li>
                  <li>Click "Open Instagram" to go to Instagram</li>
                  <li>Create a post/story and upload the album cover</li>
                  <li>Paste your text in the caption</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    );
  }
}
