# Frontend Deployment (Render)

This frontend is a Next.js app (`frontend/`) and is configured to use your backend URL through an environment variable.

## Required Environment Variable

Set this in Render (Frontend service):

- `NEXT_PUBLIC_BACKEND_URL=https://your-backend-service.onrender.com`

Do not include trailing `/api` in this value.

## Render Service Settings (Frontend)

- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Node Version: `22` (recommended)

## Why Render Build Failed Earlier

Your logs showed:
- `Error occurred prerendering page "/payment-success"`

This was caused by `useSearchParams` usage in a statically prerendered route. The page now reads query params from `window.location.search` in `useEffect`, which is safe for production build.

## Local Test Before Deploy

From project root:

```bash
cd frontend
npm install
npm run build
npm run start
```

## Production Checklist

- `NEXT_PUBLIC_BACKEND_URL` points to live backend Render URL
- Backend CORS allows your frontend domain
- Backend is healthy (`/` endpoint responds)
- PhonePe / WhatsApp callback URLs are set to production backend domain

