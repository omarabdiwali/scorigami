import DisplayPlayByPlay from "./DisplayPlayByPlay";

function TeamTable({ team, labels, descriptions }) {
    const headClass = "border-b dark:border-slate-600 p-2 pt-0 pb-3 text-slate-400 dark:text-slate-200";
    const dataClass = "border-b border-slate-300 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-400";

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

export default function DisplayBoxScore({ data, plays, loading, activeTeamIdx }) {
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!data || !data.teams || data.teams.length === 0) {
        return <div className="text-center py-8 text-gray-400">No box score data available</div>;
    }

    const showPlayByPlay = activeTeamIdx !== undefined && activeTeamIdx == data.teams.length;
    if (showPlayByPlay) {
        return <DisplayPlayByPlay data={plays} />
    }
    
    const teamsToShow = activeTeamIdx !== undefined ? [data.teams[activeTeamIdx]] : data.teams;

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