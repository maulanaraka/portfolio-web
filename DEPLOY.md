# Deployment Guide

## Hosting on GitHub Pages

1.  **Create a GitHub Repository**:
    - Go to GitHub and create a new repository (e.g., `my-portfolio`).

2.  **Push Code**:
    - Initialize git in your project folder:
      ```bash
      git init
      git add .
      git commit -m "Initial commit"
      ```
    - Link to your remote repository:
      ```bash
      git remote add origin https://github.com/YOUR_USERNAME/my-portfolio.git
      git push -u origin main
      ```

3.  **Configure GitHub Pages**:
    - Go to your repository **Settings**.
    - Scroll down to the **Pages** section.
    - Under **Source**, select `GitHub Actions` or `Deploy from a branch`.
    - If using `Deploy from a branch`, select `main` and `/ (root)`.
    - **Note**: Since this is a Vite project, you might need a build step.

### Recommended: Deploy using GitHub Actions (Easiest for Vite)

1.  Create a directory `.github/workflows` in your project.
2.  Create a file named `deploy.yml` inside it with the following content:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3.  Push this file to GitHub.
4.  Go to **Settings > Pages** and switch **Source** to **GitHub Actions**.
5.  Your site will be live at `https://YOUR_USERNAME.github.io/my-portfolio/`.
