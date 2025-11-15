import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Music, Loader2, StopCircle, Trophy, Shield, BookOpen } from "lucide-react";
import { PointsDisplay } from "@/components/PointsDisplay";

interface UserScannerProps {
  onSongDetected: (audioBlob: Blob) => void;
  totalPoints: number;
  isRecognizing?: boolean;
  onViewLeaderboard?: () => void;
  onViewResources?: () => void;
  onAdminLogin?: () => void;
}

export function UserScanner({ onSongDetected, totalPoints, isRecognizing = false, onViewLeaderboard, onViewResources, onAdminLogin }: UserScannerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      // Request high-quality audio for better music recognition
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,  // Disable processing that degrades music
          noiseSuppression: false,  // Keep original audio quality
          autoGainControl: false,   // Prevent volume normalization
          sampleRate: 48000,        // Higher sample rate for better quality
          channelCount: 1           // Mono is fine for recognition
        }
      });
      
      // Use WAV codec if available for best quality, otherwise use high-quality WebM
      let options: MediaRecorderOptions = {};
      const mimeTypes = [
        'audio/wav',
        'audio/webm;codecs=opus',
        'audio/webm'
      ];
      
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          options = { 
            mimeType,
            audioBitsPerSecond: 256000  // High bitrate for quality
          };
          console.log('[Recording] Using MIME type:', mimeType);
          break;
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        console.log('[Recording] Created blob:', audioBlob.size, 'bytes, type:', mediaRecorder.mimeType);
        stream.getTracks().forEach(track => track.stop());
        onSongDetected(audioBlob);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Update timer every second
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Auto-stop after 10 seconds (enough to capture a segment)
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording();
        }
      }, 10000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
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
          <div className="flex items-center gap-3 flex-wrap">
            {onAdminLogin && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onAdminLogin}
                data-testid="button-admin-login"
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            {onViewResources && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onViewResources}
                data-testid="button-view-resources"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Resources
              </Button>
            )}
            {onViewLeaderboard && (
              <Button 
                variant="outline" 
                size="lg"
                onClick={onViewLeaderboard}
                data-testid="button-view-leaderboard"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Leaderboard
              </Button>
            )}
            <PointsDisplay points={totalPoints} size="lg" />
          </div>
        </div>

        {/* Main scanner card */}
        <Card className="shadow-xl border-2" data-testid="card-scanner">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl lg:text-3xl font-display">
              Listen & Recognize
            </CardTitle>
            <CardDescription className="text-base">
              Play Eddie Sing & The 31 Days; song off of their album American Split AI on any platform and hold your device near the speakers to identify it and unlock challenges for Agent Eddie Sing ARG points and make your way to the Leaderboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Microphone capture */}
            <div className="space-y-4">
              {isRecognizing || isRecording ? (
                <div className="flex flex-col items-center justify-center w-full min-h-64 rounded-xl border-2 border-primary bg-primary/10">
                  <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
                    {isRecording ? (
                      <>
                        <div className="relative">
                          <Mic className="w-16 h-16 text-primary animate-pulse-scale" />
                          <div className="absolute -inset-4 rounded-full border-4 border-primary/30 animate-ping"></div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-2xl font-bold">Recording...</p>
                          <p className="text-lg text-muted-foreground">
                            {recordingTime}s / 10s
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Play the song nearby
                          </p>
                        </div>
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          size="lg"
                          className="mt-4"
                          data-testid="button-stop-recording"
                        >
                          <StopCircle className="w-5 h-5 mr-2" />
                          Stop Recording
                        </Button>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        <div className="space-y-1">
                          <p className="text-2xl font-bold">Analyzing audio...</p>
                          <p className="text-sm text-muted-foreground">
                            Identifying song and segment
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isRecognizing}
                  className="flex flex-col items-center justify-center w-full min-h-64 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 cursor-pointer transition-all hover-elevate active-elevate-2"
                  data-testid="button-record-audio"
                >
                  <div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
                    <div className="relative">
                      <Mic className="w-16 h-16 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold">
                        Tap to Listen
                      </p>
                      <p className="text-base text-muted-foreground">
                        Play an Agent Eddie Sing song and tap here to identify it
                      </p>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info section */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-bold text-lg">How It Works:</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Play any Eddie Sing & The 31 Days song off of their album, American Split on any streaming platform.</li>
                <li>Tap the microphone button above</li>
                <li>Hold your device near the speakers for 10 seconds.</li>
                <li>Our system identifies the song AND which minute segment you're in</li>
                <li>View challenges specific to that time segment</li>
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
