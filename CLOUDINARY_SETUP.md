# Cloudinary Setup Guide for Image Upload

## 📋 Quick Setup (5 minutes)

### Step 1: Create Cloudinary Account
1. Go to: https://cloudinary.com/users/register_free
2. Fill in your details:
   - Email address
   - Password
   - Select "Developer" as your role
3. Click **"Create Account"**
4. Check your email and verify your account

### Step 2: Get Your Cloud Name
1. After login, you'll see the **Dashboard**
2. Look for a box that shows:
   ```
   Cloud name: xxxxxxxxx
   API Key: xxxxxxxxx
   API Secret: xxxxxxxxx
   ```
3. **COPY YOUR CLOUD NAME** (the first one)
   - Example: `dqxjhzlqo` or `myapp123`

### Step 3: Create Upload Preset
1. Click the **Settings** icon (⚙️) in the top-right corner
2. In the left sidebar, click **"Upload"**
3. Scroll down to **"Upload presets"** section
4. Click **"Add upload preset"** button
5. Configure the preset:
   - **Upload preset name:** `chat-app`
   - **Signing Mode:** Select **"Unsigned"** ⚠️ (VERY IMPORTANT!)
   - **Folder:** (optional) You can type `chat-avatars`
   - Leave other settings as default
6. Click **"Save"** at the bottom

### Step 4: Update Your Code

#### File 1: `frontend/src/components/miscellanous/ProfileModal.jsx`
Find this line (around line 39):
```javascript
const cloudName = "YOUR_CLOUD_NAME"; // ⚠️ CHANGE THIS!
```

Replace `YOUR_CLOUD_NAME` with your actual cloud name:
```javascript
const cloudName = "dqxjhzlqo"; // Replace with YOUR cloud name
```

#### File 2: `frontend/src/components/Authentication/Signup.jsx`
Find this line (around line 31):
```javascript
const cloudName = "YOUR_CLOUD_NAME"; // ⚠️ CHANGE THIS!
```

Replace `YOUR_CLOUD_NAME` with your actual cloud name:
```javascript
const cloudName = "dqxjhzlqo"; // Replace with YOUR cloud name
```

### Step 5: Test It!
1. Restart your frontend if needed
2. Try uploading an image in signup or profile edit
3. It should work! ✅

---

## 🔍 Troubleshooting

### Error: "Upload preset not found"
- Make sure you created the preset named exactly `chat-app`
- Make sure you set it to **"Unsigned"** mode

### Error: "Invalid cloud name"
- Double-check you copied the correct cloud name from dashboard
- No spaces or special characters

### Error: "Upload failed"
- Check your internet connection
- Make sure the image is JPEG or PNG format
- Try a smaller image (< 5MB)

---

## 📝 Important Notes

1. **Free Tier Limits:**
   - 25 GB storage
   - 25 GB bandwidth/month
   - More than enough for a chat app!

2. **Unsigned Upload Preset:**
   - Must be set to "Unsigned" for frontend uploads
   - This is safe for public image uploads like profile pictures

3. **Security:**
   - For production apps, consider using signed uploads
   - Add folder restrictions in Cloudinary settings

---

## ✅ Quick Checklist

- [ ] Created Cloudinary account
- [ ] Verified email
- [ ] Copied Cloud Name from dashboard
- [ ] Created upload preset named `chat-app`
- [ ] Set preset to "Unsigned" mode
- [ ] Updated `ProfileModal.jsx` with cloud name
- [ ] Updated `Signup.jsx` with cloud name
- [ ] Tested image upload

---

## 🎯 Alternative: Use Environment Variables (Optional)

For better security, you can use environment variables:

1. Create `.env` file in frontend folder:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=chat-app
```

2. Update code to use:
```javascript
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
```

This keeps your cloud name out of the code!
