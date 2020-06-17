import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Join.css'

const Join = () => {
  const [room, setRoom] = useState('')
  const [gameType, setGameType] = useState('none')

  function renderJoinArea() {
    if (gameType === 'none') {
      return <div>
        <button className="button mt-20" type="submit" onClick={()=>setGameType('internet')}>Play over the internet</button>
      </div>
    }
    else if (gameType === 'internet') {
      return <div>
        <div>
          <input
            placeholder="Room Name"
            className="joinInput mt-20"
            type="text"
            onChange={(event) => setRoom(event.target.value)}
          />
        </div>
        <Link
          onClick={
            event => (!room) ? event.preventDefault() : null
          }
          to={`/gameseven?room=${room}`}>
          <button className="button mt-20" type="submit">Start 7x7 Board Game</button>
        </Link>
        </div>
    }
  }

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Parachutes<br />and<br />Bombers</h1>
        {renderJoinArea()}
      </div>
    </div>
  )
}

export default Join;