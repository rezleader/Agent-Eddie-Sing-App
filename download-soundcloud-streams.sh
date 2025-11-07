#!/bin/bash

# Download SoundCloud streams in the format that matches what actually plays in the browser
# This will create WAV files that match the streaming fingerprints for ACRCloud

echo "🎵 Downloading SoundCloud streams for ACRCloud fingerprinting..."
echo ""
echo "Instructions:"
echo "1. Edit the URLs below to match your SoundCloud tracks"
echo "2. Run: bash download-soundcloud-streams.sh"
echo "3. Files will be saved to ./soundcloud-streams/"
echo "4. Upload these files to your ACRCloud bucket"
echo ""

# Create output directory
mkdir -p soundcloud-streams

# Add your SoundCloud URLs here - one per song
# Format: "Song Title|URL"
declare -a SONGS=(
  "Song1 - Some Justice Opportunity|https://soundcloud.com/YOUR_USERNAME/some-justice-opportunity"
  "Song2 - Moonlight Summer Dance|https://soundcloud.com/YOUR_USERNAME/moonlight-summer-dance"
  "Song3 - Stand Up|https://soundcloud.com/YOUR_USERNAME/stand-up"
  "Song4 - Is This Our America|https://soundcloud.com/YOUR_USERNAME/is-this-our-america"
  "Song5 - Mineola|https://soundcloud.com/YOUR_USERNAME/mineola"
  "Song6 - Please You|https://soundcloud.com/YOUR_USERNAME/please-you"
  "Song7 - The Dream|https://soundcloud.com/YOUR_USERNAME/the-dream"
  "Song8 - Come On Come On|https://soundcloud.com/YOUR_USERNAME/come-on-come-on"
  "Song9 - She's Taking Me With Her|https://soundcloud.com/YOUR_USERNAME/shes-taking-me-with-her"
  "Song10 - The Love|https://soundcloud.com/YOUR_USERNAME/the-love"
  "Song11 - Take The Dream|https://soundcloud.com/YOUR_USERNAME/take-the-dream"
)

# Download each song
for song_entry in "${SONGS[@]}"; do
  IFS='|' read -r title url <<< "$song_entry"
  
  echo "⬇️  Downloading: $title"
  echo "   URL: $url"
  
  # Download the STREAM version (not the download button) and convert to WAV
  # This matches what SoundCloud actually plays in the browser
  yt-dlp \
    --extract-audio \
    --audio-format wav \
    --audio-quality 0 \
    --output "soundcloud-streams/${title}.%(ext)s" \
    "$url"
  
  if [ $? -eq 0 ]; then
    echo "✅ Downloaded: $title"
  else
    echo "❌ Failed: $title"
  fi
  echo ""
done

echo ""
echo "🎉 Done! Files are in ./soundcloud-streams/"
echo ""
echo "Next steps:"
echo "1. Go to ACRCloud console: https://console.acrcloud.com"
echo "2. Open your 'American Split AI' bucket (ID: 28342)"
echo "3. Upload these WAV files from ./soundcloud-streams/"
echo "4. Wait for them to process (shows 'Ready' status)"
echo "5. Test your app!"
