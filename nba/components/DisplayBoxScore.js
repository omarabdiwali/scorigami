function TeamTable({ team, labels, descriptions }) {
    const headClass = "border-b dark:border-slate-600 p-2 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left";
    const dataClass = "border-b border-slate-300 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-400";

    return (
        <>
            <table className="table-auto min-w-[800px] w-full text-sm sm:text-xs">
                <thead>
                    <tr>
                        <th className={headClass} title="Number">#</th>
                        <th className={headClass} title="Player">Player</th>
                        {labels.map((label, idx) => {
                            return (
                                <th className={headClass} key={`${team.team}-${label}`} title={descriptions[idx]}>{label}</th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {team.data?.map((player, _) => {
                        const playerInfo = player.starter ? `${player.position} • ${player.shortName}` : `    ${player.shortName}`;
                        return (
                            <tr key={player.id} id={player.id}>
                                <td className={dataClass}>{player.jersey}</td>
                                <td className={`${dataClass} ${player.starter ? "font-black": ""}`} title={player.displayName}>{playerInfo}</td>
                                {player.stats.map((stat, sIdx) => {
                                    return (
                                        <td className={dataClass} key={`${player.shortName}-${sIdx}`}>{stat}</td>
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

export default function DisplayBoxScore({ data, loading, activeTeamIdx }) {
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!data || !data.teams || data.teams.length === 0) {
        return <div className="text-center py-8 text-gray-400">No box score data available</div>;
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