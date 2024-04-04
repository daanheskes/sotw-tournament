import { useState, useEffect, useRef } from 'react'
import './App.scss'

import Participants from './Participants'
import TournamentSelect from './TournamentSelect'

function App() {
  const groupId = 7020
  const participantsLimitOptions = [5, 10, 20, 35, 50, 100, 200]

  const [loading, setLoading] = useState(false)
  const [tournaments, setTournaments] = useState([])
  const [inputState, setInputState] = useState("")
  const [tournamentId, setTournamentId] = useState(null)
  const [tournamentData, setTournamentData] = useState(null)
  const [totalCompetitionExp, setTotalCompetitionExp] = useState(null)
  const [totalStandings, setTotalStandings] = useState([])
  const [addedTournaments, setAddedTournaments] = useState([])
  const [participantsToShow, setParticipantsToShow] = useState(35)

  const optionRef = useRef(null)

  useEffect(() => {
    fetch(`https://api.wiseoldman.net/v2/groups/${groupId}/competitions`)
    .then(response => response.json())
    .then(data => {
      let fetchedTournaments = []
      data.filter(x => x.title.includes("Skill") || x.title.includes("League")).sort((a, b) => a.id - b.id).forEach((x, i) => {
        if (i === 0) setInputState(x.id)
        const weekNumber = x.title.match(/#\d{1,2}/)[0].replace("#", "")
        const currentTournamentData = [x.id, x.title, weekNumber]
        fetchedTournaments.push(currentTournamentData)
      })
      setTournaments(fetchedTournaments)
    })
  }, [])

  useEffect(() => {
    if (!tournamentId || typeof tournamentId !== 'number' || tournamentId <= 0 || tournamentId > 999999) return
    if (addedTournaments.find(x => x[0] === tournamentId)) return // can't add the same tournament twice
    setLoading(true)
  
    fetch("https://api.wiseoldman.net/v2/competitions/" + tournamentId)
    .then(response => response.json())
    .then(data => {
      newTournament(data)
    })
  }, [tournamentId])

  useEffect(() => {
    if (!tournamentData) return
    addParticipantsPoints(tournamentData.participations)
  }, [tournamentData])

  return (
   <>
    <TournamentSelect tournaments={tournaments} selectTournament={selectTournament} optionRef={optionRef} />
    <p>{addedTournaments.length} Tournament{addedTournaments.length !== 1 ? "s" : ""} added:</p>
    <ol>
      {
      addedTournaments.map(x => {
          return (
            <li key={x[0]} title={`Tournament ID: ${x[0]}`}>
              <a target="_blank" rel="noreferrer" href={`https://wiseoldman.net/competitions/${x[0]}/`}>{x[1]}</a>
            </li>
          )
        })
      }
    </ol>
    {
      addedTournaments.length > 0 ? <a onClick={() => resetAll()}>Reset</a> : null
    }
    <div className="tournament-form">
      <label>Tournament ID: <input type="text" onChange={(e) => setInputState(e.target.value)} value={inputState} /></label>
      <button onClick={() => setTournamentId(Number(inputState))}>{loading ? "Loading..." : "Add"}</button>
    </div>
    <Participants totalStandings={totalStandings} participantsToShow={participantsToShow} />
    {
      addedTournaments.length > 0
      ? (
        <div className="limit-participants">
          <span className="show">Results to show</span>
          <select onChange={(e) => setParticipantsToShow(e.target[e.target.selectedIndex].id)} value={participantsToShow}>
            {
              participantsLimitOptions.map(x => {
                return <option id={x} key={x}>{x}</option>
              })
            }
          </select>
        </div>
      ) : null
    }
    
   </>
  )

  function resetAll() {
    setLoading(false)
    setInputState(optionRef.current.selectedOptions[0].id)
    setTournamentId(null)
    setTournamentData(null)
    setTotalCompetitionExp(null)
    setTotalStandings([])
    setAddedTournaments([])
  }

  function selectTournament(tournamentId) {
    setInputState(tournamentId)
  }

  function newTournament(tournament) {
    if (tournament.message) {
      setLoading(false)
      return
    }
    const totalXp = calculateTotalTournamentExp(tournament)
    setTotalCompetitionExp(totalXp)
    setTournamentData(tournament)

    const addedTournamentsCopy = [...addedTournaments]
    addedTournamentsCopy.push([tournament.id, tournament.title])
    setAddedTournaments(addedTournamentsCopy)
  }

  function addParticipantsPoints(participations) {
    let totalStandingsCopy = [...totalStandings]
    const minGainsToBeListed = 1
  
    participations.filter(x => x.progress.gained >= minGainsToBeListed).map((x, i) => {
      const tournamentRank = i + 1
      const playerId = x.playerId
      const playerName = x.player.displayName
      const startingLevel = x.levels.start
      const accountType = x.player.type
      const points = calculatePoints(tournamentRank, x.progress.gained, startingLevel, accountType)

      const playerIndex = totalStandingsCopy.findIndex(x => x[0] === playerId)
      if (playerIndex >= 0) {
        // playerId exists, add points
        totalStandingsCopy[playerIndex] = [playerId, playerName, formatNumber(Number(totalStandingsCopy[playerIndex][2]) + Number(points))]
      } else {
        // playerId doesn't exist, add new player
        totalStandingsCopy.push([playerId, playerName, points])
      }
    })

    setTotalStandings(totalStandingsCopy)
    setLoading(false)
  }

  function calculatePoints(rank, participantXpGained, startingLevel, accountType) {
    const expNeededPerShare = totalCompetitionExp / 100
    const pointsPerShare = 0.1

    let points = 0

    if (rank === 1) {
      points += 2.5
    } else if (rank === 2) {
      points += 2
    } else if (rank === 3) {
      points += 1.5
    } if (rank === 4) {
      points += 1
    } if (rank === 5) {
      points += 0.5
    }

    points += participantXpGained / expNeededPerShare * pointsPerShare
    return formatNumber(points)
  }

  function calculateTotalTournamentExp(tournamentData) {
    return tournamentData.participations.reduce((acc, curr) => acc + curr.progress.gained, 0)
  }

  function formatNumber(number) {
    return new Intl.NumberFormat("en-EN").format(number)
  }
}

export default App
