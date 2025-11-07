import fetch from 'node-fetch';

const BEARER_TOKEN = process.env.ACRCLOUD_BEARER_TOKEN!;
const BASE_URL = 'https://api-v2.acrcloud.com';
const BUCKET_ID = 28354;

async function getProjects() {
  console.log('🔍 Finding your Audio & Video Recognition projects...\n');
  
  const response = await fetch(`${BASE_URL}/api/base-projects`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to get projects: ${response.statusText}`);
  }

  const data = await response.json() as any;
  return data.data || [];
}

async function bindBucketToProject(projectId: number, projectName: string, currentBuckets: number[]) {
  console.log(`🔗 Binding bucket ${BUCKET_ID} to project ${projectId} (${projectName})...`);
  
  // Add new bucket to existing buckets (avoid duplicates)
  const buckets = Array.from(new Set([...currentBuckets, BUCKET_ID]));
  
  const response = await fetch(`${BASE_URL}/api/base-projects/${projectId}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${BEARER_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: projectName,
      buckets: buckets
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to bind bucket: ${response.statusText}\n${error}`);
  }

  console.log(`✅ Successfully bound bucket ${BUCKET_ID} to project!\n`);
  return await response.json();
}

async function main() {
  console.log('='.repeat(80));
  console.log('BINDING BUCKET TO PROJECT VIA API');
  console.log('='.repeat(80));
  console.log('');

  try {
    const projects = await getProjects();
    
    if (projects.length === 0) {
      console.error('❌ No Audio & Video Recognition projects found!');
      console.error('   Please create a project first in the ACRCloud console.');
      process.exit(1);
    }

    console.log(`Found ${projects.length} project(s):\n`);
    projects.forEach((p: any, i: number) => {
      console.log(`${i + 1}. ID ${p.id}: ${p.name}`);
      console.log(`   Region: ${p.region}`);
      console.log(`   Current buckets: ${p.buckets?.join(', ') || 'none'}`);
      console.log('');
    });

    // Use the first project (or you can select a specific one)
    const project = projects[0];
    
    await bindBucketToProject(project.id, project.name, project.buckets || []);

    console.log('='.repeat(80));
    console.log('SUCCESS!');
    console.log('='.repeat(80));
    console.log(`✅ Bucket ${BUCKET_ID} is now bound to project ${project.id}`);
    console.log('✅ Wait 2-3 minutes for indexing, then test recognition!');
    console.log('');

  } catch (error) {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  }
}

main();
