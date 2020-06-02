import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Join.css'

const Join = () => {
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [gameType, setGameType] = useState('none')

  function renderJoinArea() {
    if (gameType === 'none') {
      return <div>
        <Link to={'/samescreen'}>
          <button className="button mt-20" type="submit">Play on single screen</button>
        </Link>
        <button className="button mt-20" type="submit" onClick={()=>setGameType('internet')}>Play over the internet</button>
      </div>
    }
    else if (gameType === 'internet') {
      return <div>
        <div>
          <input
            placeholder="Username"
            className="joinInput"
            type="text"
            onChange={
              (event) => setName(event.target.value)
            } />
        </div>
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
            event => (!name || !room) ? event.preventDefault() : null
          }
          to={`/game?name=${name}&room=${room}`}>
          <button className="button mt-20" type="submit">Sign In</button>
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