import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Music2, Plus, Trash2, Upload } from "lucide-react";
import { type Song } from "@shared/schema";

interface SongsManagerProps {
  songs: Song[];
  onCreateSong: (data: { title: string; artist: string; album?: string; duration: number; audioFile: File }) => void;
  onDeleteSong: (songId: string) => void;
}

export function SongsManager({ songs, onCreateSong, onDeleteSong }: SongsManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    artist: "Eddie Sing & The 31 Days",
    album: "",
    duration: 0,
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (audioFile && formData.title && formData.artist && formData.duration > 0) {
      onCreateSong({
        ...formData,
        album: formData.album || undefined,
        audioFile,
      });
      setFormData({ title: "", artist: "Eddie Sing & The 31 Days", album: "", duration: 0 });
      setAudioFile(null);
      setDialogOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      
      // Try to get duration from audio file
      const audio = new Audio(URL.createObjectURL(file));
      audio.addEventListener('loadedmetadata', () => {
        setFormData(prev => ({ ...prev, duration: Math.floor(audio.duration) }));
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
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="240"
                  required
                  data-testid="input-song-duration"
                />
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

              <Button type="submit" className="w-full" data-testid="button-submit-song">
                <Upload className="w-4 h-4 mr-2" />
                Upload Song
              </Button>
            </form>
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
