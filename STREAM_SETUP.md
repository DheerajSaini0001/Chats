# Stream Video & Audio Setup Guide

## 1. Create a Stream Account
1. Go to [GetStream.io](https://getstream.io/) and sign up.
2. Create a new app (select "Video & Audio" as the product).
3. You will get an **API Key** and **API Secret**.

## 2. Backend Configuration
Add these to your `backend/.env` file:
```env
STREAM_API_KEY=your_api_key_here
STREAM_API_SECRET=your_api_secret_here
```

## 3. Frontend Configuration
Add this to your `frontend/.env` file:
```env
VITE_STREAM_API_KEY=your_api_key_here
```

## 4. Implementation Details
- We will use your existing MongoDB User IDs as Stream User IDs.
- The backend will generate a token for the logged-in user.
- The frontend will use this token to connect to Stream Video.
