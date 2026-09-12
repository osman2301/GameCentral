# 🎮 GameCentral

**GameCentral** is a video game library navigator designed to help players with large, multi-platform game collections decide what to play.

Instead of searching through several gaming platforms, GameCentral aims to bring a player's games into one central library and make it easier to narrow down choices based on preferences.

---

## 📌 Project Overview

Players with large game collections can spend too much time deciding what to play, especially when their games are spread across multiple platforms.

GameCentral is designed to solve that problem by allowing users to:

- View games from multiple platforms in one place
- Browse their game library
- Select preferences such as genre and play style
- Narrow their library using filters
- Receive a smaller list of games that match what they want to play

The current version of GameCentral is an early **front-end prototype** running on a local Python Flask server.

---

## 🎯 Project Goal

The main goal of GameCentral is to reduce the time players spend searching through their libraries.

The intended workflow is:

1. The player connects their gaming platforms.
2. Their games are collected into one library.
3. The player chooses preferences.
4. GameCentral compares those preferences with available games.
5. Matching games are displayed to the player.

---

## ✨ Current Prototype

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

## 🖥️ Technologies Used

GameCentral currently uses:

- **Python**
- **Flask**
- **HTML5**
- **CSS3**
- **Git**
- **GitHub**

No JavaScript framework or database is required for the current prototype.

---

## 📁 Project Structure

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

# 🚀 Getting Started

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

## 3. Create a Virtual Environment

Creating a virtual environment is recommended so the project dependencies stay separate from other Python projects.

On macOS or Linux:

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

On Windows:

```bash
python -m venv venv
```

Activate it with:

```bash
venv\Scripts\activate
```

After activation, your terminal may show:

```text
(venv)
```

before the folder name.

---

## 4. Install Project Requirements

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

# 🧭 Using the Current Prototype

## Quick Find

The **Quick Find** section allows the player to select:

- Genre
- Play style
- Time available

The intended final behavior is for GameCentral to use these selections to filter the player's library.

At the current prototype stage, these controls are visual and do not yet perform backend filtering.

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

# 📋 Current Project Scope

The current capstone scope focuses on:

- Combining a player's game library from multiple sources
- Allowing players to set filtering preferences
- Filtering games based on those preferences
- Returning a smaller list of suitable games

The project does **not** currently focus on:

- Installing games
- Launching games
- Chat features
- Social networking
- Group game selection
- Customer game reviews

---

# 🔄 Intended User Flow

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

---

# 🌿 Git and GitHub Workflow

## First-Time Git Setup

If the project folder has not been initialized with Git yet:

```bash
git init
```

Add all project files:

```bash
git add .
```

Create the first commit:

```bash
git commit -m "Initial GameCentral project"
```

Make sure the branch is named `main`:

```bash
git branch -M main
```

Connect the local project to GitHub:

```bash
git remote add origin https://github.com/osman2301/GameCentral.git
```

Then push the project:

```bash
git push -u origin main
```

---

## Updating GitHub After Making Changes

After editing the project, check which files changed:

```bash
git status
```

Add the changes:

```bash
git add .
```

Commit them:

```bash
git commit -m "Update GameCentral homepage"
```

Push them to GitHub:

```bash
git push
```

A normal update workflow is therefore:

```bash
git add .
git commit -m "Describe the changes"
git push
```

---

# 🔐 GitHub Authentication

GitHub no longer accepts normal account passwords for command-line Git operations over HTTPS.

If GitHub asks for authentication, use:

- Your GitHub username
- A GitHub Personal Access Token instead of your normal password

If you see:

```text
Password authentication is not supported for Git operations
```

you need to authenticate using a Personal Access Token or another supported GitHub authentication method.

---

# 🛠️ Troubleshooting

## `ModuleNotFoundError: No module named 'flask'`

Install Flask:

```bash
pip install flask
```

or:

```bash
pip3 install flask
```

Then run the application again.

---

## `python: command not found`

Try:

```bash
python3 app.py
```

instead of:

```bash
python app.py
```

---

## CSS Is Not Loading

Make sure the project structure contains:

```text
static/
└── style.css
```

The HTML should load the stylesheet using Flask:

```html
<link
    rel="stylesheet"
    href="{{ url_for('static', filename='style.css') }}"
>
```

---

## Flask Cannot Find `index.html`

GameCentral currently keeps `index.html` in the root project directory instead of a `templates` folder.

Because of that, `app.py` should contain:

```python
app = Flask(
    __name__,
    template_folder=".",
    static_folder="static"
)
```

---

## Port 5000 Is Already Being Used

If another program is using port `5000`, change the port in `app.py`.

For example:

```python
app.run(debug=True, port=5001)
```

Then open:

```text
http://127.0.0.1:5001
```

---

## Git Says `nothing to commit, working tree clean`

This means all current changes have already been committed.

It is not an error.

You can check your commits with:

```bash
git log --oneline
```

---

## Git Says `no upstream branch`

Run:

```bash
git push -u origin main
```

After the upstream branch is configured, future pushes can normally use:

```bash
git push
```

---

# 🔮 Future Development

Planned or possible future improvements include:

- Functional preference filtering
- Real game metadata
- Database support
- User accounts
- Saved player preferences
- Platform API integration
- Imported game libraries
- Search functionality
- Game details pages
- Library sorting
- Game tags
- Filtered recommendation results
- Additional pages for Library, Platforms, and Account settings

---

# 🧩 Preliminary Domain

The project currently centers around several main concepts:

- **Player**
- **Player Preference**
- **Library**
- **Game Platform**
- **Game**

A player's preferences are intended to filter the games available through their combined library.

---

# 📍 Project Status

**Current stage:** Prototype

The current focus is building and improving the GameCentral front-end experience before implementing the full filtering and platform integration functionality.

---

# 👥 Team

**Team Gamma**

---

# 🎓 Project

**Capstone Project**  
**Video Game Library Navigator**

GameCentral is being developed as a capstone project focused on making large video game libraries easier to navigate and helping players spend less time deciding what to play.