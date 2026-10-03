# My Notes - Gated Resource Hub

A completely static, HTML/CSS/JS web application that allows you to offer downloads behind a 6-step gated timer. 

## Features
- Fully client-side (Hosts freely on GitHub Pages).
- 6-step unlock system with state saved locally (refresh-proof).
- Complete JavaScript configuration (No HTML edits required for new posts).
- 6 predefined advertisement slots integrated safely for SPA navigation.
- Light/Dark mode auto-switch based on system preference.

---

## 🛠️ Step-by-Step Maintenance Guide

### 1. How to upload the files to GitHub
1. Create a free account on [GitHub](https://github.com/).
2. Click the **"+"** icon in the top right and select **New Repository**.
3. Name it something like `my-notes-website`, leave it Public, and click **Create repository**.
4. On the next screen, click the **"uploading an existing file"** link.
5. Drag and drop all the files from this folder (`index.html`, `style.css`, `script.js`, `robots.txt`, `sitemap.xml`) into the browser.
6. Click **Commit changes**.

### 2. How to enable GitHub Pages
1. Inside your repository on GitHub, click the **Settings** tab.
2. In the left sidebar, click **Pages**.
3. Under "Build and deployment", select **Deploy from a branch**.
4. Under "Branch", click the dropdown (usually says `None`), select `main` (or `master`), and click **Save**.
5. Wait 1-2 minutes. Refresh the page, and GitHub will show you the live link to your website at the top (e.g., `https://yourusername.github.io/my-notes-website/`).

### 3. Where to paste your advertising scripts
Your scripts are already pasted into the HTML in the provided version! If you ever need to change them, open `index.html`. Press `Ctrl+F` and search for `AD SLOT`. 
You will see clearly marked areas like this:
```html
<!-- ================= AD SLOT 1 ================= -->
<div class="ad-container top-ad">
    <!-- Paste code here -->
</div>
<!-- ============================================== -->
