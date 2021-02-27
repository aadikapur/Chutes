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
import redTrench from './redTrench.png'
import blueTrench from './blueTrench.png'
import redTank from './redTank.png'
import blueTank from './blueTank.png'
import redArrow from './redArrow.png'
import blueArrow from './blueArrow.png'
import redSpy from './redSpy.png'
import blueSpy from './blueSpy.png'
import instructionstotal from './instructionstotal.png'
import './Game.css';
let socket
let redBlueBases

const GameSeven = ({ location }) => {
  const [room, setRoom] = useState('')
  const [redirect, setRedirect] = useState(false)
  const [socketInitialized, setSocketInitialized] = useState(false)

  useEffect(() => {
    const { room } = queryString.parse(location.search)
    setRoom(room)
    socket = io()
    socket = io('localhost:5000')
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
  }, [location.search])

  return (
    <div className="game">
      {redirect ? <Redirect to='/' /> : null}
      {socketInitialized ? <Board socket={socket} room={room} /> : null}
    </div>
  );
}

function Board({ socket, room }) {
  //game states
  const [squares, setSquares] = useState(() => {
    const redsquares = [0, 1, 2, 30, 31, 32]
    const bluesquares = [3, 9, 13, 19, 23, 29]
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
  //movable squares
  const [movableSquaresJustTurnedOff, setMovableSquaresJustTurnedOff] = useState(false)
  const [isMovableSquareViewOpen, setMovableSquareViewOpen] = useState(false)
  const [tempMovableSquaresOverwrite, setOverwritten] = useState(Array(33).fill(null))
  //popup states
  const [waitingForBlue, setWaitingForBlue] = useState(false)
  const [instructions, setInstructions] = useState(0)
  const [leaveOrRestartPopup, setLeaveOrRestartPopup] = useState(false)
  const [redirect, setRedirect] = useState(false)
  //highlighted square
  const [highlightedSquare, setHighlightedSquare] = useState(-1)

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
    socket.on('otherGuyMoved', ({ squares, highlightedSquare }) => {
      setSquares(squares)
      setHighlightedSquare(highlightedSquare)
    })
  }, [socket])

  useEffect(() => {
    if (canIMove) {
      const turnsToBombCopy = turnsToBomb.slice()
      turnsToBombCopy[iAmRed ? 1 : 0] = turnsToBombCopy[iAmRed ? 1 : 0] === 0 ? 0 : turnsToBombCopy[iAmRed ? 1 : 0] - 1
      setTurnsToBomb(turnsToBombCopy)
    }
  }, [canIMove])

  useEffect(() => {
    var moveHasntFinishedYet = false
    if (movableSquaresJustTurnedOff) {
      setMovableSquaresJustTurnedOff(false)
      return
    }
    squares.forEach((item, index) => {
      if (item === 'Bomb') {
        moveHasntFinishedYet = true
        if (canIMove===false) {
          setTurnsToBomb(iAmRed === canIMove ? [5, turnsToBomb[1]] : [turnsToBomb[0], 5])
        } else {
          setTurnsToBomb(iAmRed === canIMove ? [4, turnsToBomb[1]] : [turnsToBomb[0], 4])
        }
        setTimeout(() => {
          const squaresCopy = squares.slice()
          getAdjacentSquares(index).forEach((adjacentSquare) => {
            if (squaresCopy[adjacentSquare] && squaresCopy[adjacentSquare].split(/(?=[A-Z])/)[1] === 'Trench') {
              squaresCopy[adjacentSquare] = squaresCopy[adjacentSquare].split(/(?=[A-Z])/)[0].concat('Para')
            } else {
              squaresCopy[adjacentSquare] = null
            }
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
    setCanIMove(c => !c)
    if (calculateWinner()) {
      setGameEnded(true)
      setLeaveOrRestartPopup(true)
    }
    setNextRed(r => !r)
  }, [squares])

  const handleClick = (i, item) => {
    setClickedSquare(-1)
    const squaresCopy = squares.slice()
    let highlightedSquareToSend = -1
    if (item === 'bomb') {
      squaresCopy[i] = 'Bomb'
      setHighlightedSquare(i)
      highlightedSquareToSend=i
      setSquares(squaresCopy)
    } else if (item === 'soldierWantsToMove') {
      setMovableSquareViewOpen(true)
      const tempArray = Array(33).fill(null)
      getAdjacentSquares(i).forEach(adjacentSquare => {
        if (!squaresCopy[adjacentSquare] || !(squaresCopy[adjacentSquare].split(/(?=[A-Z])/)[1] === 'Trench'
            || squaresCopy[adjacentSquare].split(/(?=[A-Z])/)[1] === 'Tank')) {
          tempArray[adjacentSquare] = squaresCopy[adjacentSquare]
          squaresCopy[adjacentSquare] = `movableSquare ${i} soldier`
        }
      })
      setOverwritten(tempArray)
      setSquares(squaresCopy)
      return
    } else if (item === 'tankWantsToMove') {
      setMovableSquareViewOpen(true)
      const tempArray = Array(33).fill(null)
      getAdjacentSquares(i).forEach(j => {
        tempArray[j] = squaresCopy[j]
        squaresCopy[j] = `movableSquare ${i} tank`
        getAdjacentSquares(j).forEach(twoFarSquareIndex => {
          if (twoFarSquareIndex !== i) {
            tempArray[twoFarSquareIndex] = squaresCopy[twoFarSquareIndex]
            squaresCopy[twoFarSquareIndex] = `movableSquare ${i} tank`
          }
        })
      })
      setOverwritten(tempArray)
      setSquares(squaresCopy)
      return
    } else if (item === 'spyAction') {
      const tempArray = Array(33).fill(null)
      let anyMovableSquaresFound=false
      getAdjacentSquares(i).forEach(adjacentSquare => {
        if (squaresCopy[adjacentSquare]) {
          tempArray[adjacentSquare] = squaresCopy[adjacentSquare]
          squaresCopy[adjacentSquare] = `movableSquare ${i} spy`
          anyMovableSquaresFound=true
        }
      })
      if (!anyMovableSquaresFound) {
        setMovableSquaresJustTurnedOff(true)
      } else {
        setMovableSquareViewOpen(true)
      }
      setOverwritten(tempArray)
      setSquares(squaresCopy)
      return
    } else if (item === 'closeMovableSquareView') {
      setMovableSquareViewOpen(false)
      setMovableSquaresJustTurnedOff(true)
      squaresCopy.forEach((square, index) => {
        if (square && square.split(' ')[0] === 'movableSquare') {
          squaresCopy[index] = tempMovableSquaresOverwrite[index]
          setSquares(squaresCopy)
        }
      })
      return
    } else {
      if (item === 'parachute') {
        squaresCopy[i] = redIsNext ? 'RedPara' : 'BluePara'
        setHighlightedSquare(i)
        highlightedSquareToSend=i
        setSquares(squaresCopy)
      } else if (item === 'soldier') {
        squaresCopy[i] = redIsNext ? 'RedSoldier' : 'BlueSoldier'
        setHighlightedSquare(i)
        highlightedSquareToSend=i
        setSquares(squaresCopy)
      } else if (item === 'soldierMoved') {
        setMovableSquareViewOpen(false)
        let originSquare = Number(squaresCopy[i].split(' ')[1])
        squaresCopy[originSquare] = null
        getAdjacentSquares(originSquare).forEach(adjacentSquare => {
          if (squaresCopy[adjacentSquare].split(' ')[0] === 'movableSquare') {
            squaresCopy[adjacentSquare] = tempMovableSquaresOverwrite[adjacentSquare]
          }
        })
        squaresCopy[i] = redIsNext ? 'RedSoldier' : 'BlueSoldier'
        setHighlightedSquare(i)
        highlightedSquareToSend=i
        setSquares(squaresCopy)
      } else if (item === 'tankMoved') {
        setMovableSquareViewOpen(false)
        let originSquare = Number(squaresCopy[i].split(' ')[1])
        squaresCopy.forEach((potentialMovableSquare,movableSquareIndex) => {
          if (potentialMovableSquare && potentialMovableSquare.split(' ')[0] === 'movableSquare') {
            squaresCopy[movableSquareIndex] = tempMovableSquaresOverwrite[movableSquareIndex]
          }
        })
        if (!getAdjacentSquares(originSquare).includes(i)) {
          let adjacentToOriginIndices = getAdjacentSquares(originSquare)
          let adjacentToDestinationIndices = getAdjacentSquares(i)
          let middleIndex = adjacentToOriginIndices.filter(index => adjacentToDestinationIndices.includes(index))
          squaresCopy[middleIndex] = null
        }
        squaresCopy[i] = redIsNext ? 'RedTank' : 'BlueTank'
        squaresCopy[originSquare] = null
        setHighlightedSquare(i)
        highlightedSquareToSend=i
        setSquares(squaresCopy)
      } else if (item === 'spyMoved') {
        setMovableSquareViewOpen(false)
        let originSquare = Number(squaresCopy[i].split(' ')[1])
        getAdjacentSquares(originSquare).forEach(adjacentSquare => {
          if (squaresCopy[adjacentSquare] && squaresCopy[adjacentSquare].split(' ')[0] === 'movableSquare') {
            squaresCopy[adjacentSquare] = tempMovableSquaresOverwrite[adjacentSquare]
          }
        })
        squaresCopy[i] = (redIsNext ? 'Red' : 'Blue') + squaresCopy[i].split(/(?=[A-Z])/)[1]
        setHighlightedSquare(i)
        highlightedSquareToSend=i
        setSquares(squaresCopy)
      } else if (item === 'tank') {
        squaresCopy[i] = redIsNext ? 'RedTank' : 'BlueTank'
        setHighlightedSquare(i)
        highlightedSquareToSend=i
        setSquares(squaresCopy)
      } else if (item === 'spy') {
        squaresCopy[i] = redIsNext ? 'RedSpy' : 'BlueSpy'
        setHighlightedSquare(i)
        highlightedSquareToSend=i
        setSquares(squaresCopy)
      } else if (item === 'trench') {
        squaresCopy[i] = redIsNext ? 'RedTrench' : 'BlueTrench'
        setHighlightedSquare(i)
        highlightedSquareToSend=i
        setSquares(squaresCopy)
      }
      const turnsToBombCopy = turnsToBomb.slice()
      turnsToBombCopy[iAmRed ? 0 : 1] = turnsToBombCopy[iAmRed ? 0 : 1] === 0 ? 0 : turnsToBombCopy[iAmRed ? 0 : 1] - 1
      setTurnsToBomb(turnsToBombCopy)
    }
    socket.emit('iMoved', { squares: squaresCopy, highlightedSquare: highlightedSquareToSend })
  }

  const renderSquare = (i) => {
    let value
    var squareCanBeClicked = canIMove && !gameOver && i === clickedSquare
    if (squareCanBeClicked && !squares[i]) {
      if (turnsToBomb[iAmRed ? 0 : 1] === 0) {
        return <div className="bigsquare">
          <button id="parachute" className="minisquare" onClick={() => handleClick(i, 'parachute')} >
            <img alt="parachute button" src={iAmRed ? redParachute : blueParachute} height="50" width="50" />
          </button>
          <button id="bomb" className="minisquare" onClick={() => handleClick(i, 'bomb')} >
            <img alt="bomb button" src={bomb} height="50" width="50" />
          </button>
        </div>
      } else {
        value = <div className="bigsquare">
          <button className="minisquare" onClick={() => handleClick(i, 'parachute')} style={{ height: "100%" }}>
            <img alt="parachute button" src={iAmRed ? redParachute : blueParachute} height="50" width="50" />
          </button>
        </div>
      }
    } else if (squareCanBeClicked && ((iAmRed && squares[i] === 'RedPara') || (!iAmRed && squares[i] === 'BluePara'))) {
      return <div className="bigsquare">
        <button className="minisquare" onClick={() => handleClick(i, 'soldier')} >
          <img alt="soldier button" src={iAmRed ? redSoldier : blueSoldier} height="50" width="50" />
        </button>
        <button className="minisquare" onClick={() => handleClick(i, 'trench')} >
          <img alt="trench button" src={iAmRed ? redTrench : blueTrench} height="50" width="50" />
        </button>
      </div>
    } else if (squareCanBeClicked && ((iAmRed && squares[i] === 'RedSoldier') || (!iAmRed && squares[i] === 'BlueSoldier'))) {
      return <div className="bigsquare">
        <button className="minisquare" onClick={() => handleClick(i, 'soldierWantsToMove')} >
          <img alt="arrow" src={iAmRed ? redArrow : blueArrow} height="50" width="50" />
        </button>
        <button className="minisquare" onClick={() => handleClick(i, 'tank')} >
          <img alt="tank" src={iAmRed ? redTank : blueTank} height="50" width="50" />
        </button>
      </div>
    } else if (squareCanBeClicked && ((iAmRed && squares[i] === 'RedTrench') || (!iAmRed && squares[i] === 'BlueTrench'))) {
      return <div className="bigsquare">
        <button className="minisquare" onClick={() => handleClick(i, 'spy')} style={{ height: "100%" }} >
          <img alt="spy" src={iAmRed ? redSpy : blueSpy} height="50" width="50" />
        </button>
      </div>
    } else if (squareCanBeClicked && ((iAmRed && squares[i] === 'RedSpy') || (!iAmRed && squares[i] === 'BlueSpy'))) {
      handleClick(i, 'spyAction')
    } else if (squareCanBeClicked && ((iAmRed && squares[i] === 'RedTank') || (!iAmRed && squares[i] === 'BlueTank'))) {
      handleClick(i, 'tankWantsToMove')
    } else if (canIMove && !gameOver && squares[i] && squares[i].split(' ')[0] === 'movableSquare') {
      if (squares[i].split(' ')[2] === 'soldier') {
        return <button className="redsquare" onClick={() => handleClick(i, 'soldierMoved')} />
      } else if (squares[i].split(' ')[2] === 'tank') {
        return <button className="redsquare" onClick={()=> handleClick(i, 'tankMoved')} />
      } else if (squares[i].split(' ')[2] === 'spy') {
        return <button className="redsquare" onClick={()=> handleClick(i, 'spyMoved')} />
      }
    } else {
      if (squares[i] === 'RedPara') {
        value = <img alt="" src={redParachute} height="50" width="50" />
      } else if (squares[i] === 'BluePara') {
        value = <img alt="" src={blueParachute} height="50" width="50" />
      } else if (squares[i] === 'RedSoldier') {
        value = <img alt="" src={redSoldier} height="50" width="50" />
      } else if (squares[i] === 'BlueSoldier') {
        value = <img alt="" src={blueSoldier} height="50" width="50" />
      } else if (squares[i] === 'RedTrench') {
        value = <img alt="" src={redTrench} height="50" width="50" />
      } else if (squares[i] === 'BlueTrench') {
        value = <img alt="" src={blueTrench} height="50" width="50" />
      } else if (squares[i] === 'RedTank') {
        value = <img alt="" src={redTank} height="50" width="50" />
      } else if (squares[i] === 'BlueTank') {
        value = <img alt="" src={blueTank} height="50" width="50" />
      } else if (squares[i] === 'RedSpy') {
        value = <img alt="" src={redSpy} height="50" width="50" />
      } else if (squares[i] === 'BlueSpy') {
        value = <img alt="" src={blueSpy} height="50" width="50" />
      } else if (squares[i] === 'Bomb') {
        value = <img alt="" className="bomb" src={bomb} height="50" width="50" />
      } else {
        value = ""
      }
    }
    return <button className="square"
      id={`square${i}`}
      onClick={() => {
        isMovableSquareViewOpen ? handleClick(i, 'closeMovableSquareView') : setClickedSquare(clickedSquare === -1 ? i : -1)
      }
      }
      style={highlightedSquare===i ? {background: "tan"} : {}}
    >{value}</button>
  }
  
  const renderInstructionsImage = () => {
    switch (instructions) {
      case 1:
        return <img alt="" className="instructionsContent" src={instructionstotal}/>
    }
  }

  function checkKey(e) {
    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
    }
    else if (e.keyCode == '40') {
        // down arrow
    }
    //backspace
    else if (e.keyCode == '8') {
      if (leaveOrRestartPopup===false) {
        setLeaveOrRestartPopup(true)
      } else if (leaveOrRestartPopup===true) {
        setLeaveOrRestartPopup(false)
      }
    }
    //h or ?
    else if (e.keyCode == '72' || e.keyCode == '191') {
      if (instructions<1) {
        setInstructions(1)
      } else {
        setInstructions(0)
      }
    }
  }

  return (
    <div className="board" onKeyDown={checkKey}>
      {redirect ? <Redirect to='/' /> : null}
      {waitingForBlue ?
        <div className="popup">
          <div className="popup_inner">
          <button className="popupButton2" onClick={()=> setRedirect(true)}>Leave Room</button>
          Waiting for Blue to join...
          </div>
        </div> : null}
      {instructions>0 ?
        <div className="popup">
          <div className="popup_inner">{`Instructions`}
            <button className="popupX" onClick={()=> setInstructions(0)}>X</button>
            {renderInstructionsImage()}
          </div>
        </div>
        : null}
      {leaveOrRestartPopup ?
        gameOver ?
          <div className="popup">
            <div className="popup_inner">Play Again?
              <button className="popupButton3" onClick={()=> window.location.reload(false)}>Play Again</button>
              <button className="popupButton2" onClick={()=> setRedirect(true)}>Leave Room</button>
              <button className="popupButton" onClick={()=> setLeaveOrRestartPopup(false)}>Go back to game</button>
              <button className="popupX" onClick={()=> setLeaveOrRestartPopup(false)}>X</button>
            </div>
          </div>
        :
          <div className="popup">
            <div className="popup_inner">Sure you want to leave?
              <button className="popupButton2" onClick={()=> setRedirect(true)}>Leave Room</button>
              <button className="popupButton" onClick={()=> setLeaveOrRestartPopup(false)}>Go back to game</button>
              <button className="popupX" onClick={()=> setLeaveOrRestartPopup(false)}>X</button>
            </div>
          </div>
        : null}
      <div className="infoBar">
        <div className="topInnerContainer">Room: {room}</div>
        <div className="topInnerContainer">{`Team: ${iAmRed ? 'Red' : 'Blue'}`}</div>
        {gameOver ?
          <div className="topInnerContainer">{((calculateWinner() === 'Red' && iAmRed) || (calculateWinner() === 'Blue' && !iAmRed)) ? 'You Won!' : 'You Lost'}</div>
          :
          <div className="topInnerContainer">{'Next Player: ' + (redIsNext ? 'Red' : 'Blue')}</div>
        }
        <div className="topInnerContainer"><button className="options" onClick={()=>setLeaveOrRestartPopup(true)}>&larr;</button></div>
        <div className="topInnerContainer"><button className="options" onClick={()=>setInstructions(1)}>?</button></div>
      </div>
      <div className="board-row">
        <button className="noclicksquare" />
        {renderSquare(0)}
        <Base baseNumber={0} adjacentSquares={[squares[0], squares[5], squares[1]]} />
        {renderSquare(1)}
        <Base baseNumber={1} adjacentSquares={[squares[1], squares[7], squares[2]]} />
        {renderSquare(2)}
        <button className="noclicksquare" />
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
        <button className="noclicksquare" />
        {renderSquare(30)}
        <Base baseNumber={10} adjacentSquares={[squares[25], squares[30], squares[31]]} />
        {renderSquare(31)}
        <Base baseNumber={11} adjacentSquares={[squares[27], squares[31], squares[32]]} />
        {renderSquare(32)}
        <button className="noclicksquare" />
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
    return <button className="basesquare" >
      <img alt="" src={bunkerRed} height="75" width="75" />
    </button>
  } else if (numberOfBlueOccupants > (adjacentSquares.length / 2)) {
    redBlueBases[baseNumber] = 2
    return <button className="basesquare" >
      <img alt="" src={bunkerBlue} height="75" width="75" />
    </button>
  } else {
    redBlueBases[baseNumber] = 0
    return <button className="basesquare" >
      <img alt="" src={bunker} height="75" width="75" />
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
