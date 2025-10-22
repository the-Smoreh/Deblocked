# ContentKeeper Deblocked

ContentKeeper Deblocked is an unblocked games hub that bundles curated HTML experiences, media assets, and a lightweight Node.js server so the site can be self-hosted behind restrictive filters. The project mixes static content with a Socket.IO-powered chat for live collaboration while browsing the catalog.

## Features
- **Static portal** that serves curated game shortcuts, embedded games, and supporting assets.
- **Express + Socket.IO backend** that keeps deployment simple while enabling a lightweight real-time chat channel.
- **JSON data files** (`games.json`, `gamelinks.json`, `embeddedgames.json`, etc.) that drive the dynamic content displayed in the front-end pages.

## Getting started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run start
   ```
   This launches the Express server defined in `server.js`, serving the site from the project root and enabling the Socket.IO chat endpoint.

## Project structure
- `index.html` – main landing page for the portal.
- `server.js` – Express server that serves static assets and powers the chat feature.
- `*.json` files – data sources used by the portal to populate games, forms, proxies, and other content sections.
- `hacks/`, `icon*.png`, `clash*.mp4` – supporting static assets available to the site.

## Deployment
The server binds to `0.0.0.0` and respects the `PORT` environment variable, making it suitable for hosts such as Railway or Render.

### Deploying to Railway
1. Create a new **Node.js** service in Railway and connect this repository (via GitHub) or upload the source.
2. Set the root directory to the project root (where `package.json` lives) and use the default start command:
   ```bash
   npm start
   ```
   Railway will run `node server.js`, which listens on the dynamic port exposed through the `PORT` environment variable.
3. In the Railway service settings, confirm the environment variable `PORT` is not hard-coded—Railway injects it automatically. Optionally, add `NODE_ENV=production`.
4. Redeploy. Once the build succeeds, open the **Logs** tab to ensure `✅ Server running on http://0.0.0.0:<port>` appears. If the server fails to boot, the logs will show the exception causing the “application failed to respond” screen.

### Troubleshooting "application failed to respond"
- **Command mismatch:** Make sure the Start Command is `npm start` (or `node server.js`). If the command exits immediately, Railway cannot serve requests.
- **Port binding:** Do not hard-code the port. `server.js` automatically uses `process.env.PORT`; editing it to a fixed number (e.g., 3000) causes Railway to display the failure page.
- **Long startup times:** Ensure static assets are bundled with the repo and that no blocking prompts (like `npm install` in `postinstall`) delay boot. Railway kills services that take too long to respond.
- **Runtime errors:** Check the deployment logs for stack traces. Common issues include missing JSON files or syntax errors in the data files. Fix the issue locally, push to GitHub, and redeploy.

For custom domains, point DNS to Railway and ensure Node.js 18+ is available.

## Contributing
1. Fork the repository and create a feature branch.
2. Commit changes with clear messages.
3. Open a pull request describing the update and any testing performed.

Feel free to tailor the JSON data or add new static pages to expand the unblocked content catalog.
