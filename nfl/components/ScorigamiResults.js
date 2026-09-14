import { useState, useEffect } from "react";
const LIMIT = 15;

export default function ScorigamiResults() {
  const [scorigamiResults, setScorigamiResults] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [visibleCount, setVisibleCount] = useState(LIMIT);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchScorigamiResults = (reset = false, useCursor = null) => {
    setLoading(true);
    
    let url = '/api/scorigamiResults';
    if (useCursor) {
      url += `?cursor=${useCursor}`;
    }
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (reset) {
          setScorigamiResults(data.results || []);
        } else {
          setScorigamiResults(prev => [...prev, ...(data.results || [])]);
        }

        setCursor(data.cursor);
        setHasMore(data.hasMore);
      })
      .catch(error => {
        console.error('Error fetching scorigami results:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchScorigamiResults(true);
  }, []);

  const handleLoadMore = () => {
    if (cursor && hasMore) {
      fetchScorigamiResults(false, cursor);
    }
    setVisibleCount(prev => prev + LIMIT);
  };

  return (
    <div className="mt-4 sm:mt-5 max-h-[60vh] p-3 max-w-5xl justify-self-center overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="mx-auto px-2">
        <h2 className="text-xl sm:text-2xl font-bold mb-8 text-gray-100 border-b border-gray-800 pb-4">
          Recent Scorigami Results
        </h2>
        
        {loading && scorigamiResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-200"></div>
          </div>
        ) : scorigamiResults.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">
            No scorigami results available
          </div>
        ) : (
          <>
            <div className="flex flex-col bg-slate-800/50 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
              {scorigamiResults.slice(0, visibleCount).map((result, index) => {
                const isScorigami = result.text.includes('SCORIGAMI');
                const whoWon = result.homeScore > result.awayScore ? 1 : result.awayScore > result.homeScore ? 2 : 0;
                
                return (
                  <div 
                    key={result.id}
                    className={`flex flex-col p-4 sm:p-5 border-b border-gray-700/50 hover:bg-slate-900/50 transition-colors ${
                      index === visibleCount - 1 || index === scorigamiResults.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-gray-200 tracking-tight">
                          {result.homeTeam} <span className={whoWon == 1 ? "text-green-400" : ""}>{result.homeScore}</span> - <span className={whoWon == 2 ? "text-green-400" : ""}>{result.awayScore}</span> {result.awayTeam}
                        </span>
                        <span className="text-xs text-gray-400 mt-0.5">
                          {new Date(result.date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isScorigami 
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-red-900/40 text-red-300'
                      }`}>
                        {isScorigami ? 'NEW' : 'REPEAT'}
                      </span>
                    </div>

                    <div className={`text-xs sm:text-sm leading-snug w-full mt-1 ${
                      isScorigami 
                        ? 'text-green-400 font-medium'
                        : 'text-gray-400'
                    }`}>
                      {result.text}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {hasMore && (
              <div className="text-center mt-8 mb-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2.5 cursor-pointer bg-gray-800 border border-gray-700 hover:bg-slate-900 text-sm text-gray-300 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700 inline-flex items-center justify-center shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
            
            {!hasMore && (
              <div className="text-center text-gray-500 text-xs mt-6 mb-4">
                Showing all {scorigamiResults.length} results
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}