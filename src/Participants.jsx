function Participants({ totalStandings, participantsToShow }) {

    return (
        <>
            <ol>
                {
                    totalStandings.sort((a, b) => b[2] - a[2]).filter((_, i) => i < participantsToShow).map(x => {
                        return <li key={x[0]}><b>{x[1]}</b> - {x[2]} points</li>
                    })
                }
            </ol>
        </>
    )
}

export default Participants;