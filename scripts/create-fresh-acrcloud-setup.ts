import fetch from 'node-fetch';

const BEARER_TOKEN = process.env.ACRCLOUD_BEARER_TOKEN!;
const BASE_URL = 'https://api-v2.acrcloud.com';

interface Bucket {
  id: number;
  name: string;
  region: string;
  type: string;
}

async function testToken() {
  console.log('🔍 Step 1: Testing bearer token...\n');
  
  const response = await fetch(`${BASE_URL}/api/buckets`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`
    }
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ Token test FAILED');
    console.error(`   Status: ${response.status} ${response.statusText}`);
    console.error(`   Response: ${error}\n`);
    console.error('⚠️  PROBLEM: The bearer token is not working.');
    console.error('   This token cannot access the ACRCloud API.\n');
    console.error('   Please check:');
    console.error('   1. Are you logged into the CORRECT ACRCloud account?');
    console.error('   2. Did you copy the FULL token (it should be very long - 500+ characters)?');
    console.error('   3. Is the token from "Personal Access Token" page (not project credentials)?');
    process.exit(1);
  }

  console.log('✅ Token works!\n');
  const data = await response.json() as any;
  return data.data || [];
}

async function createBucket(): Promise<number> {
  console.log('📦 Step 2: Creating new bucket for Eddie Sing songs...\n');
  
  const response = await fetch(`${BASE_URL}/api/buckets`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Eddie Sing - American Split AI',
      type: 'File',
      region: 'us-west-2',
      net_type: 1
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create bucket: ${response.status} ${response.statusText}\n${error}`);
  }

  const result = await response.json() as any;
  const bucketId = result.data?.id;
  
  if (!bucketId) {
    throw new Error('Bucket created but no ID returned');
  }

  console.log(`✅ Created bucket: ID ${bucketId}\n`);
  return bucketId;
}

async function main() {
  console.log('='.repeat(80));
  console.log('CREATING FRESH ACRCLOUD SETUP');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Step 1: Test token
    const buckets = await testToken();
    
    console.log(`📊 You currently have ${buckets.length} bucket(s) accessible\n`);
    
    if (buckets.length > 0) {
      console.log('Existing buckets:');
      buckets.forEach((b: Bucket) => {
        console.log(`  - ID ${b.id}: ${b.name} (${b.region})`);
      });
      console.log('');
    }

    // Step 2: Create new bucket
    const bucketId = await createBucket();

    console.log('='.repeat(80));
    console.log('SUCCESS - BUCKET CREATED!');
    console.log('='.repeat(80));
    console.log('');
    console.log(`✅ New Bucket ID: ${bucketId}`);
    console.log('✅ Bucket Name: Eddie Sing - American Split AI');
    console.log('✅ Region: us-west-2');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log(`   1. Update ACRCLOUD_BUCKET_ID secret to: ${bucketId}`);
    console.log('   2. Create new Audio & Video Recognition project in ACRCloud console');
    console.log('   3. Bind the new bucket to the new project');
    console.log('   4. Upload songs to the bucket');
    console.log('');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
