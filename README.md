# GameCentral

GameCentral is a video game library navigator designed to help players with large game collections decide what to play.

The goal of the project is to bring games from multiple gaming platforms into one central library and allow players to narrow their choices using preferences and filters.

## About the Project

Players with large game libraries across multiple platforms can have difficulty deciding what game to play.

GameCentral is designed to make that process easier by giving players one place to view their games and filter their collection based on what they want to play.

The current version contains the front page of the GameCentral website.

## Features

- Centralized game library
- Support for multiple gaming platforms
- Player preference filtering
- Game recommendations
- Responsive front-page design
- Local Flask web server

## Planned Workflow

The intended GameCentral workflow is:

1. The player connects their gaming platforms.
2. The player sets their preferences.
3. GameCentral compares those preferences against available games.
4. Matching games are filtered.
5. The player receives a list of games that match their preferences.

## Current Scope

The current project focuses on the GameCentral front page.

The interface currently includes:

- Navigation
- Game library preview
- Connected platform preview
- Preference filter preview
- Recommended game cards
- Responsive desktop and mobile styling

The preference buttons and other navigation options are currently visual elements and do not yet perform full filtering or account integration.

## Technologies

- Python
- Flask
- HTML5
- CSS3

## Project Structure

```text
GAMECENTRAL/
│
├── static/
│   └── style.css
│
├── app.py
├── index.html
├── README.md
└── requirements.txt