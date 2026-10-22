# GameCentral

**GameCentral** is a browser-based video game library manager designed to help players organize games from multiple platforms in one centralized location.

The application supports games from online gaming platforms, allowing users to manage their collections, discover games to play, and launch supported games through their original platforms.

GameCentral is developed using **HTML, CSS, and object-oriented JavaScript**.

## Features

### 1. Home Page
- Displays the user's most recently played game.
- Shows previously played games.
- Provides navigation between Home, Library, and Discover.
- Displays game information, including platform, play style, and estimated playtime.

### 2. Game Library
- Stores games from online gaming platforms.
- Allows users to manually add games.
- Displays saved games in a centralized library.
- Allows searching by game title and filtering by platform.
- Supports removing games from the library.

### 3. Import Game Library
GameCentral allows users to import game information from supported local launcher files.


Players can select detected games from the import interface and add them to their central library.

**Note:** The current implementation imports information from files selected on the user's computer. It does not directly authenticate with online gaming accounts or automatically synchronize entire online game libraries.

### 4. Launch Games
- Allows users to select games from their library.
- Validates available launch information.
- Generates platform-specific launch URLs.
- Supports launch requests through Steam, Epic Games, and Battle.net.
- Provides warnings when launch information is missing or unavailable.
- Can direct users to a platform store when direct launching is unavailable.

GameCentral attempts to open the appropriate game launcher. Actual launch success depends on the installed launcher, browser permissions, and valid game information.

### 5. Discover Games
- Provides a **Surprise Me** feature that randomly selects a game from the user's library.
- Allows filtering recommendations by play style.
- Recommends revisiting games that have not been played recently.
- Provides links to supported gaming storefronts.

### 6. Game Session Tracking
- Records recent launch activity.
- Estimates playtime based on the time between launching a game and returning to the browser.
- Updates game activity and estimated playtime.


### 7. Local Storage
GameCentral uses browser `localStorage` to save game information.

Saved data includes:
- Game title
- Platform
- Play style
- Launch ID
- Estimated playtime
- Last played information



### File Descriptions

| File | Description |
|---|---|
| `index.html` | Home page |
| `library.html` | Game library interface |
| `discover.html` | Game discovery interface |
| `Game.js` | Game object representation |
| `CentralLibrary.js` | Central library management |
| `PlatformLibrary.js` | Platform-specific game information |
| `ImportController.js` | Game importing functionality |
| `LaunchController.js` | Game launch coordination |
| `OriginalPlatform.js` | External launcher integration |
| `style.css` | Application styling |
| `README.md` | Project documentation |

## Installation and Setup

### Requirements
- A modern web browser, such as Chrome, Firefox, Edge, or Safari
- Visual Studio Code (recommended)
- Live Server extension for VS Code (recommended)
- Git (optional)

No Java, Python, Flask, PHP, or database server is required.

### Step 1: Clone the Repository

```bash
git clone https://github.com/osman2301/GameCentral.git
```

Navigate into the project:

```bash
cd GameCentral
```

Alternatively, download the repository as a ZIP file from GitHub.

### Step 2: Open the Project

1. Open Visual Studio Code.
2. Select **File → Open Folder**.
3. Open the `GameCentral` folder.
4. Locate `index.html`.

### Step 3: Run the Application

Using the Live Server extension:

1. Right-click `index.html`.
2. Select **Open with Live Server**.
3. The GameCentral Home page will open in your browser.

You can navigate between Home, Library, and Discover.

A local development server is recommended for consistent browser storage and file-handling behavior.

## How to Use GameCentral

### Adding a Game

1. Open GameCentral.
2. Click **+ Add Game**.
3. Select Steam, Epic Games, or Battle.net.
4. Enter the game's name.
5. Select a play style.
6. Provide a launch ID when available.
7. Click **Add Game**.

The game will be added to the central library.

### Importing Installed Games

1. Open the Add Game interface.
2. Select a supported platform.
3. Choose the option to load supported local launcher files.
4. Select the appropriate file or files from your computer.
5. Review the detected games.
6. Select a game and add it to GameCentral.

Imported game information can then be managed through the central library.

### Launching a Game

1. Open the Library page.
2. Select a game.
3. Click **Play**.
4. If a supported launch URL is available, GameCentral attempts to open the appropriate launcher.

The corresponding platform launcher must be installed and configured correctly.

### Discovering Games

1. Open the Discover page.
2. Use **Surprise Me** to select a random game.
3. Apply available play-style or unplayed-game filters.
4. View backlog and recently unplayed game suggestions.

