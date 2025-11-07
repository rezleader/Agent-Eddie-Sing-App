import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Music2, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { type Song } from "@shared/schema";

interface SongsManagerProps {
  songs: Song[];
  onCreateSong: (data: { title: string; artist: string; album?: string; duration: number; audioFile: File }) => void;
  onDeleteSong: (songId: string) => void;
  isUploading?: boolean;
}

export function SongsManager({ songs, onCreateSong, onDeleteSong, isUploading = false }: SongsManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "Eddie Sing & The 31 Days",
    album: "",
    duration: 0,
  });
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [wasUploading, setWasUploading] = useState(false);

  // Close dialog and reset form after successful upload
  useEffect(() => {
    if (wasUploading && !isUploading) {
      setFormData({ title: "", artist: "Eddie Sing & The 31 Days", album: "", duration: 0 });
      setMinutes(0);
      setSeconds(0);
      setAudioFile(null);
      setDialogOpen(false);
      setWasUploading(false);
    } else if (isUploading) {
      setWasUploading(true);
    }
  }, [isUploading, wasUploading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSeconds = minutes * 60 + seconds;
    if (audioFile && formData.title && formData.artist && totalSeconds > 0) {
      onCreateSong({
        ...formData,
        duration: totalSeconds,
        album: formData.album || undefined,
        audioFile,
      });
      // Don't close dialog or reset form here - let useEffect handle it after upload completes
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      
      // Try to get duration from audio file
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener('loadedmetadata', () => {
        const totalSeconds = Math.floor(audio.duration);
        setMinutes(Math.floor(totalSeconds / 60));
        setSeconds(totalSeconds % 60);
        setFormData(prev => ({ ...prev, duration: totalSeconds }));
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display">Songs</h1>
          <p className="text-muted-foreground mt-2">
            Manage Agent Eddie Sing's music catalog
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" data-testid="button-add-song">
              <Plus className="w-5 h-5 mr-2" />
              Upload Song
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            {isUploading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Uploading Song...</h3>
                  <p className="text-sm text-muted-foreground">
                    Give us a minute to upload your song
                  </p>
                </div>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Upload New Song</DialogTitle>
                  <DialogDescription>
                    Add a new Agent Eddie Sing track to the catalog
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Song Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Stand Up"
                  required
                  data-testid="input-song-title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  value={formData.artist}
                  onChange={(e) => setFormData(prev => ({ ...prev, artist: e.target.value }))}
                  placeholder="Eddie Sing & The 31 Days"
                  required
                  data-testid="input-song-artist"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="album">Album (optional)</Label>
                <Input
                  id="album"
                  value={formData.album}
                  onChange={(e) => setFormData(prev => ({ ...prev, album: e.target.value }))}
                  placeholder="The 31 Days Album"
                  data-testid="input-song-album"
                />
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="minutes" className="text-xs text-muted-foreground">Minutes</Label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      value={minutes || ""}
                      onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                      placeholder="3"
                      required
                      data-testid="input-song-minutes"
                    />
                  </div>
                  <div>
                    <Label htmlFor="seconds" className="text-xs text-muted-foreground">Seconds</Label>
                    <Input
                      id="seconds"
                      type="number"
                      min="0"
                      max="59"
                      value={seconds || ""}
                      onChange={(e) => setSeconds(Math.min(59, parseInt(e.target.value) || 0))}
                      placeholder="45"
                      required
                      data-testid="input-song-seconds"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audio">Audio File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="audio"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    required
                    data-testid="input-song-file"
                  />
                </div>
                {audioFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {audioFile.name}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isUploading} data-testid="button-submit-song">
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Song
                  </>
                )}
              </Button>
            </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {songs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Music2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">No songs yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your first Agent Eddie Sing track to get started
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Song
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {songs.map((song) => (
                <TableRow key={song.id} data-testid={`row-song-${song.id}`}>
                  <TableCell className="font-medium">{song.title}</TableCell>
                  <TableCell>{song.artist}</TableCell>
                  <TableCell>
                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteSong(song.id)}
                      data-testid={`button-delete-song-${song.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
