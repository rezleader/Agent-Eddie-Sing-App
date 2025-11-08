#!/usr/bin/env tsx
/**
 * Verify Production Environment Configuration
 * 
 * This script checks that all required environment variables are set
 * for a production deployment. Run this BEFORE deploying to catch
 * configuration issues early.
 */

const REQUIRED_ENV_VARS = [
  // Object Storage (CRITICAL)
  "PUBLIC_OBJECT_SEARCH_PATHS",
  "DEFAULT_OBJECT_STORAGE_BUCKET_ID",
  
  // Database (automatically set by Replit in production)
  "DATABASE_URL",
  
  // ACRCloud Music Recognition
  "ACRCLOUD_ACCESS_KEY",
  "ACRCLOUD_ACCESS_SECRET",
  "ACRCLOUD_HOST",
  "ACRCLOUD_BUCKET_ID",
  "ACRCLOUD_BEARER_TOKEN",
  
  // Session Security
  "SESSION_SECRET",
] as const;

const OPTIONAL_ENV_VARS = [
  "PGHOST",
  "PGPORT", 
  "PGUSER",
  "PGPASSWORD",
  "PGDATABASE",
] as const;

function verifyEnvironment() {
  console.log("🔍 Verifying Production Environment Configuration\n");
  
  const isProduction = process.env.REPLIT_DEPLOYMENT === "1";
  console.log(`Environment: ${isProduction ? '🚀 PRODUCTION' : '💻 DEVELOPMENT'}\n`);
  
  let hasErrors = false;
  const warnings: string[] = [];
  
  // Check required variables
  console.log("Required Environment Variables:");
  console.log("─".repeat(60));
  
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value) {
      console.log(`❌ ${varName}: MISSING`);
      hasErrors = true;
    } else {
      // Show first 50 chars or "***" for sensitive values
      const isSensitive = varName.includes("SECRET") || varName.includes("KEY") || varName.includes("PASSWORD") || varName.includes("TOKEN");
      const displayValue = isSensitive ? "***" : value.length > 50 ? value.substring(0, 50) + "..." : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  }
  
  // Check optional variables
  console.log("\n" + "─".repeat(60));
  console.log("Optional Environment Variables:");
  console.log("─".repeat(60));
  
  for (const varName of OPTIONAL_ENV_VARS) {
    const value = process.env[varName];
    if (!value) {
      console.log(`⚠️  ${varName}: not set (may be auto-configured)`);
      warnings.push(varName);
    } else {
      const isSensitive = varName.includes("PASSWORD");
      const displayValue = isSensitive ? "***" : value;
      console.log(`✅ ${varName}: ${displayValue}`);
    }
  }
  
  // Validate specific values
  console.log("\n" + "─".repeat(60));
  console.log("Configuration Validation:");
  console.log("─".repeat(60));
  
  // Check PUBLIC_OBJECT_SEARCH_PATHS format
  const searchPaths = process.env.PUBLIC_OBJECT_SEARCH_PATHS;
  if (searchPaths) {
    if (searchPaths.includes("/public")) {
      console.log(`✅ PUBLIC_OBJECT_SEARCH_PATHS has /public suffix`);
    } else {
      console.log(`⚠️  PUBLIC_OBJECT_SEARCH_PATHS missing /public suffix`);
      warnings.push("PUBLIC_OBJECT_SEARCH_PATHS should end with /public");
    }
  }
  
  // Check ACRCLOUD_BUCKET_ID is numeric
  const bucketId = process.env.ACRCLOUD_BUCKET_ID;
  if (bucketId && !/^\d+$/.test(bucketId)) {
    console.log(`⚠️  ACRCLOUD_BUCKET_ID should be numeric (got: ${bucketId})`);
    warnings.push("ACRCLOUD_BUCKET_ID should be a number");
  } else if (bucketId) {
    console.log(`✅ ACRCLOUD_BUCKET_ID is numeric: ${bucketId}`);
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  if (hasErrors) {
    console.log("❌ VERIFICATION FAILED");
    console.log("\nMissing required environment variables. Set them before deploying.");
    console.log("See PRODUCTION_DEPLOYMENT.md for complete list.");
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log("⚠️  VERIFICATION PASSED WITH WARNINGS");
    console.log(`\nFound ${warnings.length} warnings (may be OK):`);
    warnings.forEach(w => console.log(`  - ${w}`));
    console.log("\nDeployment can proceed, but review warnings.");
    process.exit(0);
  } else {
    console.log("✅ VERIFICATION PASSED");
    console.log("\nAll required environment variables are set.");
    console.log("Ready for deployment!");
    process.exit(0);
  }
}

// Run verification
verifyEnvironment();
