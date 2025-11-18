# Vercel Environment Variables Setup

## Issue: API calls failing with "Failed to fetch" errors

### Solution: Configure Environment Variables in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Navigate to your project: `athukorala-traders-frontend`

2. **Add Environment Variables**
   - Go to `Settings` → `Environment Variables`
   - Add the following variables:

   **Variable Name:** `VITE_API_BASE`  
   **Value:** `https://athukorala-traders-backend.onrender.com`  
   **Environments:** Production, Preview, Development (check all)

   **Variable Name:** `VITE_API_BASE_URL`  
   **Value:** `https://athukorala-traders-backend.onrender.com`  
   **Environments:** Production, Preview, Development (check all)

3. **Redeploy**
   - After adding the environment variables, trigger a new deployment:
   - Go to `Deployments` tab
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger automatic redeployment

## Debug Tools

### 1. API Debug Dashboard
Visit: `https://athukorala-traders-frontend.vercel.app/api-debug`

This will show:
- Current environment configuration
- API endpoint tests
- Response times and errors
- CORS issues

### 2. Browser Console
Open browser dev tools and check console for:
```
CustomerProductApi Configuration: {
  VITE_API_BASE: "https://athukorala-traders-backend.onrender.com",
  API_BASE: "https://athukorala-traders-backend.onrender.com",
  PRODUCTS_PUBLIC: "https://athukorala-traders-backend.onrender.com/api/products",
  mode: "production"
}
```

## Expected Behavior After Fix

✅ Products should load without "Failed to fetch" errors  
✅ All API calls should use `https://athukorala-traders-backend.onrender.com`  
✅ No localhost references in production  
✅ CORS issues resolved  

## Backup Solution

If environment variables still don't work, the code now includes:
- **Retry mechanism**: Automatically retries failed requests
- **Fallback URLs**: Falls back to Render backend if localhost detected in production  
- **Better error handling**: More detailed error messages
- **Debug logging**: Console logs show exactly what URLs are being called

## Test Commands

```bash
# Test API endpoint directly
curl https://athukorala-traders-backend.onrender.com/api/products

# Should return HTTP 200 with product JSON array
```