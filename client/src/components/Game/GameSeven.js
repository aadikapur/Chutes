import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom'
import queryString from 'query-string'
import io from 'socket.io-client'
import redParachute from './redParachute.png'
import blueParachute from './blueParachute.png'
import redSoldier from './redSoldier.png'
import blueSoldier from './blueSoldier.png'
import bomb from './bomb.png'
import bunker from './bunker.png'
import bunkerRed from './bunkerRed.png'
import bunkerBlue from './bunkerBlue.png'
import './Game.css';
const ENDPOINT = 'https://parachutes-and-bombers.herokuapp.com/'
//const ENDPOINT = 'localhost:5000'
let socket
let redBlueBases

const GameSeven = ({ location }) => {
  const [room, setRoom] = useState('')
  const [messages, setMessages] = useState('')
  const [redirect, setRedirect] = useState(false)
  const [socketInitialized, setSocketInitialized] = useState(false)

  useEffect(() => {
    const { room } = queryString.parse(location.search)
    setRoom(room)
    socket = io(ENDPOINT)
    socket.emit('join', { room }, (error) => {
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
      {redirect ? <Redirect to='/' /> : null}
      {socketInitialized ? <Board socket={socket} /> : null}
    </div>
  );
}

function Board({ socket }) {
  const [squares, setSquares] = useState(() => {
    const redsquares = [0, 2, 13, 19, 30, 32]
    const bluesquares = [1, 3, 9, 23, 29, 31]
    const squaresCopy = Array(33).fill(null)
    redsquares.forEach(item => {
      squaresCopy[item] = 'RedPara'
    })
    bluesquares.forEach(item => {
      squaresCopy[item] = 'BluePara'
    })
    return squaresCopy
  })
  const [clickedSquare, setClickedSquare] = useState(-1)
  const [redIsNext, setNextRed] = useState(false)
  const [iAmRed, setMyself] = useState(true)
  const [canIMove, setCanIMove] = useState(false)
  const [turnsToBomb, setTurnsToBomb] = useState([0, 0]) //[red,blue]
  const [gameOver, setGameEnded] = useState(false)
  const [movableSquaresJustTurnedOff, setMovableSquaresJustTurnedOff] = useState(false)
  const [isSoldierMoving, setSoldierMoving] = useState(false)
  const [tempMovableSquaresOverwrite, setOverwritten] = useState(Array(4).fill(null))
  const [waitingForBlue, setWaitingForBlue] = useState(false)

  useEffect(() => {
    socket.emit('boardInitialized', (playerNum) => {
      setMyself(playerNum === 1 ? true : false)
      setCanIMove(playerNum === 1 ? true : false)
      if (playerNum === 1) {
        setWaitingForBlue(true)
        socket.on('blueHasJoined', () => {
          setWaitingForBlue(false)
        })
      }
    })
    socket.on('otherGuyMoved', ({ squares }) => {
      setSquares(squares)
    })
  }, [])

  useEffect(() => {
    var moveHasntFinishedYet = false
    if (movableSquaresJustTurnedOff) {
      setMovableSquaresJustTurnedOff(false)
      return
    }
    squares.forEach((item, index) => {
      if (item == 'Bomb') {
        moveHasntFinishedYet = true
        setTurnsToBomb(iAmRed === canIMove ? [4, turnsToBomb[1]] : [turnsToBomb[0], 4])
        setTimeout(() => {
          const squaresCopy = squares.slice()
          getAdjacentSquares(index).forEach((adjacentSquare) => {
            squaresCopy[adjacentSquare] = null
          })
          squaresCopy[index] = null
          setSquares(squaresCopy)
        }, 1000)
      }
      if (item && item.split(' ')[0] === 'movableSquare') {
        moveHasntFinishedYet = true
      }
    })
    if (moveHasntFinishedYet) { return; }
    setCanIMove(!canIMove)
    if (calculateWinner()) {
      setGameEnded(true)
    }
    setNextRed(!redIsNext)
  }, [squares])

  const handleClick = (i, item) => {
    setClickedSquare(-1)
    const squaresCopy = squares.slice()
    if (item === 'bomb') {
      squaresCopy[i] = 'Bomb'
      setSquares(squaresCopy)
    } else if (item === 'soldierWantsToMove') {
      setSoldierMoving(true)
      const tempArray = Array(4)
      getAdjacentSquares(i).forEach((adjacentSquare, index) => {
        tempArray[index] = squaresCopy[adjacentSquare]
        squaresCopy[adjacentSquare] = `movableSquare ${i}`
      })
      setOverwritten(tempArray)
      setSquares(squaresCopy)
      return
    } else if (item === 'soldierDoesntWantToMove') {
      setSoldierMoving(false)
      setMovableSquaresJustTurnedOff(true)
      squaresCopy.forEach(square => {
        if (square && square.split(' ')[0] === 'movableSquare') {
          getAdjacentSquares(Number(square.split(' ')[1])).forEach((adjacentSquare, index) => {
            squaresCopy[adjacentSquare] = tempMovableSquaresOverwrite[index]
          })
          setSquares(squaresCopy)
        }
      })
      return
    } else {
      if (item === 'parachute') {
        squaresCopy[i] = redIsNext ? 'RedPara' : 'BluePara'
        setSquares(squaresCopy)
      } else if (item === 'soldier') {
        squaresCopy[i] = redIsNext ? 'RedSoldier' : 'BlueSoldier'
        setSquares(squaresCopy)
      } else if (item === 'soldierMoved') {
        setSoldierMoving(false)
        var originSquare = Number(squaresCopy[i].split(' ')[1])
        squaresCopy[originSquare] = null
        getAdjacentSquares(originSquare).forEach((adjacentSquare, index) => {
          if (squaresCopy[adjacentSquare].split(' ')[0] === 'movableSquare') {
            squaresCopy[adjacentSquare] = tempMovableSquaresOverwrite[index]
          }
        })
        squaresCopy[i] = redIsNext ? 'RedSoldier' : 'BlueSoldier'
        setSquares(squaresCopy)
      }
      const turnsToBombCopy = turnsToBomb.slice()
      for (var j = 0; j < 2; j++) {
        turnsToBombCopy[j] = turnsToBombCopy[j] === 0 ? 0 : turnsToBombCopy[j] - 1
      }
      setTurnsToBomb(turnsToBombCopy)
    }
    socket.emit('iMoved', { squares: squaresCopy })
  }

  const renderSquare = (i) => {
    let value
    var squareCanBeClicked = canIMove && !gameOver && i === clickedSquare
    if (squareCanBeClicked && !squares[i]) {
      if (turnsToBomb[iAmRed ? 0 : 1] === 0) {
        return <div className="bigsquare">
          <button id="parachute" className="minisquare" onClick={() => handleClick(i, 'parachute')} >
            <img src={iAmRed ? redParachute : blueParachute} height="50" width="50" />
          </button>
          <button id="bomb" className="minisquare" onClick={() => handleClick(i, 'bomb')} >
            <img src={bomb} height="50" width="50" />
          </button>
        </div>
      } else {
        value = <div className="bigsquare">
          <button className="minisquare" onClick={() => handleClick(i, 'parachute')} style={{ height: "100%" }}>
            <img src={iAmRed ? redParachute : blueParachute} height="50" width="50" />
          </button>
        </div>
      }
    } else if (squareCanBeClicked && (iAmRed && squares[i] === 'RedPara' || !iAmRed && squares[i] === 'BluePara')) {
      return <div className="bigsquare">
        <button className="minisquare" onClick={() => handleClick(i, 'soldier')} style={{ height: "100%" }}>
          <img src={iAmRed ? redSoldier : blueSoldier} height="50" width="50" />
        </button>
      </div>
    } else if (squareCanBeClicked && (iAmRed && squares[i] === 'RedSoldier' || !iAmRed && squares[i] === 'BlueSoldier')) {
      handleClick(i, 'soldierWantsToMove')
      value = <img src={iAmRed ? redSoldier : blueSoldier} onClick={() => handleClick(i, 'soldierDoesntWantToMove')} height="50" width="50" />
    } else if (canIMove && !gameOver && squares[i] && squares[i].split(' ')[0] === 'movableSquare') {
      return <button className="redsquare" onClick={() => handleClick(i, 'soldierMoved')} />
    } else {
      if (squares[i] === 'RedPara') {
        value = <img src={redParachute} height="50" width="50" />
      } else if (squares[i] === 'BluePara') {
        value = <img src={blueParachute} height="50" width="50" />
      } else if (squares[i] === 'RedSoldier') {
        value = <img src={redSoldier} height="50" width="50" />
      } else if (squares[i] === 'BlueSoldier') {
        value = <img src={blueSoldier} height="50" width="50" />
      } else if (squares[i] === 'Bomb') {
        value = <img className="bomb" src={bomb} height="50" width="50" />
      } else {
        value = ""
      }
    }
    return <button className="square"
      id={`square${i}`}
      onClick={() => {
        isSoldierMoving ? handleClick(i, 'soldierDoesntWantToMove') : setClickedSquare(clickedSquare === -1 ? i : -1)
      }
      }
    >{value}</button>
  }

  return (
    <div className="board">
      {waitingForBlue ? <div className="popup"><div className="popup_inner">Waiting for Player 2 to join...</div></div> : null}
      <div className="infoBar">
        <div className="leftInnerContainer">{`Team ${iAmRed ? 'Red' : 'Blue'}`}</div>
        {gameOver ?
          <div className="rightInnerContainer">{(calculateWinner() === 'Red' && iAmRed || calculateWinner() === 'Blue' && !iAmRed) ? 'You Won!' : 'You Lost'}</div>
          :
          <div className="rightInnerContainer">{'Next Player: ' + (redIsNext ? 'Red' : 'Blue')}</div>
        }
      </div>
      <div className="board-row">
        <button className="square" />
        {renderSquare(0)}
        <Base baseNumber={0} adjacentSquares={[squares[0], squares[5], squares[1]]} />
        {renderSquare(1)}
        <Base baseNumber={1} adjacentSquares={[squares[1], squares[7], squares[2]]} />
        {renderSquare(2)}
        <button className="square" />
      </div>
      <div className="board-row">
        {renderSquare(3)}
        {renderSquare(4)}
        {renderSquare(5)}
        {renderSquare(6)}
        {renderSquare(7)}
        {renderSquare(8)}
        {renderSquare(9)}
      </div>
      <div className="board-row">
        <Base baseNumber={2} adjacentSquares={[squares[3], squares[10], squares[13]]} />
        {renderSquare(10)}
        <Base baseNumber={3} adjacentSquares={[squares[5], squares[10], squares[11], squares[15]]} />
        {renderSquare(11)}
        <Base baseNumber={4} adjacentSquares={[squares[7], squares[11], squares[12], squares[17]]} />
        {renderSquare(12)}
        <Base baseNumber={5} adjacentSquares={[squares[9], squares[12], squares[19]]} />
      </div>
      <div className="board-row">
        {renderSquare(13)}
        {renderSquare(14)}
        {renderSquare(15)}
        {renderSquare(16)}
        {renderSquare(17)}
        {renderSquare(18)}
        {renderSquare(19)}
      </div>
      <div className="board-row">
        <Base baseNumber={6} adjacentSquares={[squares[13], squares[20], squares[23]]} />
        {renderSquare(20)}
        <Base baseNumber={7} adjacentSquares={[squares[15], squares[20], squares[21], squares[25]]} />
        {renderSquare(21)}
        <Base baseNumber={8} adjacentSquares={[squares[17], squares[21], squares[22], squares[27]]} />
        {renderSquare(22)}
        <Base baseNumber={9} adjacentSquares={[squares[19], squares[22], squares[29]]} />
      </div>
      <div className="board-row">
        {renderSquare(23)}
        {renderSquare(24)}
        {renderSquare(25)}
        {renderSquare(26)}
        {renderSquare(27)}
        {renderSquare(28)}
        {renderSquare(29)}
      </div>
      <div className="board-row">
        <button className="square" />
        {renderSquare(30)}
        <Base baseNumber={10} adjacentSquares={[squares[25], squares[30], squares[31]]} />
        {renderSquare(31)}
        <Base baseNumber={11} adjacentSquares={[squares[27], squares[31], squares[32]]} />
        {renderSquare(32)}
        <button className="square" />
      </div>

      <div className="infoBar">
        <div className="leftInnerContainer">
          {gameOver ? null : (turnsToBomb[iAmRed ? 0 : 1] > 0 ? `You can plant a bomb in ${turnsToBomb[iAmRed ? 0 : 1]} turns` : 'You can plant a bomb now')}
          <br />
          {gameOver ? null : (turnsToBomb[iAmRed ? 1 : 0] > 0 ? `Opponent can plant a bomb in ${turnsToBomb[iAmRed ? 1 : 0]} turns` : 'Opponent can plant a bomb now')}
        </div>
        <div className="rightInnerContainer">
          {'Bases Captured: ' + (!redBlueBases ? 0 : redBlueBases.filter(base => base === (iAmRed ? 1 : 2)).length)} <br />
          {'Opponent Bases: ' + (!redBlueBases ? 0 : redBlueBases.filter(base => base === (!iAmRed ? 1 : 2)).length)}
        </div>
      </div>
    </div>
  );
}

const Base = ({ baseNumber, adjacentSquares }) => {
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
    redBlueBases = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }
  if (numberOfRedOccupants > (adjacentSquares.length / 2)) {
    redBlueBases[baseNumber] = 1
    return <button className="square" >
      <img src={bunkerRed} height="75" width="75" />
    </button>
  } else if (numberOfBlueOccupants > (adjacentSquares.length / 2)) {
    redBlueBases[baseNumber] = 2
    return <button className="square" >
      <img src={bunkerBlue} height="75" width="75" />
    </button>
  } else {
    redBlueBases[baseNumber] = 0
    return <button className="square" >
      <img src={bunker} height="75" width="75" />
    </button>
  }
}

function calculateWinner() {
  const basesToWin = 8
  var redBases = 0
  var blueBases = 0

  redBlueBases.forEach(item => {
    if (item === 1) {
      redBases++
    } else if (item === 2) {
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
    [4],
    [6],
    [8],
    [4],
    [0, 3, 5, 10],
    [4, 6],
    [1, 5, 7, 11],
    [6, 8],
    [2, 7, 9, 12],
    [8],
    [4, 14],
    [6, 16],
    [8, 18],
    [14],
    [10, 13, 15, 20],
    [14, 16],
    [11, 15, 17, 21],
    [16, 18],
    [12, 17, 19, 22],
    [18],
    [14, 24],
    [16, 26],
    [18, 28],
    [24],
    [20, 23, 25, 30],
    [24, 26],
    [21, 25, 27, 31],
    [26, 28],
    [22, 27, 29, 32],
    [28],
    [24],
    [26],
    [28]
  ]
  return adjacency[i]
}

export default GameSeven;