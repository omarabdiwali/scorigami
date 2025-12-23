import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function GameCard({ game }) {
  const now = new Date();
  const gameDate = new Date(game.date);
  const isFinal = game.status.includes('Final');
  const isLive = gameDate < now && !isFinal;
  const isUpcoming = now < gameDate || game.status.includes("AM") || game.status.includes("PM");
  const team1Winner = parseInt(game.teams[0].score) > parseInt(game.teams[1].score);
  const team2Winner = parseInt(game.teams[1].score) > parseInt(game.teams[0].score);

  const formatScore = (score) => score || (isUpcoming ? '-' : '0');

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isUpcoming ? 'bg-blue-500/20 text-blue-400' :
          isLive ? 'bg-red-500/20 text-red-400' :
          isFinal ? 'bg-green-500/20 text-green-400' : 'hidden'
        }`}>
          {isUpcoming ? 'UPCOMING' : isLive ? 'LIVE' : 'FINAL'}
        </span>
        {isLive && !isUpcoming && (
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-1"></div>
            <span className="text-xs text-red-400">Live</span>
          </div>
        )}
      </div>

      <div className="flex flex-col space-y-3">
        {game.teams.map((team, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <img
                src={team.logo}
                alt={team.name}
                className="w-10 h-10 object-contain flex-shrink-0"
              />
              <span className="text-white font-medium text-sm truncate">
                {team.name}
              </span>
              <span className="text-white opacity-40 font-medium text-[0.65rem] truncate">
                ({team.record})
              </span>
            </div>
            <span className={`text-lg font-bold min-w-[2rem] text-right ${isUpcoming ? "hidden" : ""} ${
              isFinal && ((index == 0 && team1Winner) ? 'text-green-400' : (index == 1 && team2Winner) ? 'text-green-400' : 'text-gray-400')
            }`}>
              {formatScore(team.score)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-xs text-gray-300 text-center">
          {isUpcoming ? (
            <div>
              <div>{gameDate.toLocaleDateString()}</div>
              <div className="text-gray-200 font-medium">
                {gameDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          ) : (
            <span>{game.status}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, idx) => (
        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 h-40 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="h-6 w-16 bg-white/10 rounded-full"></div>
          </div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                  <div className="h-4 w-20 bg-white/10 rounded"></div>
                </div>
                <div className="h-6 w-8 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DisplayGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true);
        const resp = await fetch("/api/currentGames");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();

        if (Array.isArray(data.games)) {
          const sortedGames = data.games.sort((a, b) => {
            const aDate = new Date(a.date);
            const bDate = new Date(b.date);
            const now = new Date();

            const aIsFinal = a.status.includes("Final");
            const bIsFinal = b.status.includes("Final");
            const aIsLive = aDate < now && !aIsFinal;
            const bIsLive = bDate < now && !bIsFinal;
            
            if (aIsLive && !bIsLive) return -1;
            if (!aIsLive && bIsLive) return 1;
            if (aIsLive && bIsLive) return aDate - bDate;
            
            const aIsUpcoming = now < aDate || a.status.includes("AM") || a.status.includes("PM");
            const bIsUpcoming = now < bDate || b.status.includes("AM") || b.status.includes("PM");
            
            if (aIsUpcoming && !bIsUpcoming) return -1;
            if (!aIsUpcoming && bIsUpcoming) return 1;
            if (aIsUpcoming && bIsUpcoming) return aDate - bDate;
            
            return bDate - aDate;
          });
          
          setGames(sortedGames);
        } else {
          console.warn("API response does not contain a `games` array");
          setGames([]);
        }
      } catch (e) {
        console.error("Error fetching games:", e);
        setError("Unable to load games. Please try again later.");
        setGames([]);
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 text-lg mb-2">Error</div>
        <div className="text-gray-400">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">No games scheduled</div>
        <div className="text-gray-500 text-sm mt-1">Check back later for upcoming games</div>
      </div>
    );
  }

  return (
    <div className={`${geistSans.className} ${geistMono.className}`}>
      <div className="text-center mb-6 p-2">
        <h1 className="text-2xl font-semibold text-gray-600">NFL Game Center</h1>
        <p className="text-gray-400 text-sm">
          Real-time scores, upcoming games, and final results
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 p-6 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game, idx) => (
          <GameCard key={`${game.date}-${idx}`} game={game} />
        ))}
      </div>
    </div>
  );
}