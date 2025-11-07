# Required Secrets Setup

To enable ACRCloud automatic uploads and production database sync, you need to set up the following secrets:

## 1. ACRCloud Secrets

### ACRCLOUD_BEARER_TOKEN
This is your ACRCloud Console API token (different from recognition API credentials).

**How to get it:**
1. Log in to https://console.acrcloud.com
2. Go to **Account → Console API → Access Token**
3. Click "Create new token" if you don't have one
4. **IMPORTANT:** Copy the **actual token string** (long encoded text like "eyJhbGci..."), NOT the scopes
   - The scopes are just permissions like "bucket:write"
   - The bearer token is the long authentication string
5. The token should start with "Bearer " or just be the encoded string starting with "eyJ..."

### ACRCLOUD_BUCKET_ID
This is your custom bucket ID number.

**How to get it:**
1. Log in to https://console.acrcloud.com
2. Go to **Projects → Your Project (ID: 87666)**
3. Open bucket: **"American Split AI" (ID: 28342)**
4. The bucket ID is **28342**

**To add these secrets:**
1. Click "Tools" in the left sidebar
2. Click "Secrets"
3. Click "+" button to add new secret
4. Add both:
   - Key: `ACRCLOUD_BEARER_TOKEN`, Value: (your bearer token)
   - Key: `ACRCLOUD_BUCKET_ID`, Value: `28342`

---

## 2. Production Database URL

### PRODUCTION_DATABASE_URL
This is the Neon PostgreSQL connection string for your production database.

**How to get it:**
1. In Replit, go to your **published deployment** page
2. Open the deployment shell/console
3. Run: `replit secrets list`
4. Find `DATABASE_URL` and copy its full value (starts with `postgresql://`)

**To add this secret:**
1. Click "Tools" → "Secrets" → "+"
2. Key: `PRODUCTION_DATABASE_URL`, Value: (the postgresql:// URL from step 3)

---

## 3. After Adding Secrets

Once all secrets are set:

1. **Upload existing songs to ACRCloud:**
   ```bash
   npx tsx scripts/upload-to-acrcloud.ts
   ```
   This will upload all 11 songs from your database to ACRCloud's bucket.
   
2. **Sync development database to production:**
   ```bash
   npx tsx scripts/sync-production.ts
   ```
   This will copy all 11 songs and 827 challenges to production.

3. **Wait 5-10 minutes** for ACRCloud to process the uploaded songs (status should show "Ready")

4. **Test recognition** - Try scanning a song and it should recognize it with high confidence!

---

## Verification

After setup, you should see:
- ✅ ACRCloud Upload service logs when uploading songs
- ✅ Songs appear in ACRCloud console with "Ready" status
- ✅ Production database has 11 songs and 827 challenges
- ✅ Recognition works in both dev and production

---

## Troubleshooting

**ACRCloud upload fails:**
- Verify `ACRCLOUD_BEARER_TOKEN` is correct
- Verify `ACRCLOUD_BUCKET_ID` is `28342`
- Check ACRCloud console for API errors

**Production sync fails:**
- Verify `PRODUCTION_DATABASE_URL` starts with `postgresql://`
- Make sure it's the **production** database URL, not development

**Recognition still doesn't work:**
- Wait 5-10 minutes after upload for ACRCloud processing
- Check ACRCloud console - files should show "Ready" status
- Make sure you uploaded the correct audio files
