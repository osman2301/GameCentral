# GameCentral

**GameCentral** is a video game library navigator designed to help players with large, multi-platform game collections decide what to play.

Instead of searching through several gaming platforms, GameCentral aims to bring a player's games into one central library and make it easier to narrow down choices based on preferences.

---

## Project Overview

Players with large game collections can spend too much time deciding what to play, especially when their games are spread across multiple platforms.

GameCentral is designed to solve that problem by allowing users to:

- View games from multiple platforms in one place
- Browse their game library
- Select preferences such as genre and play style
- Narrow their library using filters
- Receive a smaller list of games that match what they want to play

The current version of GameCentral is an early **front-end prototype** running on a local Python Flask server.

---

## Project Goal

The main goal of GameCentral is to reduce the time players spend searching through their libraries.

The intended workflow is:

1. The player connects their gaming platforms.
2. Their games are collected into one library.
3. The player chooses preferences.
4. GameCentral compares those preferences with available games.
5. Matching games are displayed to the player.

---

## Current Prototype

The current homepage includes:

- GameCentral navigation
- Quick game filtering form
- Genre selection
- Play-style selection
- Time-available selection
- Game library preview
- Recently added games
- Connected gaming platform section
- Three-step explanation of how GameCentral works
- Responsive desktop, tablet, and mobile layout

> **Note:** The current version is primarily a user-interface prototype.  
> The filters, platform connections, accounts, and game library data are not connected to a database or external gaming APIs yet.

---

## Technologies Used

GameCentral currently uses:

- **Python**
- **Flask**
- **HTML5**
- **CSS3**
- **Git**
- **GitHub**

No JavaScript framework or database is required for the current prototype.

---

## Project Structure

The project currently uses the following structure:

```text
GameCentral/
│
├── static/
│   └── style.css
│
├── app.py
├── index.html
├── README.md
└── requirements.txt
```

### File Descriptions

| File | Purpose |
|---|---|
| `app.py` | Starts the Flask web server and loads the homepage |
| `index.html` | Contains the GameCentral homepage |
| `static/style.css` | Contains all styling for the homepage |
| `requirements.txt` | Lists the Python packages required by the project |
| `README.md` | Project documentation and setup instructions |

---

# Getting Started

Follow the steps below to run GameCentral on your computer.

---

## 1. Install Python

Make sure Python is installed.

Check your version with:

```bash
python3 --version
```

You should see something similar to:

```text
Python 3.x.x
```

If `python3` does not work, try:

```bash
python --version
```

---

## 2. Clone the Repository

Clone the GameCentral repository from GitHub:

```bash
git clone https://github.com/osman2301/GameCentral.git
```

Then move into the project folder:

```bash
cd GameCentral
```

---

## 3. Install Project Requirements

Install the required Python packages:

```bash
pip install -r requirements.txt
```

If needed, use:

```bash
pip3 install -r requirements.txt
```

The current `requirements.txt` contains:

```text
Flask
```

---

## 5. Start the Local Server

Run:

```bash
python3 app.py
```

If your computer uses `python` instead:

```bash
python app.py
```

You should see output similar to:

```text
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

---

## 6. Open GameCentral

Open a browser and visit:

```text
http://127.0.0.1:5000
```

You can also use:

```text
http://localhost:5000
```

The GameCentral homepage should now be running locally.

---

## Library

The **Library** section demonstrates how games could be displayed after being imported into GameCentral.

Each game can eventually include information such as:

- Title
- Genre
- Gaming platform
- Tags
- Play style
- Estimated play time

The games currently displayed on the homepage are placeholder prototype data.

---

## Platforms

The platform section demonstrates how GameCentral could show connected gaming services.

The prototype currently displays examples including:

- Steam
- Epic Games
- Xbox
- PlayStation

Future versions can replace these placeholders with actual platform integrations.

---


# Intended User Flow

A typical GameCentral user should eventually be able to:

```text
Connect Platforms
       ↓
Import Game Library
       ↓
Choose Preferences
       ↓
Filter Games
       ↓
View Matching Games
       ↓
Choose What to Play
```

