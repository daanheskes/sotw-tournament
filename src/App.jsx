import { useState, useEffect } from 'react'
import './App.scss'

import Participants from './Participants'

/*

tournament Smithing = 40642
tournament Slayer = 40920

*/

function App() {
  const [loading, setLoading] = useState(false);
  const [inputState, setInputState] = useState("")
  const [tournamentId, setTournamentId] = useState(null)
  const [tournamentData, setTournamentData] = useState(null)
  const [totalCompetitionExp, setTotalCompetitionExp] = useState(null)
  const [totalStandings, setTotalStandings] = useState([])
  const [addedTournaments, setAddedTournaments] = useState([])

  useEffect(() => {
    if (!tournamentId || typeof tournamentId !== 'number' || tournamentId <= 0) return;
    if (addedTournaments.includes(tournamentId)) return; // can't add the same tournament twice
    setLoading(true);
  
    fetch("https://api.wiseoldman.net/v2/competitions/" + tournamentId)
    .then(response => response.json())
    .then(data => {
      newTournament(data);
    })
  }, [tournamentId]);

  useEffect(() => {
    if (!tournamentData) return;
    addParticipantsPoints(tournamentData.participations)
  }, [tournamentData])

  return (
   <>
    <p>{addedTournaments.length} Tournaments added: {addedTournaments.map((x, i) => <><span>{x}</span>{i < addedTournaments.length - 1 ? " | " : ""}</>)}</p>
    <label>Tournament ID: <input type="text" onChange={(e) => setInputState(e.target.value)} value={inputState} /></label>
    <button onClick={() => setTournamentId(Number(inputState))}>{loading ? "Loading..." : "Submit"}</button>
    <Participants totalStandings={totalStandings} />
   </>
  )

  function newTournament(tournament) {
    const totalXp = calculateTotalTournamentExp(tournament)
    setTotalCompetitionExp(totalXp)
    setTournamentData(tournament)

    const addedTournamentsCopy = [...addedTournaments]
    addedTournamentsCopy.push(tournament.id)
    setAddedTournaments(addedTournamentsCopy)
  }

  function addParticipantsPoints(participations) {
    let totalStandingsCopy = [...totalStandings];

    participations.filter(x => x.progress.gained > Math.floor(totalCompetitionExp / 100)).map((x, i) => {
      const tournamentRank = i + 1;
      const playerId = x.playerId
      const playerName = x.player.displayName
      const points = calculatePoints(tournamentRank, x.progress.gained)

      const playerIndex = totalStandingsCopy.findIndex(x => x[0] === playerId)
      if (playerIndex >= 0) {
        // playerId exists, add points
        totalStandingsCopy[playerIndex] = [playerId, playerName, formatNumber(Number(totalStandingsCopy[playerIndex][2]) + Number(points))]
      } else {
        // playerId doesn't exist, add new player
        totalStandingsCopy.push([playerId, playerName, points])
      }
    });

    setTotalStandings(totalStandingsCopy);
    setLoading(false);
  }

  function calculatePoints(rank, participantXpGained) {
    let points = 0;

    if (rank === 1) {
        points += 3;
    }
    if (rank === 2) {
        points += 2;
    }
    if (rank === 3) {
        points += 1.5;
    }
    if (rank === 4) {
        points += 1;
    }
    if (rank === 5) {
        points += 0.5;
    }
    const expNeededPerPoint = Math.floor(totalCompetitionExp / 100);

    points += Math.floor(participantXpGained / expNeededPerPoint) * 0.3;
    return formatNumber(points);
  }

  function calculateTotalTournamentExp(tournamentData) {
    return tournamentData.participations.reduce((acc, curr) => acc + curr.progress.gained, 0)
  }

  function formatNumber(number) {
    return new Intl.NumberFormat("en-EN").format(number)
  }
}

export default App
