import { ordinalEnding } from "@/utils/global";
import { useEffect, useRef, useState } from "react";

function QuarterPlays({ plays, curQuarter, prevQuarter, homeTeam, awayTeam, bgColor, quarterRef }) {
    const textColor = bgColor == 'bg-slate-800' ? 'text-slate-400' : 'text-slate-400';

    return (
        <>
            <div ref={quarterRef} className="scroll-mt-24">
                {plays.map((play, _) => {
                    const clock = `${play.clock} - ${curQuarter}`;
                    const score = `${homeTeam} ${play.homeScore} - ${play.awayScore} ${awayTeam}`;
                    const color = play.scoreValue == 3 ? 'text-green-500' : play.scoreValue == 2 ? 'text-green-300' : 'text-green-200';
                    return (
                        <div key={play.id} className={`flex items-center ${bgColor} space-x-2 flex-row p-4 m-2 rounded rounded-2xl max-w-[100vw]`}>
                            {play.teamLogo ? <img
                                src={play.teamLogo ? play.teamLogo : '/default.png'}
                                alt={'team'}
                                className="w-10 h-10 object-contain flex-shrink-0"
                            /> : <div className="w-10"></div>}
                            <div className="flex flex-col flex-1 p-2 space-y-2">
                                <div className={`text-xs ${textColor}`}>{clock}</div>
                                <div className="text-sm">{play.text}</div>
                                <div className={`text-xs ${textColor}`}>{score}</div>
                            </div>
                            {play.scoreValue && parseInt(play.scoreValue) != 0 ? <div className={`mr-4 ${color}`}>
                                {`+${play.scoreValue}`}
                            </div> : <></>}
                        </div>
                    )
                })}
            </div>
            
            {prevQuarter && <div className="flex items-center">
                <div className="flex-grow border-t border-gray-400"></div>
                <span className="mx-4 flex-shrink text-gray-400">{`End of ${prevQuarter}`}</span>
                <div className="flex-grow border-t border-gray-400"></div>
            </div>}
        </>
    )
}

export default function DisplayPlayByPlay({ data }) {
    if (!data || Object.keys(data) == 0 || !data.plays || Object.keys(data.plays) == 0) {
        return <div className="text-center py-8 text-gray-400">No play-by-play data available</div>;
    }

    const scrollRef = useRef(null);
    const stickyRef = useRef(null);
    const quarterRefs = useRef({});
    const quarters = ['1st', '2nd', '3rd', '4th', 'OT'];
    let initialColor = '';
    const quarterKeys = data && data.plays ? Object.keys(data.plays) : [];
    const lastKey = quarterKeys.at(-1);
    const intKey = lastKey ? parseInt(lastKey) - 1 : 0;
    const [curButton, setCurButton] = useState(intKey < 5 ? quarters.at(intKey) : `${intKey-3}OT`);

    const scrollToQuarter = (qtr) => {
        quarterRefs.current[qtr]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setCurButton(qtr);
    };

    useEffect(() => {
        if (!stickyRef.current) return;
        stickyRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }, [])

    useEffect(() => {
        let timeoutId = null;
        const changeCurButton = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                let nearestKey = null;
                let closestPos = -Infinity;

                for (const qtr of Object.keys(quarterRefs.current)) {
                    const el = quarterRefs.current[qtr];
                    if (el) {
                        const topPosition = el.getBoundingClientRect().top;
                        if (topPosition < 600 && topPosition > closestPos) {
                            nearestKey = qtr;
                            closestPos = topPosition;
                        }
                    }
                }
                
                if (nearestKey != null) {
                    setCurButton(nearestKey);
                }

            }, 30);
        };

        const currentScroll = scrollRef.current;
        if (!currentScroll) return;
        currentScroll.addEventListener('scroll', changeCurButton);

        return () => {
            clearTimeout(timeoutId);
            if (currentScroll) {
                currentScroll.removeEventListener('scroll', changeCurButton);
            }
        };
    }, []);

    return (
        <div ref={scrollRef} className="flex flex-col min-h-[30vh] max-h-[40vh] overflow-auto no-scrollbar">
            {/* Sticky Quarter Navigation */}
            <div ref={stickyRef} className="sticky top-0 z-30 bg-gray-900 space-x-2 flex flex-row max-w-full pb-2 pt-2 px-2">
                {quarterKeys.map((key) => {
                    const intKey = parseInt(key) - 1;
                    const qtr = intKey < 5 ? quarters.at(intKey) : `${intKey-3}OT`;
                    return (
                        <button 
                            onClick={() => scrollToQuarter(qtr)} 
                            className={`flex-1 p-2 text-xs sm:text-sm ${curButton == qtr ? `cursor-auto text-blue-400` : 'cursor-pointer rounded hover:bg-gray-800 hover:text-slate-400'}`}
                            key={`Button-${qtr}`}
                        >
                            {qtr}
                        </button>
                    )
                })}
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1">
                {[...quarterKeys].reverse().map((key) => {
                    initialColor = initialColor == 'bg-slate-800' ? 'bg-gray-800' : 'bg-slate-800';
                    const intKey = parseInt(key) - 1;
                    const plays = data.plays[key];
                    const curQuarter = intKey < 5 ? quarters.at(intKey) : `${intKey-3}OT`;
                    let prevQuarter = null;
                    
                    if (intKey - 1 >= 0) {
                        const prevKey = intKey - 1;
                        if (prevKey < 4) {
                            prevQuarter = `${quarters.at(prevKey)} Quarter`;
                        } else {
                            const ending = ordinalEnding(prevKey - 3);
                            prevQuarter = `${prevKey - 3}${ending} Overtime`;
                        }
                    }

                    return <QuarterPlays 
                        key={key} 
                        plays={plays} 
                        curQuarter={curQuarter}
                        prevQuarter={prevQuarter} 
                        homeTeam={data.homeTeam} 
                        awayTeam={data.awayTeam} 
                        bgColor={initialColor}
                        quarterRef={(el) => { quarterRefs.current[curQuarter] = el; }}
                    />
                })}
            </div>
        </div>
    )
}