import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Join.css'

const Join = () => {
  const [room, setRoom] = useState('')
  const [gameType, setGameType] = useState('none')

  function renderJoinArea() {
    if (gameType === 'none') {
      return <div>
        <button className="button" type="submit" onClick={()=>setGameType('internet')}>play against a friend</button>
      </div>
    }
    else if (gameType === 'internet') {
      return <div>
        <div>
          <input
            placeholder="room name"
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
          <button className="button" type="submit">start</button>
        </Link>
        <button className="button" onClick={()=>setGameType('none')}>back</button>
        </div>
    }
  }

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">chutes</h1>
        {renderJoinArea()}
      </div>
    </div>
  )
}

export default Join;