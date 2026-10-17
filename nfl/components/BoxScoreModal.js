import { useState, useEffect } from "react";
import DisplayBoxScore from "./DisplayBoxScore";

function LineScoreTable({ className, data }) {
  const headClass = "border-b border-slate-600 p-2 pt-0 pb-2 text-slate-200";
  const dataClass = "border-b border-slate-700 p-2 text-slate-400";

  if (!data) return;
  const team1 = data.at(0);
  const team2 = data.at(1);

  if (!team1 || !team2 || !team1.points || !team2.points) return;
  const quarters = Math.max(4, Math.max(team1.points.length, team2.points.length) - 1);

  return (
    <table className={`${className} table-auto text-sm sm:text-[1.25vh]`}>
      <thead>
        <tr>
          <th className={`${headClass} text-left`}>Name</th>
          {Array(quarters).fill(0).map((_, qtr) => {
            const label = qtr < 5 ? ['1', '2', '3', '4', 'OT'].at(qtr) : `${qtr-3}OT`;
            return (
              <th key={label} className={`${headClass} text-center`}>
                {label}
              </th>
            )
          })}
          <th className={`${headClass} text-center`}>T</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={`${dataClass} text-left`}>{team1.name}</td>
          {Array(quarters).fill(0).map((_, qtr) => {
            const score = qtr >= team1.points.length ? '-' : team1.points.at(qtr);
            return (
              <td key={`${team1.name}-${qtr}`} className={`${dataClass} text-center`}>{score}</td>
            )
          })}
          <td className={`${dataClass} font-black text-center`}>{team1.points.at(-1)}</td>
        </tr>
        <tr>
          <td title={team2.name} className={`${dataClass} text-left`}>{team2.name}</td>
          {Array(quarters).fill(0).map((_, qtr) => {
            const score = qtr >= team2.points.length ? '-' : team2.points.at(qtr);
            return (
              <td key={`${team2.name}-${qtr}`} className={`${dataClass} text-center`}>{score}</td>
            )
          })}
          <td className={`${dataClass} font-black text-center`}>{team2.points.at(-1)}</td>
        </tr>
      </tbody>
    </table>
  )
}

export function BoxScoreModalInfo({ game, onClose }) {
  const { teams, status, detail, date } = game;

  const [gameData, setGameData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [team1Score, setTeam1Score] = useState(teams ? parseInt(teams[0].score) : null);
  const [team2Score, setTeam2Score] = useState(teams ? parseInt(teams[1].score) : null);
  const [clock, setClock] = useState(detail);
  const [downDistance, setDownDistance] = useState(game.downDistance);
  const [possession, setPossession] = useState(game.possession);
  const [isSmallHeight, setIsSmallHeight] = useState(false);
  const [showLinescore, setShowLinescore] = useState(false);
  const [linescoreData, setLineScoreData] = useState(null);

  useEffect(() => {
    let timeoutId = null;
    const debouncedCheckHeight = (skipTimeout=false) => {
      if (skipTimeout) {
        const height = window.innerHeight;
        setIsSmallHeight(height < 550);
        setShowLinescore(height > 750);
        return;
      }

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const height = window.innerHeight;
        setIsSmallHeight(height < 550);
        setShowLinescore(height > 750);
      }, 150)
    };
    
    debouncedCheckHeight(true);
    window.addEventListener('resize', debouncedCheckHeight);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheckHeight);
    }
  }, []);

  useEffect(() => {
    if (!game) return;
    
    const fetchBoxScore = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch("/api/boxScore", { 
          method: "POST", 
          body: JSON.stringify({ gameId: game.id, date, status, teamOrder: [team1.name, team2.name] }) 
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (data.result !== "Invalid request.") {
          if (data.result.teams != undefined && data.result.teams != null) {
            game.teams[0].score = data.result.teams[0].score;
            game.teams[1].score = data.result.teams[1].score;
            game.detail = data.result.clock;
            game.status = data.result.status;
            game.downDistance = data.result.downDistance;
            game.possession = data.result.possession;
            setTeam1Score(parseInt(data.result.teams[0].score));
            setTeam2Score(parseInt(data.result.teams[1].score));
            setClock(data.result.clock);
            setDownDistance(data.result.downDistance);
            setPossession(data.result.possession);

            if (data.result.teams[0].linescore && data.result.teams[1].linescore) {
              const linescoreTeam1 = { name: data.result.teams[0].team, points: data.result.teams[0].linescore };
              const linescoreTeam2 = { name: data.result.teams[1].team, points: data.result.teams[1].linescore };
              setLineScoreData([linescoreTeam1, linescoreTeam2])
            }
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

  const isLive = status === "in";
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
          height: isSmallHeight ? '90vh' : '85vh',
          maxHeight: isSmallHeight ? '90vh' : '85vh'
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
          {game.gameDetail && (
              <div className="text-xs font-medium text-gray-300 text-center mb-2 py-1 px-2">
                {game.gameDetail}
              </div>
          )}
          {showLinescore && (
            <div className="text-center">
              {!isUpcoming && <div className="sm:text-sm text-xs">{clock}</div>}
              {isLive && downDistance && <div className="pt-1 pb-2 text-xs sm:pb-0 text-gray-400">{downDistance}</div>}
            </div>
          )}
          
          {/* Mobile layout */}
          <div className="sm:hidden flex flex-col space-y-2">
            <div className="flex items-center justify-center space-x-3">
              <img src={team1.logo || '/default.png'} alt={team1.name} className={`object-contain ${isSmallHeight ? 'w-8 h-8' : 'w-12 h-12'}`} />
              <div className="text-center">
                <div className={`text-white font-medium ${isSmallHeight ? 'text-xs' : 'text-sm'}`}>{team1.name}</div>
                <div className="text-white opacity-40 text-xs">{team1.record}</div>
                {!isUpcoming && (
                  <div className={`font-bold mt-1 ${
                    isFinal && team1Winner ? 'text-green-400' : possession == team1.name ? 'text-orange-400' : 'text-white'
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
                <div className="text-white opacity-40 text-xs">{team2.record}</div>
                {!isUpcoming && (
                  <div className={`font-bold mt-1 ${
                    isFinal && team2Winner ? 'text-green-400' : possession == team2.name ? 'text-orange-400' : 'text-white'
                  } ${isSmallHeight ? 'text-lg' : 'text-xl'}`}>
                    {team2Score}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop layout */}
          <div className="hidden sm:flex justify-between items-center">
            <div className="relative flex flex-col items-center flex-1">
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
              {possession == team1.name && (
                  <img 
                    src={"/football.png"} 
                    alt={"Poss."} 
                    className="absolute bottom-[-26%] w-10 h-10" 
                  />
                )}
            </div>
            <div className="text-gray-400 font-bold text-xl mx-4">VS</div>
            <div className="relative flex flex-col items-center flex-1">
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
              {possession == team2.name && (
                  <img 
                    src={"/football.png"} 
                    alt={"Poss."} 
                    className="absolute bottom-[-26%] w-10 h-10" 
                  />
                )}
            </div>
          </div>

          <div className={`${isUpcoming ? 'text-center' : 'flex justify-center'} text-gray-300 ${isSmallHeight ? 'text-xs mt-1' : 'text-sm mt-3 sm:mt-4'}`}>
            {isUpcoming ? (
              <>
                <div>{new Date(date).toLocaleDateString()}</div>
                <div className="text-gray-200 font-medium">
                  {new Date(date).toLocaleTimeString([], { timeStyle: "short" })}
                </div>
              </>
            ) : (
              <>
                {showLinescore ? <LineScoreTable data={linescoreData} /> : (
                  <div className="text-center">
                    <div>{clock}</div>
                    {isLive && downDistance && <div className="pt-1 text-xs text-gray-400">{downDistance}</div>} 
                  </div>
                )}
              </>
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

export function BoxScoreModalResults({ game, onClose }) {
  const [gameData, setGameData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  
  const [team1Data, setTeam1Data] = useState(game.teams[0]);
  const [team2Data, setTeam2Data] = useState(game.teams[1]);
  const [details, setDetails] = useState(null);
  
  const [clock, setClock] = useState(null);
  const [isSmallHeight, setIsSmallHeight] = useState(false);
  const [showLinescore, setShowLinescore] = useState(false);
  const [linescoreData, setLineScoreData] = useState(null);

  useEffect(() => {
    let timeoutId = null;
    const debouncedCheckHeight = (skipTimeout=false) => {
      if (skipTimeout) {
        const height = window.innerHeight;
        setIsSmallHeight(height < 550);
        setShowLinescore(height > 750);
        return;
      }

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const height = window.innerHeight;
        setIsSmallHeight(height < 550);
        setShowLinescore(height > 750);
      }, 150)
    };
    
    debouncedCheckHeight(true);
    window.addEventListener('resize', debouncedCheckHeight);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedCheckHeight);
    }
    }, []);

  useEffect(() => {
    const fetchBoxScore = async () => {
      setLoading(true);
      setError(null);
      try {
        const teamOrder = [game.teams[0].team, game.teams[1].team];
        const resp = await fetch("/api/boxScore", { 
          method: "POST", 
          body: JSON.stringify({ gameId: game.id, status: 'post', teamOrder, info: true }) 
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (data.result !== "Invalid request.") {
          if (data.result.teams != undefined && data.result.teams != null) {
            setTeam1Data(data.result.teams[0]);
            setTeam2Data(data.result.teams[1]);
            setClock(data.result.clock);

            if (data.result.teams[0].linescore && data.result.teams[1].linescore) {
              const linescoreTeam1 = { name: data.result.teams[0].team, points: data.result.teams[0].linescore };
              const linescoreTeam2 = { name: data.result.teams[1].team, points: data.result.teams[1].linescore };
              setLineScoreData([linescoreTeam1, linescoreTeam2])
            }
          }
          setDetails(data.result.gameDetails);
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

  const team1Winner = game.teams[0].score > game.teams[1].score;
  const team2Winner = game.teams[1].score > game.teams[0].score;

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
          height: isSmallHeight ? '90vh' : '85vh',
          maxHeight: isSmallHeight ? '90vh' : '85vh'
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
          {details && (
              <div className="text-xs font-medium text-gray-300 text-center mb-2 py-1 px-2">
                {details}
              </div>
          )}
          
          {showLinescore && (
            <div className="text-center">
              <div className="sm:text-sm text-xs">{clock}</div>
            </div>
          )}
          
          {/* Mobile layout */}
          <div className="sm:hidden flex flex-col space-y-2">
            <div className="flex items-center justify-center space-x-3">
              {!loading && <img src={team1Data.logo || '/default.png'} alt={team1Data.team} className={`object-contain ${isSmallHeight ? 'w-8 h-8' : 'w-12 h-12'}`} />}
              <div className="text-center">
                <div className={`text-white font-medium ${isSmallHeight ? 'text-xs' : 'text-sm'}`}>{team1Data.team}</div>
                <div className="text-white opacity-40 text-xs">{team1Data.record}</div>
                <div className={`font-bold mt-1 ${team1Winner ? 'text-green-400' : 'text-white'} ${isSmallHeight ? 'text-lg' : 'text-xl'}`}>
                  {team1Data.score}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-3">
              {!loading && <img src={team2Data.logo || '/default.png'} alt={team2Data.team} className={`object-contain ${isSmallHeight ? 'w-8 h-8' : 'w-12 h-12'}`} />}
              <div className="text-center">
                <div className={`text-white font-medium ${isSmallHeight ? 'text-xs' : 'text-sm'}`}>{team2Data.team}</div>
                <div className="text-white opacity-40 text-xs">{team2Data.record}</div>
                <div className={`font-bold mt-1 ${team2Winner ? 'text-green-400' : 'text-white'} ${isSmallHeight ? 'text-lg' : 'text-xl'}`}>
                  {team2Data.score}
                </div>
              </div>
            </div>
          </div>
          
          {/* Desktop layout */}
          <div className="hidden sm:flex justify-between items-center">
            <div className="relative flex flex-col items-center flex-1">
              {!loading && <img src={team1Data.logo || '/default.png'} alt={team1Data.team} className={`object-contain mb-2 ${isSmallHeight ? 'w-12 h-12' : 'w-16 h-16'}`} />}
              <span className={`text-white font-medium ${isSmallHeight ? 'text-xs' : 'text-sm'}`}>{team1Data.team}</span>
              <span className="text-white opacity-40 text-xs">{team1Data.record}</span>
              <span className={`font-bold mt-1 ${team1Winner ? 'text-green-400' : 'text-white'} ${isSmallHeight ? 'text-xl' : 'text-2xl'}`}>
                {team1Data.score}
              </span>
            </div>
            <div className="text-gray-400 font-bold text-xl mx-4">VS</div>
            <div className="relative flex flex-col items-center flex-1">
              {!loading && <img src={team2Data.logo || '/default.png'} alt={team2Data.team} className={`object-contain mb-2 ${isSmallHeight ? 'w-12 h-12' : 'w-16 h-16'}`} />}
              <span className={`text-white font-medium ${isSmallHeight ? 'text-xs' : 'text-sm'}`}>{team2Data.team}</span>
              <span className="text-white opacity-40 text-xs">{team2Data.record}</span>
              <span className={`font-bold mt-1 ${team2Winner ? 'text-green-400' : 'text-white'} ${isSmallHeight ? 'text-xl' : 'text-2xl'}`}>
                {team2Data.score}
              </span>
            </div>
          </div>

          <div className={`flex justify-center text-gray-300 ${isSmallHeight ? 'text-xs mt-1' : 'text-sm mt-3 sm:mt-4'}`}>
            <>
              {showLinescore ? <LineScoreTable data={linescoreData} /> : (
                <div className="text-center">
                  <div>{clock}</div>
                </div>
              )}
            </>
          </div>
        </div>

        <div className={`flex border-b border-white/10 flex-shrink-0 ${isSmallHeight ? 'py-1' : 'py-2 sm:py-3'}`}>
          <button className={`flex-1 transition-colors ${
            activeTeamIdx === 0
              ? 'cursor-auto text-blue-500'
              : 'cursor-pointer text-gray-400 hover:text-white'
            } ${isSmallHeight ? 'text-xs py-1' : 'text-xs sm:text-sm py-2 sm:py-3'}`}
            onClick={() => setActiveTeamIdx(0)}
          >
            <span className="inline">{team1Data.team}</span>
          </button>
          <button className={`flex-1 transition-colors ${
            activeTeamIdx === 1
              ? 'cursor-auto text-blue-500'
              : 'cursor-pointer text-gray-400 hover:text-white'
            } ${isSmallHeight ? 'text-xs py-1' : 'text-xs sm:text-sm py-2 sm:py-3'}`}
            onClick={() => setActiveTeamIdx(1)}
          >
            <span className="inline">{team2Data.team}</span>
          </button>
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