TIMELY - install as a web app (GitHub Pages)

1. Create a new GitHub repository (for example: my-goals). Public is fine.
2. Upload ALL files in this folder, keeping the "icons" folder:
   index.html, manifest.webmanifest, sw.js, icons/
3. In the repo go to Settings > Pages. Under "Build and deployment" choose
   Source: Deploy from a branch, Branch: main, folder: / (root). Save.
4. After a minute your app is live at:
   https://YOUR-USERNAME.github.io/my-goals/
5. Open that link in Chrome on your phone. Tap the menu and choose
   "Install app" (or "Add to Home screen"). On a laptop, use the install
   icon in the address bar.

Notes
- Your data is saved on the device you use. Use Export / Import (bottom of
  the app) to back up or move data between devices.
- To update the app later, replace index.html in the repo. If the old version
  still shows, change CACHE = "my-goals-v1" to "my-goals-v2" in sw.js.

ACCOUNT SYNC (Supabase)
- Tap "Sign in to sync" at the bottom of the app and create an account.
- Sign in with the same email and password on your other devices.
- The app works without an account too. Data then stays on the device.

GOOGLE SIGN-IN
- Enable the Google provider in Supabase (Authentication > Sign In / Providers).
- Add https://mzee678.github.io/my-goals/ under Authentication > URL Configuration > Redirect URLs.
- The first time someone signs in, the app asks what to call them.

PRIVACY POLICY
- privacy.html must be uploaded next to index.html. Link: https://mzee678.github.io/my-goals/privacy.html
