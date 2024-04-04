function Participants({ totalStandings, participantsToShow }) {

    return (
        <>
            <ol>
                {
                    totalStandings.sort((a, b) => b[2] - a[2]).filter((_, i) => i < participantsToShow).map(x => {
                        const pointsToShow = Math.round(x[2] * 100) / 100
                        if (pointsToShow > 0) {
                            return <li key={x[0]}><b>{x[1]}</b> - {pointsToShow} points</li>
                        }
                    })
                }
            </ol>
        </>
    )
}

export default Participants;