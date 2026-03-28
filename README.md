# Exam Canvas 📝

**Exam Canvas** is a highly interactive, truly **serverless** Mock Examination Portal and EdTech Whiteboarding application. Built primarily for academic instructors, it features a dual-mode interface, allowing standard students to take real-time assessments and features an "Instructor Preview" with a built-in canvas drawing engine for creating video solutions.

## Architecture & Tech Stack

This project replaces traditional backend databases with a localized JSON export engine out of the box, ensuring 100% free hosting as a **Static Site** via GitHub Pages.

- **Frontend Core:** Vite + React (JavaScript)
- **Styling UI:** Tailwind CSS v4 + Lucide Icons
- **Whiteboard Engine:** Rough.js (with canvas state retention)
- **Mathematical Rendering:** KaTeX
- **State Management:** Zustand (for massive whiteboard coordinates array optimization)

## Running Locally

To install and run the development environment on your machine:

```bash
# Install NPM Dependencies
npm install

# Run local Vite development server
npm run dev
```

## Creating & Adding Questions

Because Exam Canvas does not run a PostgreSQL or MongoDB backend (keeping your cloud costs at exactly $0), you manage your questions using the internal **Export Database** tool:

1. Click on the "**Switch to Instructor Mode**" button in the top right header.
2. Enter the **Instructor Dashboard**. Here, you will find a full CMS to natively build subjects, add multiple-choice questions (supports full KaTeX syntax), create Mock Exams, and randomly shuffle variants.
3. Click "**Classroom Preview**" on any subject to pull up a full exam instance. You can use the mouse to draw live diagrams and solve math problems directly on the UI using the Whiteboard.
4. When you are satisfied with your exam and annotations, return to the **Instructor Dashboard** and click "**Export Database (JSON)**".
5. A file named `data.json` will be downloaded. Simply replace the `public/data.json` file in this repository with that new file.

## Deploying to GitHub Pages 🚀

A GitHub Action is already set up to perfectly deploy this app to **GitHub Pages** for free global hosting!

1. Commit all your latest code and your updated `public/data.json`.
2. Push your `main` branch to your GitHub repository.
3. On your GitHub Repository page, go to **Settings > Pages**.
4. Set the **Source** under Build and deployment to **"GitHub Actions"**.
5. The `.github/workflows/deploy.yml` script will automatically compile your React app inside the cloud using `vite build` and instantly deploy it to \`<your-username>.github.io/<repository-name>\`.

### Note on Routing
If your GitHub repository is named `my-exam-portal`, you might notice some layout glitches if Vite doesn't know its root path. If you encounter missing assets, modify `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/my-exam-portal/', // Set this strictly to your Repo Name if not deploying to a custom domain!
})
```
