GameCentral
GameCentral is a multi-platform video game library navigator developed by Team Gamma. It helps players keep a list of their games in one place, browse that list, narrow their choices, and launch supported PC games from the library interface.
Project Overview
Players with games across different launchers can spend time switching between platforms and deciding what to play. GameCentral provides a single library view with game search, play-style filtering, and a Play button for platforms that support direct-launch links.
Current status: This is a local prototype with working browser-side game management and launcher-link integration. It does not automatically synchronize the user's owned games from Steam, Epic Games, or other accounts.
Current Features
Add a game manually: Enter a title, choose a platform and play style, and optionally supply a launch ID.
Steam App ID assistance: The Add Game dialog searches an offline, bundled Steam title-to-App-ID list to fill in an ID. Users can also paste a Steam store URL or enter an ID themselves. The bundled catalog is a snapshot, not a live service.
Browse the library: View a selected game, a recently added shelf, and an all-games grid. The page shows an empty state before games are added.
Search and filter: Search the sidebar by title or platform; filter the all-games grid by play style (Single Player, Multiplayer, or Co-op).
Launch supported PC games: The Play button attempts to open the installed Steam, Epic Games, or Blizzard launcher using a platform-specific protocol URL when a valid launch ID is available.
Approximate play-session tracking: After a Play click, the app estimates session duration from the time until the browser tab becomes visible/focused again. Sessions shorter than 15 seconds are ignored. This is not game-process tracking or verified launcher playtime.
Browser-local persistence: Added games and recorded session data are saved in the browser's localStorage under gamecentral-games and persist across page refreshes in the same browser, unless browser storage is cleared.
The interface also displays Genre and Time Available selectors. Those selectors do not currently influence the matching results; the implemented Find Games action filters on play style.
Technologies Used
Python / Flask: Serves the homepage locally.
HTML5 and CSS3: Page structure and styling.
JavaScript (vanilla JS and jQuery): Library display, importing, filtering, storage, and launcher interactions. jQuery 3.7.1 is loaded from a CDN, so those handlers need network access unless jQuery is provided locally.
PHP / MySQL (separate endpoint): database.php includes a basic API to read and insert game records, but the supplied Flask page does not call this endpoint.
Git / GitHub: Source control and project hosting.
Project Structure
The supplied source files are:
GameCentral/
├── app.py              # Flask application, serves index.html
├── index.html          # Library interface and browser-side state
├── style.css           # Styles referenced by index.html
├── ImportGame.js       # Add Game dialog and bundled Steam ID lookup
├── LaunchGame.js       # Launcher links and session tracking
├── database.php        # Separate PHP/MySQL game GET/POST endpoint
├── requirements.txt    # Flask dependency
└── README.md           # This documentation
​
File placement note: index.html references style.css, ImportGame.js, and LaunchGame.js as relative URLs. The Flask configuration in app.py uses static_folder="static" and currently defines only the / route. Flask therefore does not automatically expose these root-level files at their referenced URLs. To run the entire interface through Flask, the project must place assets in Flask's served static folder and update the HTML asset URLs accordingly, or add routes for those assets. Merely starting app.py with the files laid out above is not enough to load the full styled, interactive page.
Getting Started
1. Install Python
Check that Python 3 is installed:
python3 --version
​
On systems that use python, run python --version instead.
2. Clone the repository
git clone <https://github.com/osman2301/GameCentral.git>
cd GameCentral
​
Or place the supplied project files in one folder.
3. Install dependencies
python3 -m pip install -r requirements.txt
​
requirements.txt currently contains Flask.
4. Configure static assets for Flask
For the provided app.py setup, move the three frontend assets into a static/ directory:
GameCentral/
├── app.py
├── index.html
├── static/
│   ├── style.css
│   ├── ImportGame.js
│   └── LaunchGame.js
├── database.php
├── requirements.txt
└── README.md
​
Then change the relevant references in index.html to:
<link rel="stylesheet" href="/static/style.css">
<script src="/static/LaunchGame.js"></script>
<script src="/static/ImportGame.js"></script>
​
The Steam lookup data is already bundled inside ImportGame.js; no separate Steam list download is required.
5. Run the Flask application
python3 app.py
​
Alternatively, use python app.py when appropriate. Open:
<http://127.0.0.1:5000>
​
Flask currently runs on port 5000 with debug mode enabled. Debug mode is intended for local development only.
6. Try the library
Click + Add Game.
Enter a game title and choose a platform and play style.
For a Steam game, check the suggested Launch ID; if necessary, paste its Steam store URL or enter the App ID manually.
Click Add Game. The game will appear in the library and be saved in browser storage.
Select a game in the sidebar. If its platform and Launch ID are supported and its launcher is installed, click Play to attempt to hand off to that launcher.
Search the sidebar or choose a play style and click Find Games to filter the all-games list.
Platforms and Launching
Platform option
Add to library
Direct launch in current code
Steam
Yes
steam://rungameid/<appId>
Epic Games
Yes
Epic launcher protocol; requires namespace:catalogItemId:appName
Blizzard
Yes
battlenet://<gameCode>
Xbox Game Pass
Yes
Not implemented
GOG
Yes
Not implemented
Other
Yes
Not implemented
A protocol link is an attempt to open the associated launcher; actual launching depends on browser permission prompts, whether that launcher is installed, the correctness of the ID, and platform-specific support. The current implementation does not launch games running on Xbox or PlayStation consoles.
Data Storage and Optional PHP Endpoint
The active web interface uses localStorage rather than a database. Each saved game can contain the following browser-side fields:
title
platform
playStyle
launchId
totalMinutes
lastPlayedAt
database.php is a separate, not-yet-integrated MySQL endpoint. Its current code connects to a local database named library with MySQL credentials configured directly in that file, and expects a table named game containing at least id, title, and platform columns. It supports:
GET: Return the saved games as JSON.
POST: Accept a JSON object with title and platform and insert a record. The title is required.
Running Flask alone does not execute PHP or initialize MySQL. Using this optional endpoint would require a PHP-enabled server, a configured MySQL database/table, appropriate credentials, and frontend integration. Do not use the example root/blank-password credentials in a deployed environment.
Known Limitations and Future Work
Game additions are manual; there is no automatic account connection, ownership verification, or platform-library sync.
Browser storage is local to one browser/profile, not shared across devices or users.
Genre and time-available inputs are visible but are not wired into recommendation/filter logic.
Playtime is an estimate based on tab focus/visibility, and may be inaccurate when the user switches tabs without starting or stopping the game.
Only Steam, Epic Games, and Blizzard have launch-link logic, and successful launching cannot be guaranteed.
The PHP/MySQL endpoint is separate from the current UI and stores fewer fields than the browser-side library.
Flask asset paths need the configuration changes described in Getting Started.
User accounts, authentication, sorting controls, and additional platform integrations are not established as functional by the supplied code.
Intended Future Workflow
Connect gaming platforms (planned)
              ↓
Import or synchronize libraries (planned)
              ↓
Browse and search games (implemented for manually added games)
              ↓
Choose preferences and filter (play-style filtering implemented)
              ↓
Choose a game to play
              ↓
Launch supported PC titles (launcher-link handoff implemented)