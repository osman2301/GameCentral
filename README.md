# GameCentral

**GameCentral** is a browser-based video game library manager designed to help players organize games from multiple platforms in one centralized location.

The application supports games from online gaming platforms, allowing users to manage their collections, discover games to play, and launch supported games through their original platforms.

GameCentral is developed using **HTML, CSS, and object-oriented JavaScript**.

## Features

### Home
- View recent game activity and previously played games.
- See game information such as platform and play style.
- Navigate between Home, Library, and Discover.

### Game Library
- Manage games from Steam, Epic Games, and Battle.net.
- Add games manually, including games that are not installed.
- Search games by title.
- Filter games by gaming platform.
- Remove games from the library.
- Launch supported installed games.

### Add and Import Games
- Add games by selecting a platform and entering a game title.
- Search available Steam game listings.
- Import supported game information from launcher files.
- Keep track of owned games even if they are not installed.


## Discover: Pick Something for Me

The Discover feature helps players decide what to play based on how they feel and how much time they have available.

Players can use either filter individually or combine both to narrow their game selections.

### I'm Feeling...

Players can choose from eight moods:

- Adventurous
- Excited
- Spooked
- Creative
- Immersive
- Competitive
- Social
- Relaxed

### How Much Time Do I Have?

Players can choose from four time options:

- 15 Minutes or Less
- 30 Minutes
- 1 Hour
- More Than 1 Hour

### How Filtering Works

GameCentral uses game genres and metadata to identify games that match the selected filters.

- **Mood Only:** Displays games matching the selected mood.
- **Time Only:** Displays games matching the selected time availability.
- **Both Filters:** Displays games matching both selections.
- **No Matches:** Displays a message when no games match the selected filters.

GameCentral uses information from Wikidata to help determine game genres and modes.

Time recommendations are estimated based on game genres rather than actual gameplay duration.

### Surprise Me

The **Surprise Me** feature randomly selects a game from the matching results.

This allows players to quickly choose something to play without browsing their entire library.

## Game Launching

GameCentral supports launching games through their original gaming platforms when valid launch information is available.

- Launch supported installed games.
- Open platform-specific game launch URLs.
- Display warnings when games cannot be launched.
- Track recent launch activity when supported.


## Technologies Used

| Technology | Purpose |
|------------|---------|
| HTML5 | Application structure |
| CSS3 | User interface design |
| JavaScript | Application functionality |
| Object-Oriented Programming | Organizing game and library logic |
| jQuery | Interface functionality |
| Wikidata | Retrieving game genre and mode information |
| localStorage | Saving game library data |

## Getting Started

### Requirements

- A modern desktop web browser
- Visual Studio Code (recommended)
- Live Server extension for Visual Studio Code (recommended)
- Git (optional)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/osman2301/GameCentral.git
```

**2. Open the project folder**

```bash
cd GameCentral
```

**3. Open the project in Visual Studio Code**

**4. Launch the application**

Right-click `index.html` and select **Open with Live Server**.

**5. Start using GameCentral**

Navigate between Home, Library, and Discover.

No separate database server or JavaScript build process is required.

## How to Use

### Adding a Game

1. Open GameCentral.
2. Click **+ Add Game**.
3. Select Steam, Epic Games, or Battle.net.
4. Enter or select a game title.
5. Provide any required game information.
6. Add the game to your library.

Games that are not installed can still be added for tracking purposes.

### Importing Games

1. Open the Add Game window.
2. Choose a gaming platform.
3. Select an available import option.
4. Choose the supported files from your computer.
5. Review and add the detected games.

### Filtering Games

1. Navigate to **Discover**.
2. Select a mood under **I'm Feeling...**.
3. Select an available time under **How Much Time Do I Have?**.
4. Click **Filter** to display matching games.
5. Alternatively, click **Surprise Me** to receive a random recommendation.

Either filter can be used independently.

### Launching Games

1. Navigate to your game library.
2. Select a game.
3. Click **Play** when available.
4. Allow the browser to open the associated game launcher if prompted.

## Project Structure

| File / Folder | Description |
|---------------|-------------|
| `index.html` | Home page |
| `library.html` | Game library interface |
| `discover.html` | Mood and time filtering interface |
| `style.css` | Application styling |
| `Game.js` | Game model |
| `CentralLibrary.js` | Game collection and storage management |
| `PlatformLibrary.js` | Platform-specific game information |
| `ImportController.js` | Game import functionality |
| `LaunchController.js` | Game launching functionality |
| `OriginalPlatform.js` | Platform launch handling |
| `GameInfo.js` | Game metadata retrieval |
| `GameFilter.js` | Mood and time filtering logic |
| `static/` | Static application assets |
| `README.md` | Project documentation |

## Current Limitations

- Game libraries are stored locally in the browser.
- GameCentral does not currently support cloud synchronization.
- Game importing depends on supported launcher files.
- Mood filtering depends on available game metadata.
- Time availability is estimated using game genres.
- Game launching depends on the original platform and installation status.
