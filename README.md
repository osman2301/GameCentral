# GameCentral

**GameCentral** is a video game library management application designed to help users organize, search, and launch games from multiple online gaming platforms in one centralized location.

The project focuses on applying **Java and Object-Oriented Programming (OOP)** principles to create a modular, organized, and maintainable application.

## Project Overview

Many players own games across multiple online platforms. Managing games across different platforms can make it difficult to organize a collection and decide what to play.

GameCentral aims to solve this problem by providing a centralized game library where users can manage their games and find something to play.

The application is designed to allow users to:

- Add games to their library.
- View games from multiple platforms.
- Search for games by title or platform.
- Filter games based on preferences.
- Select and launch supported games.
- Track recently played games and estimated playtime.

## Project Goal

The main goal of GameCentral is to simplify video game library management while demonstrating Object-Oriented Programming principles.

The project emphasizes:

- Encapsulation
- Abstraction
- Single Responsibility Principle
- Separation of concerns
- Modular application design

Each class will have a clearly defined responsibility to make the application easier to maintain and expand.

## Current Features

### 1. Import Games

Users can manually add games to their library.

Game information includes:

- Game title
- Gaming platform
- Launch ID (optional)
- Play style

The existing JavaScript implementation also includes an offline Steam game catalog that can help identify Steam game IDs.

### 2. Launch Games

Users can select a game from their library and attempt to launch it using the appropriate gaming platform.

The current JavaScript implementation supports launcher links for:

- Steam
- Epic Games
- Blizzard Battle.net

Launching a game requires a valid launch ID and the corresponding launcher installed on the user's computer.

### 3. Game Library

The Game Library allows users to:

- View added games.
- Search for games.
- Select games from the sidebar.
- View recently added games.
- View game details.
- Track estimated playtime.

### 4. Game Filtering

GameCentral provides filtering options to help users narrow down their game collection.

The interface includes:

- Genre
- Play style
- Time available

Filtering functionality will continue to be expanded as the application develops.

### 5. Playtime Tracking

GameCentral includes basic estimated playtime tracking.

When a supported game is launched, the application starts tracking a session. When the user returns to the browser, the elapsed time may be recorded.

This feature estimates playtime rather than measuring the actual game process.

## Object-Oriented Design

The project is being transitioned toward a Java-based implementation using separate classes for different responsibilities.

### Planned Java Classes

| Class | Responsibility |
|---|---|
| `Game` | Represents a game and its information |
| `GameLibrary` | Manages the collection of games |
| `ImportGameController` | Handles the process of importing games |
| `LaunchGameController` | Coordinates launching games |
| `GameRepository` | Handles saving and retrieving game data |

These are planned Java classes and have not yet been implemented in the provided project files.

### OOP Principles

**Encapsulation**

Each Java class will manage its own data and related behaviors.

**Abstraction**

Classes will expose important operations while hiding unnecessary implementation details.

**Single Responsibility Principle**

Each class will focus on one primary responsibility. For example, importing games and launching games will be handled by separate controllers.

**Separation of Concerns**

User interface code, business logic, and data storage will be separated into different components.

## Technologies Used

### Current Implementation

- HTML5 — Application structure
- CSS3 — User interface styling
- JavaScript — Current game library functionality
- jQuery — Interface interactions
- Browser localStorage — Local game data storage
- Git — Version control
- GitHub — Repository hosting and collaboration

### Planned Implementation

- Java — Object-oriented application logic
- Java classes and objects — Game management
- Database integration — Persistent storage, if required
- Java unit testing — Testing application behavior

Java is the intended implementation language for the business logic, but the current uploaded application still contains JavaScript logic.

## Project Structure

The current project files are:

```text
GameCentral/
│
├── ImportGame.js
├── LaunchGame.js
├── index.html
├── style.css
├── requirements.txt
└── README.md
```

### File Descriptions

| File | Description |
|---|---|
| `ImportGame.js` | Contains the offline Steam game catalog used for game ID lookup |
| `LaunchGame.js` | Handles platform-specific game launching and estimated playtime tracking |
| `index.html` | Contains the user interface, game library, and application interactions |
| `style.css` | Provides application styling |
| `requirements.txt` | Contains the former Flask dependency and is no longer required for the static prototype |
| `README.md` | Contains project documentation |

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/osman2301/GameCentral.git
```

Navigate to the project directory:

```bash
cd GameCentral
```

### 2. Open the Application

The existing prototype uses HTML, CSS, and JavaScript.

For basic interface testing, open `index.html` in a web browser.

Alternatively, use a local development server such as VS Code Live Server.

**Note:** Browser security restrictions may affect some functionality when opening files directly.

### 3. Add a Game

1. Open the GameCentral library.
2. Click **+ Add Game**.
3. Enter the game's title.
4. Select its platform.
5. Provide a launch ID if available.
6. Choose a play style.
7. Click **Add Game**.

The game should appear in the library.

### 4. Launch a Game

1. Select a game from the library.
2. Click the **Play** button.
3. If the game has a supported launch ID, GameCentral attempts to open its corresponding launcher.

The launcher must be installed and configured on the user's computer.



## Intended User Flow

```text
Start GameCentral
        |
        v
Open Game Library
        |
        v
Add / Import Game
        |
        v
View Game Collection
        |
        v
Search / Filter Games
        |
        v
Select Game
        |
        v
Check Launch Information
        |
        v
Launch Supported Game
```

