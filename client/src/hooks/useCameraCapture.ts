import { useState, useRef, useCallback } from 'react';

export type MediaType = 'photo' | 'video';

interface UseCameraCaptureResult {
  capturePhoto: () => Promise<File | null>;
  captureVideo: () => Promise<File | null>;
  isCapturingPhoto: boolean;
  isCapturingVideo: boolean;
  error: string | null;
  clearError: () => void;
}

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

export function useCameraCapture(): UseCameraCaptureResult {
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [isCapturingVideo, setIsCapturingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createFileInput = useCallback((accept: string): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.capture = 'environment' as any; // Use rear camera on mobile
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          resolve(file);
        } else {
          resolve(null);
        }
        input.remove();
      };

      input.oncancel = () => {
        resolve(null);
        input.remove();
      };

      input.click();
    });
  }, []);

  const capturePhotoWithMediaDevices = useCallback(async (): Promise<File | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            stream.getTracks().forEach(track => track.stop());
            resolve(null);
            return;
          }

          ctx.drawImage(video, 0, 0);

          canvas.toBlob((blob) => {
            stream.getTracks().forEach(track => track.stop());
            
            if (blob) {
              const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
              resolve(file);
            } else {
              resolve(null);
            }
          }, 'image/jpeg', 0.9);
        };

        video.onerror = () => {
          stream.getTracks().forEach(track => track.stop());
          resolve(null);
        };
      });
    } catch (err) {
      console.error('MediaDevices photo capture error:', err);
      return null;
    }
  }, []);

  const captureVideoWithMediaDevices = useCallback(async (): Promise<File | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true
      });

      return new Promise((resolve) => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8,opus'
        });
        const chunks: Blob[] = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach(track => track.stop());
          
          const blob = new Blob(chunks, { type: 'video/webm' });
          const file = new File([blob], `video-${Date.now()}.webm`, { type: 'video/webm' });
          resolve(file);
        };

        mediaRecorder.onerror = () => {
          stream.getTracks().forEach(track => track.stop());
          resolve(null);
        };

        mediaRecorder.start();

        // Auto-stop after 30 seconds to prevent very large files
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 30000);

        // For this implementation, we'll stop recording immediately for simplicity
        // In a real app, you'd want to show a UI with a stop button
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, 10000); // 10 second recording
      });
    } catch (err) {
      console.error('MediaDevices video capture error:', err);
      return null;
    }
  }, []);

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    setIsCapturingPhoto(true);
    setError(null);

    try {
      // Try getUserMedia first (preferred method)
      if (navigator.mediaDevices) {
        const file = await capturePhotoWithMediaDevices();
        
        if (file) {
          // Validate size
          if (file.size > MAX_PHOTO_SIZE) {
            setError(`Photo size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`);
            setIsCapturingPhoto(false);
            return null;
          }
          
          setIsCapturingPhoto(false);
          return file;
        }
      }

      // Fallback to file input
      const file = await createFileInput('image/*');
      
      if (file) {
        // Validate size
        if (file.size > MAX_PHOTO_SIZE) {
          setError(`Photo size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 10MB limit`);
          setIsCapturingPhoto(false);
          return null;
        }

        // Validate type
        if (!file.type.startsWith('image/')) {
          setError('Invalid file type. Please select an image.');
          setIsCapturingPhoto(false);
          return null;
        }

        setIsCapturingPhoto(false);
        return file;
      }

      setIsCapturingPhoto(false);
      return null;
    } catch (err) {
      console.error('Photo capture error:', err);
      setError('Failed to capture photo. Please try again.');
      setIsCapturingPhoto(false);
      return null;
    }
  }, [capturePhotoWithMediaDevices, createFileInput]);

  const captureVideo = useCallback(async (): Promise<File | null> => {
    setIsCapturingVideo(true);
    setError(null);

    try {
      // Try getUserMedia first (preferred method)
      if (navigator.mediaDevices) {
        const file = await captureVideoWithMediaDevices();
        
        if (file) {
          // Validate size
          if (file.size > MAX_VIDEO_SIZE) {
            setError(`Video size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 100MB limit`);
            setIsCapturingVideo(false);
            return null;
          }
          
          setIsCapturingVideo(false);
          return file;
        }
      }

      // Fallback to file input
      const file = await createFileInput('video/*');
      
      if (file) {
        // Validate size
        if (file.size > MAX_VIDEO_SIZE) {
          setError(`Video size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 100MB limit`);
          setIsCapturingVideo(false);
          return null;
        }

        // Validate type
        if (!file.type.startsWith('video/')) {
          setError('Invalid file type. Please select a video.');
          setIsCapturingVideo(false);
          return null;
        }

        setIsCapturingVideo(false);
        return file;
      }

      setIsCapturingVideo(false);
      return null;
    } catch (err) {
      console.error('Video capture error:', err);
      setError('Failed to capture video. Please try again.');
      setIsCapturingVideo(false);
      return null;
    }
  }, [captureVideoWithMediaDevices, createFileInput]);

  return {
    capturePhoto,
    captureVideo,
    isCapturingPhoto,
    isCapturingVideo,
    error,
    clearError,
  };
}
