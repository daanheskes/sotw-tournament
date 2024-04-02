function TournamentSelect({tournaments, selectTournament}) {

    function getCurrentWeekNumber() {
        let now = new Date();
        let onejan = new Date(now.getFullYear(), 0, 1);
        let weekNumber = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);

        return weekNumber;
    }

    function isRecent(tournament) {
        const pastTournamentsAmount = 6;
        const currentWeekNumber = getCurrentWeekNumber();
        return (tournament[2] <= currentWeekNumber) && (Math.abs(tournament[2] - currentWeekNumber) <= pastTournamentsAmount);
    }

    return (
        <select onChange={(e) => selectTournament(e.target[e.target.selectedIndex].id)}>
            {
                tournaments.filter(isRecent).map(x => {
                    return <option key={x[0]} id={x[0]}>{x[1]}</option>
                })
            }
        </select>
    )
}

export default TournamentSelect