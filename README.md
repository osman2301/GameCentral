# GameCentral

**GameCentral** is a video game library management application designed to help players organize, browse, and launch games from multiple gaming platforms in one centralized location.

The project is being developed using **Java and Object-Oriented Programming (OOP)** principles. Its goal is to make managing large game collections easier while demonstrating the use of classes, objects, encapsulation, and separation of responsibilities.

---

## Project Overview

Players often own games across multiple platforms, such as Steam, Epic Games, Xbox, and PlayStation. Managing games across these platforms can make it difficult to keep track of a collection and decide what to play.

GameCentral aims to solve this problem by providing a centralized game library.

The application is designed to allow users to:

- Add games to their library.
- Organize games by platform.
- View and search their game collection.
- Filter games based on preferences.
- Select and launch supported games.
- Track recently played games and playtime.

## Project Goal

The main goal of GameCentral is to simplify game library management while applying Object-Oriented Programming principles to the application's design and implementation.

The project focuses on separating responsibilities between objects so that each class handles a specific part of the application's functionality.

---

## Core Features

### 1. Import Games

The Import Game feature allows users to add games to their GameCentral library.

Users can provide information such as:

- Game title
- Gaming platform
- Launch ID (when applicable)
- Play style

The application uses this information to create game entries and manage them within the library.

The existing prototype also includes an offline Steam game catalog for looking up Steam game IDs.

### 2. Launch Games

The Launch Game feature allows users to select a game from their library and attempt to launch it using the appropriate gaming platform.

The current prototype includes launcher URL support for:

- Steam
- Epic Games
- Blizzard Battle.net

Game launching depends on the selected platform, the availability of a valid launch ID, and whether the required launcher is installed.

Other platforms may require additional integration.

### 3. Game Library Management

GameCentral provides a centralized location where users can view their saved games.

Library functionality includes:

- Displaying available games
- Selecting individual games
- Searching for games by title or platform
- Viewing recently added games
- Organizing games by gaming platform

### 4. Game Filtering

GameCentral is designed to help players find games based on their preferences.

Filtering options include:

- Genre
- Play style
- Time available

The goal is to narrow down the user's library and make choosing a game easier.

### 5. Playtime Tracking

The existing prototype includes basic playtime tracking.

It estimates playtime based on when the user launches a game and returns to the application.

This provides an approximation rather than an exact measurement of time spent playing.

---

## Object-Oriented Design

GameCentral is being structured around Object-Oriented Programming principles.

The Java implementation is intended to organize the application's functionality into separate classes with clearly defined responsibilities.

### Planned Java Classes

| Class | Responsibility |
|---|---|
| `Game` | Represents an individual game and its information |
| `GameLibrary` | Manages the collection of games |
| `ImportGameController` | Coordinates importing games into the library |
| `LaunchGameController` | Coordinates launching a selected game |
| `GameRepository` | Handles storing and retrieving game information |

These classes represent the planned Java structure and may change as development continues.

### OOP Principles

**Encapsulation**

Game information and related behaviors are organized within Java classes. Each object is responsible for managing its own state.

**Abstraction**

Implementation details are separated from the operations used to interact with the application.

**Single Responsibility Principle**

Each class is designed to have one primary responsibility.

For example, the `ImportGameController` coordinates importing games, while the `LaunchGameController` handles game-launching operations.

**Separation of Concerns**

The user interface, business logic, and data storage are separated to make the application easier to understand, test, and maintain.

---

## Technologies Used

### Current Prototype

The existing prototype uses:

- Python and Flask
- JavaScript
- HTML5
- CSS3
- PHP
- MySQL integration code
- Git and GitHub

The current browser-based version also uses localStorage to save game information.

### Planned Java Implementation

The project is transitioning toward:

- **Java** — Application logic and object-oriented classes
- **JDBC** — Database communication
- **MySQL** — Persistent game storage
- **HTML/CSS** — User interface, if permitted by project requirements
- **Git/GitHub** — Version control and collaboration

The final user-interface technology and Java framework have not yet been selected.

---

## Current Project Structure

The existing prototype includes the following files:

```text
GameCentral/
│
├── app.py
├── database.php
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
| `app.py` | Starts the Flask development server |
| `database.php` | Provides PHP database operations |
| `ImportGame.js` | Contains the offline Steam game lookup catalog |
| `LaunchGame.js` | Contains game-launching and playtime-tracking logic |
| `index.html` | Contains the application interface and library interactions |
| `style.css` | Defines the application's appearance |
| `requirements.txt` | Lists Python dependencies |
| `README.md` | Documents the project |

**Note:** These are the files from the existing prototype. They have not yet been replaced with Java implementations.

---

## Planned Java Project Structure

The proposed Java application structure is:

```text
GameCentral/
│
├── src/
│   └── main/
│       └── java/
│           └── gamecentral/
│               ├── Main.java
│               ├── Game.java
│               ├── GameLibrary.java
│               ├── ImportGameController.java
│               ├── LaunchGameController.java
│               └── GameRepository.java
│
└── README.md
```

This structure is a development target and is subject to change.

---

## Getting Started

### Current Prototype

To run the existing Flask prototype:

**1. Clone the repository**

```bash
git clone https://github.com/osman2301/GameCentral.git
cd GameCentral
```

**2. Install Python dependencies**

```bash
pip install -r requirements.txt
```

**3. Run the Flask application**

```bash
python3 app.py
```

**4. Open the application**

Visit:

```text
http://127.0.0.1:5000
```

The Java implementation will have its own setup and execution instructions once its project structure and build process are established.

---

## Intended User Flow

```text
Start Application
        |
        v
Open Game Library
        |
        v
Import or Add Games
        |
        v
View Available Games
        |
        v
Search or Filter Library
        |
        v
Select a Game
        |
        v
Validate Launch Information
        |
        v
Launch Game
```

