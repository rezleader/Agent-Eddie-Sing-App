import fs from 'fs';
import { acrCloudService } from '../server/acrcloud-service';

async function testRecognition() {
  console.log('='.repeat(80));
  console.log('TESTING ACRCLOUD RECOGNITION');
  console.log('='.repeat(80));
  console.log('');

  // Test with Mineola audio file
  const testFile = 'uploads/1762481411854-ba64bbc3-f621-4ffc-b3e7-c5f22ab80d83.wav';
  
  if (!fs.existsSync(testFile)) {
    console.error('❌ Test file not found:', testFile);
    process.exit(1);
  }

  console.log('📁 Test file: Mineola (Screaming Your Name In The Night)');
  console.log('🎯 Expected: Should recognize as Mineola from bucket 28354');
  console.log('');

  // Read first 15 seconds of audio (enough for recognition)
  const audioBuffer = fs.readFileSync(testFile);
  const sampleSize = Math.min(audioBuffer.length, 1024 * 1024); // 1MB max
  const testBuffer = audioBuffer.slice(0, sampleSize);

  console.log(`🎵 Testing recognition with ${(testBuffer.length / 1024).toFixed(0)}KB sample...`);
  console.log('');

  const result = await acrCloudService.recognizeAudio(testBuffer);

  console.log('='.repeat(80));
  if (result) {
    console.log('✅ RECOGNITION SUCCESSFUL!');
    console.log('='.repeat(80));
    console.log('');
    console.log('📋 Results:');
    console.log(`   Title: ${result.title}`);
    console.log(`   Artist: ${result.artist}`);
    console.log(`   Album: ${result.album || 'N/A'}`);
    console.log(`   Play Offset: ${(result.playOffsetMs / 1000).toFixed(1)}s`);
    console.log(`   Confidence: ${(result.confidence * 100).toFixed(0)}%`);
    console.log('');
    
    // Determine segment (60-second intervals)
    const segment = Math.min(Math.floor(result.playOffsetMs / 60000) + 1, 4);
    console.log(`🎯 Detected Segment: ${segment} (${Math.floor(result.playOffsetMs / 1000)}s into song)`);
    console.log('');
  } else {
    console.log('❌ RECOGNITION FAILED');
    console.log('='.repeat(80));
    console.log('');
    console.log('⚠️  No match found. Possible reasons:');
    console.log('   1. Indexing not complete (wait 3-5 minutes total)');
    console.log('   2. Bucket not properly bound to project');
    console.log('   3. Audio quality too different from original');
    console.log('');
  }
}

testRecognition().catch(console.error);
