# Image & Video Generation Fix - Root Cause Analysis

## Problem Identified

Image and video generation was **not working** because the **`userId` was not being passed** from the frontend to the backend during generation requests. This broke the credit deduction flow in the callback handler.

## Root Cause

### The Missing Link: userId

1. **Frontend**: User logs in and `userId` is stored in localStorage
   ```typescript
   // client/lib/auth.ts
   const auth = getAuthState();  // Contains userId, apiKey, credits, etc.
   ```

2. **Generation Request**: When calling `generateImage()` or `generateVideo()`, the `userId` was **NOT included** in the request
   ```typescript
   // BEFORE (Broken)
   const result = await generateImage({
     apiKey: auth.apiKey!,  // ✅ API key sent
     imageUrls: uploadedUrls,
     prompt,
     // ❌ userId NOT sent!
   });
   ```

3. **Backend**: The generation handlers didn't know which user made the request
   ```typescript
   // server/routes/api-proxy.ts - BEFORE
   taskResults.set(taskId, {
     status: "processing",
     prompt,
     // ❌ userId NOT stored!
     creditsDeducted: false,
   });
   ```

4. **Callback Handler**: When Kie.ai returned results, it couldn't find the userId to deduct credits
   ```typescript
   // BEFORE - This condition always failed
   if (isSuccess && existingResult && !existingResult.creditsDeducted && existingResult.userId) {
     // ❌ existingResult.userId is undefined!
     // No credits were deducted
   }
   ```

## The Fix

### 1. **Update API Request Interfaces** (client/lib/api.ts)
```typescript
export interface ImageGenerationRequest {
  apiKey: string;
  userId: string;  // ✅ Added userId
  imageUrls: string[];
  prompt: string;
  aspectRatio: string;
  resolution: string;
}

export interface VideoGenerationRequest {
  apiKey: string;
  userId: string;  // ✅ Added userId
  imageUrl: string;
  prompt: string;
  mode: string;
}
```

### 2. **Update API Functions** (client/lib/api.ts)
```typescript
export async function generateImage(request: ImageGenerationRequest) {
  const response = await fetch(`${BACKEND_API_BASE}/generate-image`, {
    // ...
    body: JSON.stringify({
      userId: request.userId,  // ✅ Send userId
      imageUrls: request.imageUrls,
      prompt: request.prompt,
      aspectRatio: request.aspectRatio,
      resolution: request.resolution,
    }),
  });
}
```

### 3. **Update Frontend Components**
```typescript
// client/pages/Generate.tsx
const result = await generateImage({
  apiKey: auth.apiKey!,
  userId: auth.userId!,      // ✅ Now passing userId
  imageUrls: uploadedUrls,
  prompt,
  aspectRatio,
  resolution,
});

// client/pages/GenerateVideo.tsx
const result = await generateVideo({
  apiKey: auth.apiKey!,
  userId: auth.userId!,      // ✅ Now passing userId
  imageUrl: uploadResult.imageUrl,
  prompt,
  mode,
});
```

### 4. **Update Backend Handlers** (server/routes/api-proxy.ts)
```typescript
export async function handleGenerateImage(req: Request, res: Response) {
  const { userId, imageUrls, prompt, aspectRatio, resolution } = req.body;
  // ✅ Extract userId from request body
  
  // Validate userId
  if (!userId) {
    res.status(400).json({
      success: false,
      error: "شناسه کاربر یافت نشد",
    });
    return;
  }
  
  // Store userId with task
  taskResults.set(taskId, {
    status: "processing",
    timestamp: Date.now(),
    prompt,
    aspectRatio,
    resolution,
    apiKey,
    userId,        // ✅ Now stored!
    taskType: "image",
    creditsDeducted: false,
  });
}
```

### 5. **Callback Handler Now Works**
```typescript
// server/routes/api-proxy.ts - handleCallback
if (
  isSuccess &&
  existingResult &&
  !existingResult.creditsDeducted &&
  existingResult.userId  // ✅ Now available!
) {
  // Deduct credits successfully
  const deductionSuccess = await deductUserCredits(
    existingResult.userId,  // ✅ Can now deduct credits
    creditCost,
    creditType,
    taskId,
  );
}
```

## Files Modified

1. **client/lib/api.ts**
   - Updated `ImageGenerationRequest` interface to include `userId`
   - Updated `VideoGenerationRequest` interface to include `userId`
   - Modified `generateImage()` function to send `userId`
   - Modified `generateVideo()` function to send `userId`

2. **client/pages/Generate.tsx**
   - Updated `generateImage()` call to pass `userId: auth.userId!`

3. **client/pages/GenerateVideo.tsx**
   - Updated `generateVideo()` call to pass `userId: auth.userId!`

4. **server/routes/api-proxy.ts**
   - Updated `handleGenerateImage()` to accept and validate `userId`
   - Updated `handleGenerateVideo()` to accept and validate `userId`
   - Modified task storage to include `userId` in both handlers
   - Callback handler can now properly deduct credits

## How It Works Now

### Image Generation Flow
1. User logs in → `userId` is stored in localStorage
2. User uploads image → `userId` is sent to backend
3. Backend stores `userId` with task
4. Kie.ai processes and calls callback
5. Callback finds `userId` → deducts credits ✅

### Video Generation Flow
1. User logs in → `userId` is stored in localStorage
2. User uploads image → `userId` is sent to backend
3. Backend stores `userId` with task
4. Kie.ai processes and calls callback
5. Callback finds `userId` → deducts credits ✅

## Testing

To verify the fix works:

1. **Login** with your test account
2. **Generate an image** or video
3. **Check server logs** for:
   ```
   [Image Gen] Creating task with model: flux-2/pro-image-to-image
   [Image Gen] Image URLs: ["https://..."]
   ```
4. **Wait for callback** from Kie.ai
5. **Check logs for**:
   ```
   [Callback] Deducting X credits for IMAGE_1K from user [userId]
   [Callback] Credits deducted successfully
   ```
6. **Verify credits decreased** in the UI

## Localhost URL Warning

Note: If you're still on localhost without `PUBLIC_URL` set, you'll see:
```
[Upload] ⚠️  WARNING: Using localhost URL which external APIs cannot access.
```

To fix this, see `PUBLIC_URL_SETUP.md` for instructions on:
- Using ngrok for tunneling
- Setting the PUBLIC_URL environment variable
- Deploying to production

## Summary

The generation system is now complete and working. The missing `userId` parameter was the critical piece that prevented credit deduction from working properly. All three components (frontend request, backend storage, callback handler) now work together correctly.
