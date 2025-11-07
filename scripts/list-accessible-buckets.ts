import fetch from 'node-fetch';

const BEARER_TOKEN = process.env.ACRCLOUD_BEARER_TOKEN!;
const BASE_URL = 'https://api-v2.acrcloud.com';

async function listBuckets() {
  console.log('🔍 Checking which buckets we can access...\n');
  
  const response = await fetch(`${BASE_URL}/api/buckets`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`
    }
  });

  if (!response.ok) {
    console.error(`❌ Failed: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.error('Response:', text);
    process.exit(1);
  }

  const data = await response.json() as any;
  const buckets = data.data || [];
  
  console.log(`✅ Found ${buckets.length} accessible bucket(s):\n`);
  
  buckets.forEach((bucket: any) => {
    console.log(`📦 ID: ${bucket.id}`);
    console.log(`   Name: ${bucket.name}`);
    console.log(`   Type: ${bucket.type}`);
    console.log(`   Region: ${bucket.region}`);
    console.log('');
  });
  
  if (buckets.length === 0) {
    console.log('💡 No buckets found. We can create a new one!');
  } else {
    console.log('💡 We can use one of these buckets or create a new one.');
  }
}

listBuckets().catch(console.error);
