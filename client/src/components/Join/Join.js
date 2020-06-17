import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Join.css'

const Join = () => {
  const [room, setRoom] = useState('')
  const [gameType, setGameType] = useState('none')

  function renderJoinArea() {
    if (gameType === 'none') {
      return <div>
        <button className="button" type="submit" onClick={()=>setGameType('internet')}>Play over the internet</button>
      </div>
    }
    else if (gameType === 'internet') {
      return <div>
        <div>
          <input
            placeholder="Room Name"
            className="joinInput"
            type="text"
            onChange={(event) => setRoom(event.target.value)}
          />
        </div>
        <Link
          onClick={
            event => (!room) ? event.preventDefault() : null
          }
          to={`/gameseven?room=${room}`}>
          <button className="button" type="submit">Start 7x7 Board Game</button>
        </Link>
        <button className="button" onClick={()=>setGameType('none')}>Back</button>
        </div>
    }
  }

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Parachutes and Bombers</h1>
        {renderJoinArea()}
      </div>
    </div>
  )
}

export default Join;