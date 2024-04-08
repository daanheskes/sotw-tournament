function TournamentSelect({ tournaments, selectTournament, addedTournaments, optionRef }) {

    function isRecent(tournament) {
        const pastWeeksToShow = 6
        const MAX_DIFF = 60 * 60 * 1000 * 24 * 7 * pastWeeksToShow

        const date = new Date()
        const tournamentStartDate = new Date(tournament[2])
    
        return (date > tournamentStartDate) && (date - tournamentStartDate <= MAX_DIFF)
    }

    return (
        <select onChange={(e) => selectTournament(e.target[e.target.selectedIndex].id)} ref={optionRef}>
            {
                tournaments.filter(isRecent).map(x => {
                    const isAdded = addedTournaments.find(y => y[0] === x[0])
                    return <option key={x[0]} id={x[0]} disabled={isAdded}>{x[1]}</option>
                })
            }
        </select>
    )
}

export default TournamentSelect