import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Mic, Music, Loader2 } from "lucide-react";
import { PointsDisplay } from "@/components/PointsDisplay";

interface UserScannerProps {
  onSongDetected: (audioFile: File) => void;
  totalPoints: number;
  isRecognizing?: boolean;
}

export function UserScanner({ onSongDetected, totalPoints, isRecognizing = false }: UserScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    onSongDetected(selectedFile);
  };

  const handleMicrophoneCapture = () => {
    // TODO: Implement microphone capture with Web Audio API
    alert("Microphone capture feature coming soon! Please upload an audio file for now.");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-8 animate-slide-up">
        {/* Header with points */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold font-display text-primary">
              American Split AI
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">
              Agent Eddie Sing ARG
            </p>
          </div>
          <PointsDisplay points={totalPoints} size="lg" />
        </div>

        {/* Main scanner card */}
        <Card className="shadow-xl border-2" data-testid="card-scanner">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl lg:text-3xl font-display">
              Recognize Your Song
            </CardTitle>
            <CardDescription className="text-base">
              Upload an audio file or record from your microphone to identify songs and unlock challenges
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Upload option */}
            <div className="space-y-3">
              <label 
                htmlFor="audio-upload" 
                className={`flex flex-col items-center justify-center w-full min-h-48 rounded-xl border-2 border-dashed transition-all ${
                  isRecognizing 
                    ? "border-primary bg-primary/10 cursor-wait"
                    : "border-primary/30 bg-primary/5 cursor-pointer hover-elevate active-elevate-2"
                }`}
                data-testid="label-file-upload"
              >
                <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                  {isRecognizing ? (
                    <>
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">Analyzing audio...</p>
                        <p className="text-sm text-muted-foreground">Please wait</p>
                      </div>
                    </>
                  ) : selectedFile ? (
                    <>
                      <Music className="w-12 h-12 text-primary" />
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Click to choose a different file
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-primary" />
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">
                          Upload Audio File
                        </p>
                        <p className="text-sm text-muted-foreground">
                          MP3, WAV, M4A up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <input
                  id="audio-upload"
                  type="file"
                  className="hidden"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  disabled={isRecognizing}
                  data-testid="input-audio-file"
                />
              </label>

              {selectedFile && !isRecognizing && (
                <Button 
                  onClick={handleScan}
                  className="w-full"
                  size="lg"
                  data-testid="button-scan-audio"
                >
                  <Music className="w-5 h-5 mr-2" />
                  Scan Audio
                </Button>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-4 text-muted-foreground font-semibold">
                  OR
                </span>
              </div>
            </div>

            {/* Microphone option */}
            <Button
              onClick={handleMicrophoneCapture}
              variant="outline"
              size="lg"
              className="w-full min-h-20 text-lg"
              disabled={isRecognizing}
              data-testid="button-record-audio"
            >
              <Mic className={`w-6 h-6 mr-3 ${isRecognizing ? 'animate-pulse-scale' : ''}`} />
              {isRecognizing ? "Listening..." : "Record from Microphone"}
            </Button>
          </CardContent>
        </Card>

        {/* Info section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-bold text-lg">How It Works:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Upload an audio file or record from your microphone</li>
                <li>Our system will identify the Agent Eddie Sing song</li>
                <li>View time-based challenges divided into 4 minute segments</li>
                <li>Complete challenges to earn points and share on social media</li>
                <li>Take action on social justice issues through music!</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
