# Scorigami

![NFL Website](https://i.imgur.com/uejbUQv.png)

## Overview

Scorigami is a collection of web applications that track unique scores in various sports, also known as "scorigami." Scorigami is a concept thought up by Jon Bois, referring to a score that has never been seen before in a sport's history.

## Projects

The Scorigami project consists of multiple sub-projects, each tracking a different sport:

* **NBA Scorigami**: Tracks unique NBA scores and tweets from [@ScorigamiNBA_](https://x.com/ScorigamiNBA_)
	+ Visit the website at: https://scorigami-nba.vercel.app
	+ [Source code](https://github.com/omarabdiwali/scorigami/tree/main/nba)
	+ The application checks for new game scores every 2 minutes and tweets new scores from the [@ScorigamiNBA_](https://x.com/ScorigamiNBA_) Twitter account if a scorigami occurs.
	+ Includes an interactive box score modal that displays detailed player statistics for each team when viewing game details.
* **NFL Scorigami**: Tracks unique NFL scores and tweets from [@NFLScorigamiBot](https://x.com/NFLScorigamiBot)
	+ Visit the website at: https://nfl-scorigami.vercel.app
	+ [Source code](https://github.com/omarabdiwali/scorigami/tree/main/nfl)
	+ The application checks for new game scores every minute on gamedays and tweets new scores from the [@NFLScorigamiBot](https://x.com/NFLScorigamiBot) Twitter account if a scorigami occurs.
	+ Includes an interactive box score modal that displays detailed player statistics and team performance metrics when viewing game details.

## Technical Details

All sub-projects are built using Next.js and use the following technologies:

* **Frontend**: Next.js, React
* **Backend**: Next.js API routes
* **Database**: MongoDB (using Mongoose for ORM)
* **Twitter API**: Twitter-api-v2 library for interacting with the Twitter API

## Features

Both Scorigami applications feature an interactive chart showcasing all unique scores throughout the sport's history. The chart is updated daily and provides a visual representation of the scorigami data.

### NFL Features

The NFL application includes a live game center that displays:
* Real-time scores for ongoing games
* Upcoming scheduled games with dates and times
* Final results with winning teams highlighted
* Team logos, names, and current records
* Game status indicators, showing which team has possession
* **Interactive Box Score Modal**: Click on any game card to view detailed game information including:
  * Informative player statistics, broken down into their own sub-categories (passing, rushing, receiving, etc.)
  * Responsive design that works on mobile and desktop
  * Tabbed interface to switch between teams
  * Automatic info updates when viewing live games

### NBA Features

The NBA application includes a live game center with enhanced features:

* **Real-time Game Center**:
  * Real-time scores for ongoing games
  * Upcoming scheduled games with dates and times
  * Final results with winning teams highlighted
  * Team logos, names, and current records
  * Game status indicators (Live, Upcoming, Final)
  * **Interactive Box Score Modal**: Click on any game card to view detailed player statistics including:
    * Player positions and jersey numbers
    * Starter identification
    * Complete game statistics (points, rebounds, assists, etc.)
    * Team-specific scoring breakdowns
    * Responsive design that works on mobile and desktop
    * Tabbed interface to switch between teams
    * Automatic score updates when viewing live games

![NBA Chart](https://i.imgur.com/581a3DS.png)
![Game Center](https://i.imgur.com/T2qFe68.png)
![Box Score Modal](https://i.imgur.com/kfHABfJ.png)

## Setup

To set up a sub-project, navigate to its directory and follow the setup instructions in its README:

1. Clone the repository: `git clone https://github.com/omarabdiwali/scorigami.git`
2. Move into the sub-project directory (e.g. `nba` or `nfl`)
3. Install dependencies: `npm install`
4. Create a `.env` file with the following environment variables:
	* `API_KEY`: Twitter API key
	* `API_KEY_SECRET`: Twitter API key secret
	* `ACCESS_TOKEN`: Twitter access token
	* `ACCESS_TOKEN_SECRET`: Twitter access token secret
	* `MONGODB_URI`: MongoDB connection string
5. Start the application: `npm run dev`

## Usage

To use a sub-project, follow the usage instructions in its README:

1. Open the application in a web browser: `http://localhost:3000`
2. The application will display the latest scorigami data, including an interactive chart showcasing all unique scores and a live game center with current and upcoming games.
3. Click on any game card to open the box score modal with detailed player statistics. Use the tabs to switch between teams.
4. If a scorigami occurs, it will be tweeted from the respective Twitter account.