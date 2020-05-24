import React, {useState, useEffect} from 'react';
import { Redirect } from 'react-router-dom'
import queryString from 'query-string'
import io from 'socket.io-client'
import './Game.css';
const ENDPOINT = 'localhost:5000'
let socket

const Game = ({ location }) => {
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [messages, setMessages] = useState('')
  const [redirect, setRedirect] = useState(false)
  const [socketInitialized, setSocketInitialized] = useState(false)

  useEffect(() => {
    const {name, room} = queryString.parse(location.search)
    setName(name)
    setRoom(room)
    socket = io(ENDPOINT)
    socket.emit('join', {name, room}, (error) => {
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
      <div className="game-board">
        {socketInitialized ? <Board socket={socket}/> : null}
      </div>
      <div className="game-info">
        <div>Name: {name}</div>
        <div>Room: {room}</div>
        <p style={{whiteSpace: 'pre'}}>{messages}</p>
        {redirect ? <Redirect to='/'/> : null }
      </div>
    </div>
  );
}

const Square = ({onClick, value}) => {
  return (
    <button 
      className="square" 
      onClick={() => onClick()}
    >
      {value}
    </button>
  );
}

function Board({socket}) {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [xIsNext, setNextX] = useState(false)
  const [iAmX, setMyself] = useState(true)
  const [canIMove, setCanIMove] = useState(false)
  const [status, setStatus] = useState('X plays first')
  const [gameOver, setGameEnded] = useState(false)

  useEffect(() => {
    socket.emit('boardInitialized', (playerNum) => {
      setMyself(playerNum === 1 ? true : false)
      setStatus('I am ' + (playerNum === 1 ? 'X' : 'O'))
      setCanIMove(playerNum === 1 ? true : false)
    })
    socket.on('otherGuyMoved', ({squares}) => {
      setSquares(squares)
    })
  }, [])

  useEffect(() => {
    setCanIMove(!canIMove)
    const winner = calculateWinner(squares)
    if (winner) {
      if (winner === 'X') {
        setStatus(iAmX ? 'You Won!' : 'Opponent Won')
      } else {
        setStatus(iAmX ? 'Opponent Won' : 'You Won!')
      }
      setGameEnded(true)
    } else {
      setStatus('NextPlayer: ' + (xIsNext ? 'O' : 'X'))
    }
    setNextX(!xIsNext)
  }, [squares])

  const handleClick = (i) => {
    if (!canIMove || gameOver || squares[i]) {
      return;
    }
    const squaresCopy = squares.slice()
    squaresCopy[i] = xIsNext ? 'X' : 'O'
    setSquares(squaresCopy)
    socket.emit('iMoved', {squares: squaresCopy})
  }

  const renderSquare = (i) => {
    return <Square onClick={() => handleClick(i)} value={squares[i]} />
  }

  return (
    <div>
      <div className="status">{status}</div>
      <div className="board-row">
        { renderSquare(0) }
        { renderSquare(1) }
        { renderSquare(2) }
      </div>
      <div className="board-row">
        { renderSquare(3) }
        { renderSquare(4) }
        { renderSquare(5) }
      </div>
      <div className="board-row">
        { renderSquare(6) }
        { renderSquare(7) }
        { renderSquare(8) }
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

export default Game;