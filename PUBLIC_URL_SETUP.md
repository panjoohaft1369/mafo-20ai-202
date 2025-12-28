# PUBLIC_URL Setup Guide

## Overview

MAFO requires a **public URL** to work with the Kie.ai API for image and video generation. This is because Kie.ai is an external service that needs to:

1. **Access your uploaded images**: The images you upload must be accessible via public HTTP(S) URLs
2. **Send callback notifications**: Kie.ai needs to send completion notifications to a public callback endpoint

When running on `localhost`, the generated URLs (e.g., `http://localhost:8080/uploads/image.png`) are **not accessible** to external services like Kie.ai.

## Solutions

### Solution 1: Set PUBLIC_URL Environment Variable (Recommended)

This is the simplest approach for local development and testing.

#### Using ngrok (Free Tunneling Service)

**Step 1**: Download and install ngrok from https://ngrok.com/

**Step 2**: Start ngrok to tunnel your local port 8080:

```bash
ngrok http 8080
```

ngrok will output something like:

```
Forwarding   https://a1b2c3d4e5f6.ngrok.io -> http://localhost:8080
```

**Step 3**: Set PUBLIC_URL and run the dev server:

```bash
PUBLIC_URL=https://a1b2c3d4e5f6.ngrok.io npm run dev
```

Or on Windows (PowerShell):

```powershell
$env:PUBLIC_URL='https://a1b2c3d4e5f6.ngrok.io'; npm run dev
```

**Step 4**: Refresh the browser. The warning message will disappear, and you can now generate images!

### Solution 2: Deploy to Production

For production use, deploy MAFO to a hosting service:

#### Using Netlify (Recommended)

1. Push your code to GitHub/GitLab
2. Connect to Netlify and deploy
3. Use your Netlify domain (e.g., `https://my-mafo-site.netlify.app`) as PUBLIC_URL

#### Using Vercel

1. Deploy via Vercel's GitHub integration
2. Use your Vercel domain as PUBLIC_URL

#### Using Other Hosts

For any hosting service (AWS, DigitalOcean, Heroku, etc.):

1. Deploy the application
2. Set `PUBLIC_URL` environment variable to your domain

### Solution 3: Use .env File

Create a `.env` file in your project root (for development only):

```env
PUBLIC_URL=https://your-domain.com
```

Then run:

```bash
npm run dev
```

⚠️ **Note**: This method only works during `npm run dev`. For production, use your hosting provider's environment variable settings.

## What Happens When PUBLIC_URL is Set

1. **Image Upload**: When you upload an image, it's saved to `/public/uploads/` and a public URL is generated using your PUBLIC_URL
   - Example: `https://your-domain.com/uploads/1234567890-abc123.png`

2. **Generation Request**: The uploaded image URLs are sent to Kie.ai
   - Kie.ai can now access and download your images ✅

3. **Callback Notification**: Kie.ai sends completion callbacks to your callback endpoint
   - Example: `https://your-domain.com/api/callback`
   - Your server receives the generated image URL ✅

## Warning Message in UI

When running on `localhost`, you'll see a blue warning message:

```
ℹ️ توجه: شما روی محیط محلی (localhost) کار می‌کنید

برای استفاده از تولید تصویر، باید آدرس عمومی سرور خود را تنظیم کنید.
Kie.ai نمی‌تواند تصاویری را از localhost دانلود کند.
```

This message will **automatically disappear** once you:

- Set the `PUBLIC_URL` environment variable
- Refresh the browser page

## Server Logs

When generating an image, check your server logs (terminal output) to verify PUBLIC_URL is being used:

**With PUBLIC_URL set:**

```
[Upload] Public URL generated: https://your-domain.com/uploads/... (source: PUBLIC_URL env variable)
[Image Gen] Callback URL: https://your-domain.com/api/callback (source: PUBLIC_URL)
[Image Gen] Image URLs: ["https://your-domain.com/uploads/..."]
```

**Without PUBLIC_URL (localhost fallback):**

```
[Upload] ⚠️  WARNING: Using localhost URL which external APIs cannot access.
[Upload] ℹ️  Set PUBLIC_URL environment variable for production URLs:
[Image Gen] Image URLs: ["http://localhost:8080/uploads/..."]
[Image Gen] ⚠️  WARNING: 1 image URL(s) are localhost URLs which Kie.ai cannot access
```

## Troubleshooting

### Issue: Still getting localhost URLs after setting PUBLIC_URL

**Solution**: Restart your dev server after setting the environment variable

```bash
# Kill the current npm run dev (Ctrl+C)
PUBLIC_URL=https://your-domain.com npm run dev
```

### Issue: ngrok tunnel connection fails

**Solution**:

1. Make sure ngrok is properly installed: `ngrok --version`
2. Your firewall might be blocking ngrok. Try disabling it temporarily
3. Use ngrok with authentication if needed

### Issue: Image generation still fails with public URL

**Solution**:

1. Verify the PUBLIC_URL is actually accessible: Try visiting `{PUBLIC_URL}/uploads/` in your browser
2. Check Kie.ai logs at https://kie.ai/logs
3. Verify your firewall/proxy allows outbound connections to Kie.ai

## FAQ

**Q: Do I need PUBLIC_URL for development?**
A: Only if you want to test image/video generation. For UI development, you don't need it.

**Q: Can I use a free domain instead of ngrok?**
A: Yes! Services like Replit, Glitch, or Railway offer free domains for deployed apps.

**Q: What if I have a static IP address?**
A: You can set `PUBLIC_URL=http://your-ip-address:8080` (if port 8080 is publicly accessible).

**Q: Is ngrok free?**
A: Yes, the free tier works perfectly for development and testing.

**Q: Do I need PUBLIC_URL on production?**
A: Yes, you must set it to your production domain in your hosting provider's environment variables.
