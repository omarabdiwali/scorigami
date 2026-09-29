import { useEffect, useRef, useState } from "react";
import DisplayPlayByPlay from "./DisplayPlayByPlay";

function TeamTable({ team, labels, descriptions }) {
    const headClass = "border-b border-slate-600 p-2 pt-0 pb-3 text-slate-200";
    const dataClass = "border-b border-slate-700 p-2 text-slate-400";

    return (
        <>
            <table className="table-auto min-w-[800px] w-full text-sm sm:text-xs">
                <thead>
                    <tr>
                        <th className={`${headClass} text-center`} title="Number">#</th>
                        <th className={`${headClass} text-left`} title="Player">Player</th>
                        {labels.map((label, idx) => {
                            return (
                                <th className={`${headClass} text-center`} key={`${team.team}-${label}`} title={descriptions[idx]}>{label}</th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {team.data?.map((player, _) => {
                        const playerInfo = player.starter ? `${player.position} • ${player.shortName}` : `${player.shortName}`;
                        const playerTitle = `${player.position} - ${player.displayName}`;
                        return (
                            <tr key={player.id} id={player.id}>
                                <td className={`${dataClass} text-center`}>{player.jersey}</td>
                                <td className={`${dataClass} text-left ${player.starter ? "font-black": ""}`} title={playerTitle}>{playerInfo}</td>
                                {player.stats.map((stat, sIdx) => {
                                    return (
                                        <td className={`${dataClass} text-center`} key={`${player.shortName}-${sIdx}`}>{stat}</td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </>
    )
}

export default function DisplayBoxScore({ data, plays, loading, activeSection, scrollRef, hideQtrs }) {
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!data || !data.teams || data.teams.length === 0) {
        const info = activeSection == 'plays' ? 'No play-by-play data available' : 'No box score data available';
        return <div className={`text-center ${activeSection == 'plays' ? 'sm:py-14 py-11' : 'py-8'} text-gray-400`}>{info}</div>;
    }

    const quarters = ['1st', '2nd', '3rd', '4th', 'OT'];
    const [curButton, setCurButton] = useState(null);

    const quarterRefs = useRef({});
    const scrollToQuarter = (qtr) => {
        if (quarterRefs.current[qtr]) {
            quarterRefs.current[qtr]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setCurButton(qtr);
        }
    };
    const quarterKeys = plays && plays.plays ? Object.keys(plays.plays) : [];

    const showPlayByPlay = activeSection == 'plays';
    if (showPlayByPlay) {
        return (
            <>
                <div className={`${hideQtrs ? '' : 'sticky top-0 z-30'} bg-gray-900 space-x-2 flex flex-row max-w-full`}>
                    {quarterKeys.map((key) => {
                        const intKey = parseInt(key) - 1;
                        const qtr = intKey < 5 ? quarters.at(intKey) : `${intKey-3}OT`;
                        return (
                            <button 
                                onClick={() => scrollToQuarter(qtr)} 
                                className={`flex-1 py-2 text-xs ${curButton == qtr ? `cursor-auto text-blue-400` : 'cursor-pointer rounded hover:bg-gray-800 hover:text-slate-400'}`}
                                key={`Button-${qtr}`}
                            >
                                {qtr}
                            </button>
                        )
                    })}
                </div>
                <div className="w-full">
                    <DisplayPlayByPlay data={plays} scrollRef={scrollRef} quarterRefs={quarterRefs} setCurButton={setCurButton} />
                </div>
            </>
        )
    }
    
    const teamsToShow = activeSection !== undefined ? [data.teams[activeSection]] : data.teams;

    return (
        <>
            <div className="w-full">
                {teamsToShow.map((team, _) => {
                    return <TeamTable key={`TeamTable-${team.idx}`} team={team} labels={data.labels} descriptions={data.descriptions} />
                })}
            </div>
        </>
    )
}