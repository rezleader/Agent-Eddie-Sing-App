import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { type Challenge, type UserMedia } from "@shared/schema";
import { ExternalLink, Camera, Video, Loader2, CheckCircle, X } from "lucide-react";
import albumCover from "@assets/American Split Cover_1763172339559.png";
import { useCameraCapture } from "@/hooks/useCameraCapture";
import { useToast } from "@/hooks/use-toast";

interface AnswerInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge | null;
  onSubmit: (answer: string, mediaId?: string) => void;
  onReject?: () => void;
  songTitle?: string;
  sessionToken: string;
}

export function AnswerInputDialog({ open, onOpenChange, challenge, onSubmit, onReject, songTitle, sessionToken }: AnswerInputDialogProps) {
  const [answer, setAnswer] = useState("");
  const [capturedMedia, setCapturedMedia] = useState<UserMedia | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { capturePhoto, captureVideo, isCapturing, error: captureError, clearError } = useCameraCapture();
  const { toast } = useToast();

  if (!challenge) return null;

  const uploadMedia = async (file: File, mediaType: 'photo' | 'video'): Promise<UserMedia | null> => {
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('mediaFile', file);
      formData.append('sessionToken', sessionToken);
      formData.append('challengeId', challenge.id);
      formData.append('mediaType', mediaType);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Don't set Content-Type - browser will set it with boundary
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const media = await response.json();

      toast({
        title: "Upload successful",
        description: `Your ${mediaType} has been uploaded successfully.`,
      });

      return media;
    } catch (error) {
      console.error('Media upload error:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${mediaType}. Please try again.`,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    clearError();
    const file = await capturePhoto();
    
    if (file) {
      const media = await uploadMedia(file, 'photo');
      if (media) {
        setCapturedMedia(media);
      }
    }
  };

  const handleRecordVideo = async () => {
    clearError();
    const file = await captureVideo();
    
    if (file) {
      const media = await uploadMedia(file, 'video');
      if (media) {
        setCapturedMedia(media);
      }
    }
  };

  const handleRemoveMedia = () => {
    setCapturedMedia(null);
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer.trim(), capturedMedia?.id);
      setAnswer("");
      setCapturedMedia(null);
    }
  };

  const handleReject = () => {
    setAnswer("");
    setCapturedMedia(null);
    onOpenChange(false);
    if (onReject) {
      onReject();
    }
  };

  const handleCancel = () => {
    setAnswer("");
    setCapturedMedia(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" data-testid="modal-answer-input">
        <DialogHeader>
          <DialogTitle className="text-2xl">Answer This Challenge</DialogTitle>
          <DialogDescription>
            Share your thoughts or response to this challenge before sharing it with others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 pb-6">
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

            {/* Camera Capture Buttons */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Optional: Capture Photo or Video
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTakePhoto}
                  disabled={isCapturing || isUploading || !!capturedMedia}
                  className="flex items-center gap-2"
                  data-testid="button-take-photo"
                >
                  {isCapturing || isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRecordVideo}
                  disabled={isCapturing || isUploading || !!capturedMedia}
                  className="flex items-center gap-2"
                  data-testid="button-record-video"
                >
                  {isCapturing || isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  Create Video
                </Button>
              </div>
            </div>

            {/* Capture Error Display */}
            {captureError && (
              <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                {captureError}
              </div>
            )}

            {/* Captured Media Preview */}
            {capturedMedia && (
              <div className="p-3 rounded-md bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold">
                      {capturedMedia.mediaType === 'photo' ? 'Photo' : 'Video'} captured
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveMedia}
                    className="h-6 w-6 p-0"
                    data-testid="button-remove-media"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your {capturedMedia.mediaType} will be included in the social share
                </p>
              </div>
            )}
            
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
