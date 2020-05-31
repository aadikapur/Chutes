import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom'
import queryString from 'query-string'
import io from 'socket.io-client'
import redParachute from './redParachute.png'
import blueParachute from './blueParachute.png'
import bomb from './bomb.jpg'
import './Game.css';
const ENDPOINT = 'https://parachutes-and-bombers.herokuapp.com/'
let socket
let redBlueBases

const Game = ({ location }) => {
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [messages, setMessages] = useState('')
  const [redirect, setRedirect] = useState(false)
  const [socketInitialized, setSocketInitialized] = useState(false)

  useEffect(() => {
    const { name, room } = queryString.parse(location.search)
    setName(name)
    setRoom(room)
    socket = io(ENDPOINT)
    socket.emit('join', { name, room }, (error) => {
      if (error) {
        setRedirect(true)
        alert(error)
      }
      setSocketInitialized(true)
    })
    return () => {
      socket.emit('disconnect')
      socket.close()
    }
  }, [ENDPOINT, location.search])

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages([...messages, "\n", message.text])
    })
  })

  return (
    <div className="game">
      <div className="game-info">
        <div>Name: {name}</div>
        <div>Room: {room}</div>
        <p style={{ whiteSpace: 'pre' }}>{messages}</p>
        {redirect ? <Redirect to='/' /> : null}
      </div>
        {socketInitialized ? <Board socket={socket} /> : null}
    </div>
  );
}

function Board({ socket }) {
  const [squares, setSquares] = useState(Array(20).fill(null))
  const [clickedSquare, setClickedSquare] = useState(-1)
  const [redIsNext, setNextRed] = useState(false)
  const [iAmRed, setMyself] = useState(true)
  const [canIMove, setCanIMove] = useState(false)
  const [status, setStatus] = useState('X plays first')
  const [turnsToBomb, setTurnsToBomb] = useState(0)
  const [gameOver, setGameEnded] = useState(false)

  useEffect(() => {
    socket.emit('boardInitialized', (playerNum) => {
      setMyself(playerNum === 1 ? true : false)
      setCanIMove(playerNum === 1 ? true : false)
    })
    socket.on('otherGuyMoved', ({ squares }) => {
      setSquares(squares)
    })
  }, [])

  useEffect(() => {
    var thereIsABomb = false
    squares.forEach((item, index) => {
      if (item == 'Bomb') {
        thereIsABomb = true
        setTimeout(() => {
          const squaresCopy = squares.slice()
          getAdjacentSquares(index).forEach((adjacentSquare) => {
            squaresCopy[adjacentSquare] = null
          })
          squaresCopy[index] = null
          setSquares(squaresCopy)
        }, 1000)
      }
    })
    if (thereIsABomb) { return; }
    setCanIMove(!canIMove)
    const winner = calculateWinner()
    if (winner) {
      if (winner === 'Red') {
        setStatus(iAmRed ? 'You Won!' : 'Opponent Won')
      } else {
        setStatus(iAmRed ? 'Opponent Won' : 'You Won!')
      }
      setGameEnded(true)
    } else {
      setStatus('Next Player: ' + (redIsNext ? 'Blue' : 'Red'))
    }
    setNextRed(!redIsNext)
  }, [squares])

  const handleClick = (i, isParachute) => {
    setClickedSquare(-1)
    const squaresCopy = squares.slice()
    squaresCopy[i] = (isParachute ? (redIsNext ? 'Red' : 'Blue') + 'Para' : 'Bomb')
    setSquares(squaresCopy)
    if (isParachute) {
      setTurnsToBomb((turns) => turns === 0 ? 0 : turns - 1)
    } else {
      setTurnsToBomb(3)
    }
    socket.emit('iMoved', { squares: squaresCopy })
  }

  const renderSquare = (i) => {
    let value
    if (canIMove && !gameOver && !squares[i] && i === clickedSquare) {
      if (turnsToBomb === 0) {
        return <div className="bigsquare">
          <button className="minisquare" onClick={() => handleClick(i, true)} >
            <img src={iAmRed ? redParachute : blueParachute} height="50" width="50" />
          </button>
          <button className="minisquare" onClick={() => handleClick(i, false)} >
            <img src={bomb} height="50" width="50" />
          </button>
        </div>
      } else {
        value = <div className="bigsquare">
          <button className="minisquare" onClick={() => handleClick(i, true)} style={{height:"100%"}}>
            <img src={iAmRed ? redParachute : blueParachute} height="50" width="50" />
          </button>
          </div>
      }
    } else {
      if (squares[i] === 'RedPara') {
        value = <img src={redParachute} height="50" width="50" />
      } else if (squares[i] === 'BluePara') {
        value = <img src={blueParachute} height="50" width="50" />
      } else if (squares[i] === 'Bomb') {
        value = <img className="bomb" src={bomb} height="50" width="50" />
      } else {
        value = ""
      }
    }
    return <Square
      onClick={() =>
        setClickedSquare(clickedSquare === -1 ? i : -1)
      }
      value={value}
    />
  }

  return (
    <div className="game-board">
      <div className="left-column">
      <div className="status">{`Team ${iAmRed ? 'Red' : 'Blue'}`} </div>
      <div className="status">{status}</div>
      <div className="status">{gameOver ? null : `You can plant a bomb in ${turnsToBomb} turns` } </div>
      </div>
      <div className="board">
      <div className="board-row">
        {renderSquare(0)}
        {renderSquare(1)}
        <Base baseNumber={0} adjacentSquares={[squares[1], squares[2], squares[6]]}/>
        {renderSquare(2)}
        {renderSquare(3)}
      </div>
      <div className="board-row">
        {renderSquare(4)}
        {renderSquare(5)}
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
      </div>
      <div className="board-row">
        <Base baseNumber={1} adjacentSquares={[squares[4], squares[9], squares[11]]} />
        {renderSquare(9)}
        <Base baseNumber={2} adjacentSquares={[squares[6], squares[9], squares[10], squares[13]]} />
        {renderSquare(10)}
        <Base baseNumber={3} adjacentSquares={[squares[8], squares[10], squares[15]]} />
      </div>
      <div className="board-row">
        {renderSquare(11)}
        {renderSquare(12)}
        {renderSquare(13)}
        {renderSquare(14)}
        {renderSquare(15)}
      </div>
      <div className="board-row">
        {renderSquare(16)}
        {renderSquare(17)}
        <Base baseNumber={4} adjacentSquares={[squares[13], squares[17], squares[18]]} />
        {renderSquare(18)}
        {renderSquare(19)}
      </div>
      </div>
    </div>
  );
}

const Base = ({baseNumber, adjacentSquares}) => {
  var numberOfRedOccupants = 0
  var numberOfBlueOccupants = 0
  adjacentSquares.forEach(item => {
    let color = !item ? null : item.split(/(?=[A-Z])/)[0]
    if (color === 'Red') {
      numberOfRedOccupants++
    } else if (color === 'Blue') {
      numberOfBlueOccupants++
    }
  })
  if (!redBlueBases) {
    redBlueBases = [0,0,0,0,0]
  }
  if (numberOfRedOccupants > (adjacentSquares.length/2)) {
    redBlueBases[baseNumber] = 1
    return <button className="square" style={{color: 'red' }}>X</button>
  } else if (numberOfBlueOccupants > (adjacentSquares.length/2)) {
    redBlueBases[baseNumber] = 2
    return <button className="square" style={{color: 'blue' }}>X</button>
  } else {
    redBlueBases[baseNumber] = 0
    return <button className="square" >X</button>
  }
}

const Square = ({ onClick, value }) => {
  return (
    <button
      className="square"
      onClick={() => !onClick ? null : onClick()}
    >
      {value}
    </button>
  );
}

function calculateWinner() {
  const basesToWin = 3
  var redBases = 0
  var blueBases = 0

  redBlueBases.forEach(item => {
    if (item===1) {
      redBases++
    } else if (item===2) {
      blueBases++
    }
  })

  if (redBases >= basesToWin) {
    return 'Red'
  } else if (blueBases >= basesToWin) {
    return 'Blue'
  } else {
    return null
  }
}

function getAdjacentSquares(i) {
  const adjacency = [
    [1, 4],
    [0, 5],
    [3, 7],
    [2, 8],
    [0, 5],
    [1, 4, 6, 9],
    [5, 7],
    [2, 6, 8, 10],
    [3, 7],
    [5, 12],
    [7, 14],
    [12, 16],
    [9, 11, 13, 17],
    [12, 14],
    [10, 13, 15, 18],
    [14, 19],
    [11, 17],
    [12, 16],
    [14, 19],
    [15, 18]
  ]
  const adjacentSquares = []
  adjacency[i].forEach(item => {
    adjacentSquares.push(item)
  })
  return adjacentSquares
}

export default Game;