import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom'
import './Join.css'

const Join = () => {
  const [room, setRoom] = useState('')
  const [gameType, setGameType] = useState('none')
  const [redirect, setRedirect] = useState(false)

  function checkKey(e) {
    e = e || window.event
    if (e.keyCode == '13') {
      setRedirect(true)
    }
  }

  function renderJoinArea() {
    if (gameType === 'none') {
      return <div>
        <Link to={'/ai'}>
          <button className="button" type="submit">AI Match</button>
        </Link>
        <button className="button" type="submit" onClick={()=>setGameType('internet')}>Join Room</button>
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
            autoFocus
          />
        </div>
        <Link
          onClick={
            event => (!room) ? event.preventDefault() : null
          }
          to={`/game?room=${room}`}>
          <button className="button" type="submit">Start</button>
        </Link>
        <button className="button" onClick={()=>setGameType('none')}>Back</button>
        </div>
    }
  }

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer" onKeyDown={checkKey}>
        <h1 className="heading">chutes</h1>
        {redirect ?
          <Redirect to={`/game?room=${room}`}/> : null}
        {renderJoinArea()}
      </div>
    </div>
  )
}

export default Join;
