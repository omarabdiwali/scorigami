import { useEffect, useState } from "react";
import DisplayBoxScore from "./DisplayBoxScore";

function BoxScoreModal({ game, onClose }) {
  const { teams, status, detail, date } = game;

  const [gameData, setGameData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [team1Score, setTeam1Score] = useState(parseInt(teams[0].score));
  const [team2Score, setTeam2Score] = useState(parseInt(teams[1].score));
  const [isSmallHeight, setIsSmallHeight] = useState(false);

  useEffect(() => {
    const checkHeight = () => {
      setIsSmallHeight(window.innerHeight < 500);
    };
    
    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, []);

  useEffect(() => {
    if (!game) return;
    
    const fetchBoxScore = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch("/api/boxScore", { 
          method: "POST", 
          body: JSON.stringify({ gameId: game.id, status, teamOrder: [team1.name, team2.name] }) 
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (data.result !== "Invalid request.") {
          if (data.result.teams != undefined && data.result.teams != null) {
            game.teams[0].score = data.result.teams[0].score;
            game.teams[1].score = data.result.teams[1].score;
            setTeam1Score(parseInt(data.result.teams[0].score));
            setTeam2Score(parseInt(data.result.teams[1].score));
          }

          setGameData(data.result);
        } else {
          setError("Box score not available");
        }
      } catch (err) {
        console.error("Error fetching box score:", err);
        setError("Failed to load box score");
      } finally {
        setLoading(false);
      }
    };

    fetchBoxScore();
  }, [game]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!game) return null;

  const isFinal = status === "post";
  const isUpcoming = status === "pre";

  const team1 = teams[0];
  const team2 = teams[1];
  const team1Winner = isFinal && team1Score > team2Score;
  const team2Winner = isFinal && team2Score > team1Score;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
        style={{ 
          height: isSmallHeight ? '95vh' : '85vh',
          maxHeight: isSmallHeight ? '95vh' : '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="cursor-pointer absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className={`${isSmallHeight ? 'p-2' : 'p-4 sm:p-6'} border-b border-white/10 flex-shrink-0`}>
          
          {/* Mobile layout */}
          <div className="sm:hidden flex flex-col space-y-2">

            <div className="flex items-center justify-center space-x-3">
              <img src={team1.logo || '/default.png'} alt={team1.name} className={`object-contain ${isSmallHeight ? 'w-8 h-8' : 'w-12 h-12'}`} />
              <div className="text-center">
                <div className={`text-white font-medium ${isSmallHeight ? 'text-xs' : 'text-sm'}`}>{team1.name}</div>
                <div className="text-white opacity-40 text-xs">{team1.series ? team1.series : team1.record}</div>
                {!isUpcoming && (
                  <div className={`font-bold mt-1 ${
                    isFinal && team1Winner ? 'text-green-400' : 'text-white'
                  } ${isSmallHeight ? 'text-lg' : 'text-xl'}`}>
                    {team1Score}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              <img src={team2.logo || '/default.png'} alt={team2.name} className={`object-contain ${isSmallHeight ? 'w-8 h-8' : 'w-12 h-12'}`} />
              <div className="text-center">
                <div className={`text-white font-medium ${isSmallHeight ? 'text-xs' : 'text-sm'}`}>{team2.name}</div>
                <div className="text-white opacity-40 text-xs">{team2.series ? team2.series : team2.record}</div>
                {!isUpcoming && (
                  <div className={`font-bold mt-1 ${
                    isFinal && team2Winner ? 'text-green-400' : 'text-white'
                  } ${isSmallHeight ? 'text-lg' : 'text-xl'}`}>
                    {team2Score}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop layout */}
          <div className="hidden sm:flex justify-between items-center">
            <div className="flex flex-col items-center flex-1">
              <img src={team1.logo || '/default.png'} alt={team1.name} className={`object-contain mb-2 ${isSmallHeight ? 'w-12 h-12' : 'w-16 h-16'}`} />
              <span className={`text-white font-medium ${isSmallHeight ? 'text-xs' : 'text-sm'}`}>{team1.name}</span>
              <span className="text-white opacity-40 text-xs">{team1.series ? team1.series : team1.record}</span>
              {!isUpcoming && (
                <span className={`font-bold mt-1 ${
                  isFinal && team1Winner ? 'text-green-400' : 'text-white'
                } ${isSmallHeight ? 'text-xl' : 'text-2xl'}`}>
                  {team1Score}
                </span>
              )}
            </div>
            <div className="text-gray-400 font-bold text-xl mx-4">VS</div>
            <div className="flex flex-col items-center flex-1">
              <img src={team2.logo || '/default.png'} alt={team2.name} className={`object-contain mb-2 ${isSmallHeight ? 'w-12 h-12' : 'w-16 h-16'}`} />
              <span className={`text-white font-medium ${isSmallHeight ? 'text-xs' : 'text-sm'}`}>{team2.name}</span>
              <span className="text-white opacity-40 text-xs">{team2.series ? team2.series : team2.record}</span>
              {!isUpcoming && (
                <span className={`font-bold mt-1 ${
                  isFinal && team2Winner ? 'text-green-400' : 'text-white'
                } ${isSmallHeight ? 'text-xl' : 'text-2xl'}`}>
                  {team2Score}
                </span>
              )}
            </div>
          </div>

          <div className={`text-center text-gray-300 ${isSmallHeight ? 'text-xs mt-1' : 'text-sm mt-3 sm:mt-4'}`}>
            {isUpcoming ? (
              <>
                <div>{new Date(date).toLocaleDateString()}</div>
                <div className="text-gray-200 font-medium">
                  {new Date(date).toLocaleTimeString([], { timeStyle: "short" })}
                </div>
              </>
            ) : (
              <span>{detail}</span>
            )}
          </div>
        </div>

        <div className={`flex border-b border-white/10 flex-shrink-0 ${isSmallHeight ? 'py-1' : 'py-2 sm:py-3'}`}>
          {teams.map((team, index) => (
            <button
              key={index}
              className={`flex-1 transition-colors ${
                activeTeamIdx === index
                  ? 'cursor-auto text-blue-500'
                  : 'cursor-pointer text-gray-400 hover:text-white'
              } ${isSmallHeight ? 'text-xs py-1' : 'text-xs sm:text-sm py-2 sm:py-3'}`}
              onClick={() => setActiveTeamIdx(index)}
            >
              <span className="inline">{team.name}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 no-scrollbar overflow-auto p-3 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">{error}</div>
          ) : (
            <div className="no-scrollbar overflow-x-auto">
              <DisplayBoxScore data={gameData} loading={false} activeTeamIdx={activeTeamIdx} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GameCard({ game, onSelect }) {
  const gameDate = new Date(game.date);
  const isFinal = game.status == "post";
  const isLive = game.status == "in";
  const isUpcoming = game.status == "pre";
  const team1Winner = parseInt(game.teams[0].score) > parseInt(game.teams[1].score);
  const team2Winner = parseInt(game.teams[1].score) > parseInt(game.teams[0].score);

  return (
    <div 
      onClick={() => onSelect(game)} 
      className="bg-white/5 cursor-pointer backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
    >
      {game.gameDetail && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-300 text-center bg-white/5 rounded-md py-1 px-2">
            {game.gameDetail}
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isUpcoming ? 'bg-blue-500/20 text-blue-400' :
          isLive ? 'bg-red-500/20 text-red-400' :
          isFinal ? 'bg-green-500/20 text-green-400' : 'hidden'
        }`}>
          {isUpcoming ? 'UPCOMING' : isLive ? 'LIVE' : 'FINAL'}
        </span>
        {isLive && (
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
              <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                index === 0 
                  ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' 
                  : 'bg-gray-500/10 text-gray-300 border border-gray-500/20'
              }`}>
                {index === 0 ? 'H' : 'A'}
              </span>
              
              <img
                src={team.logo ? team.logo : '/default.png'}
                alt={team.name}
                className="w-10 h-10 object-contain flex-shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-white font-medium text-sm truncate">
                  {team.name}
                </span>
                <span className="text-white opacity-40 font-medium text-[0.65rem] truncate">
                  {team.record}{team.series ? `, ${team.series}` : ''}
                </span>
              </div>
            </div>
            <span className={`text-lg font-bold min-w-[2rem] text-right ${isUpcoming && "hidden"} ${
              isFinal && ((index == 0 && team1Winner) ? 'text-green-400' : (index == 1 && team2Winner) ? 'text-green-400' : 'text-gray-400')
            }`}>
              {team.score}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="text-xs text-gray-300 text-center">
          {isUpcoming ? (
            <>
              <div>{gameDate.toLocaleDateString()}</div>
              <div className="text-gray-200 font-medium">
                {gameDate.toLocaleTimeString([], { timeStyle: "short" })}
              </div>
            </>
          ) : (
            <span>{game.detail}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid p-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
  const [selectedGame, setSelectedGame] = useState(null);

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
            const aIsLive = a.status == "in";
            const bIsLive = b.status == "in";
            
            if (aIsLive && !bIsLive) return -1;
            if (!aIsLive && bIsLive) return 1;
            if (aIsLive && bIsLive) return aDate - bDate;
            
            const aIsUpcoming = a.status == "pre";
            const bIsUpcoming = b.status == "pre";
            
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

  const handleSelectGame = (game) => {
    setSelectedGame(game);
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
  };

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
    <>
      <div className="text-center mb-6 p-2">
        <h1 className="text-2xl font-semibold text-gray-600">NBA Game Center</h1>
        <p className="text-gray-400 text-sm">
          Real-time scores, upcoming games, and final results
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 p-6 lg:grid-cols-3 xl:grid-cols-4">
        {games.map((game) => (
          <GameCard 
            key={game.id} 
            game={game} 
            onSelect={handleSelectGame}
          />
        ))}
      </div>

      {selectedGame && (
        <BoxScoreModal 
          game={selectedGame} 
          onClose={handleCloseModal} 
        />
      )}
    </>
  );
}