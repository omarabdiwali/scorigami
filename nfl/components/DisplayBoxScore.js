function TeamTable({ team }) {
    const headClass = "border-b dark:border-slate-600 p-2 pt-0 pb-3 text-slate-400 dark:text-slate-200";
    const dataClass = "border-b border-slate-300 dark:border-slate-700 p-2 text-slate-500 dark:text-slate-400";

    return (
        <>
            {team.data.map((data, _) => {
                return (
                    <div key={`${team.name}-${data.heading}`} className="flex flex-col space-y-4 p-4">
                        <h3>{data.heading}</h3>
                        <table className="table-auto min-w-[800px] w-full text-sm sm:text-xs">
                            <thead>
                                <tr>
                                    <th className={`${headClass} text-left`} title="Number">#</th>
                                    <th className={`${headClass} text-left`} title="Player">Player</th>
                                    {data.labels.map((label, i) => {
                                        return (
                                            <th className={`${headClass} text-center`} key={`${team.team}-${label}`} title={data.descriptions[i]}>{label}</th>
                                        )
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {data.players.map((player, _) => {
                                    return (
                                        <tr key={player.id} id={player.id}>
                                            <td className={`${dataClass} text-left`}>{player.jersey}</td>
                                            <td className={`${dataClass} text-left`}>{player.name}</td>
                                            {player.stats.map((stat, sIdex) => {
                                                return (
                                                    <td className={`${dataClass} text-center`} key={`${player.name}-${sIdex}`}>{stat}</td>
                                                )
                                            })}
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )
            })}
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
                    return <TeamTable key={`TeamTable-${team.idx}`} team={team} />
                })}
            </div>
        </>
    )
}