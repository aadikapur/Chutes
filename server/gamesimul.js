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
  [28]]
const soldierSpyMoveList = [[0, 4], [1, 6], [2, 8], [3, 4], [4, 0], [4, 3], [4, 5], [4, 10], [5, 4], [5, 6], [6, 1], [6, 5], [6, 7], [6, 11], [7, 6], [7, 8], [8, 2], [8, 7], [8, 9], [8, 12], [9, 8], [10, 4], [10, 14], [11, 6], [11, 16], [12, 8], [12, 18], [13, 14], [14, 10], [14, 13], [14, 15], [14, 20], [15, 14], [15, 16], [16, 11], [16, 15], [16, 17], [16, 21], [17, 16], [17, 18], [18, 12], [18, 17], [18, 19], [18, 22], [19, 18], [20, 14], [20, 24], [21, 16], [21, 26], [22, 18], [22, 28], [23, 24], [24, 20], [24, 23], [24, 25], [24, 30], [25, 24], [25, 26], [26, 21], [26, 25], [26, 27], [26, 31], [27, 26], [27, 28], [28, 22], [28, 27], [28, 29], [28, 32], [29, 28], [30, 24], [31, 26], [32, 28]]
const tankMoveList=[[0, 10], [0, 3], [0, 4], [0, 5], [1, 11], [1, 5], [1, 6], [1, 7], [2, 8], [2, 9], [2, 12], [2, 7], [3, 0], [3, 10], [3, 4], [3, 5], [4, 0], [4, 3], [4, 5], [4, 6], [4, 10], [4, 14], [5, 0], [5, 1], [5, 3], [5, 4], [5, 6], [5, 7], [5, 10], [5, 11], [6, 1], [6, 4], [6, 5], [6, 7], [6, 8], [6, 11], [6, 16], [7, 1], [7, 2], [7, 5], [7, 6], [7, 8], [7, 9], [7, 11], [7, 12], [8, 2], [8, 6], [8, 7], [8, 9], [8, 12], [8, 18], [9, 8], [9, 2], [9, 12], [9, 7], [10, 0], [10, 3], [10, 4], [10, 5], [10, 13], [10, 14], [10, 15], [10, 20], [11, 1], [11, 5], [11, 6], [11, 7], [11, 15], [11, 16], [11, 17], [11, 21], [12, 2], [12, 7], [12, 8], [12, 9], [12, 17], [12, 18], [12, 19], [12, 22], [13, 10], [13, 20], [13, 14], [13, 15], [14, 4], [14, 10], [14, 13], [14, 15], [14, 16], [14, 20], [14, 24], [15, 10], [15, 11], [15, 13], [15, 14], [15, 16], [15, 17], [15, 20], [15, 21], [16, 6], [16, 11], [16, 14], [16, 15], [16, 17], [16, 18], [16, 21], [16, 26], [17, 11], [17, 12], [17, 15], [17, 16], [17, 18], [17, 19], [17, 21], [17, 22], [18, 8], [18, 12], [18, 16], [18, 17], [18, 19], [18, 22], [18, 28], [19, 17], [19, 18], [19, 12], [19, 22], [20, 10], [20, 13], [20, 14], [20, 15], [20, 23], [20, 24], [20, 25], [20, 30], [21, 11], [21, 15], [21, 16], [21, 17], [21, 25], [21, 26], [21, 27], [21, 31], [22, 32], [22, 12], [22, 17], [22, 18], [22, 19], [22, 27], [22, 28], [22, 29], [23, 24], [23, 25], [23, 20], [23, 30], [24, 14], [24, 20], [24, 23], [24, 25], [24, 26], [24, 30], [25, 20], [25, 21], [25, 23], [25, 24], [25, 26], [25, 27], [25, 30], [25, 31], [26, 16], [26, 21], [26, 24], [26, 25], [26, 27], [26, 28], [26, 31], [27, 32], [27, 21], [27, 22], [27, 25], [27, 26], [27, 28], [27, 29], [27, 31], [28, 32], [28, 18], [28, 22], [28, 26], [28, 27], [28, 29], [29, 32], [29, 27], [29, 28], [29, 22], [30, 24], [30, 25], [30, 20], [30, 23], [31, 25], [31, 26], [31, 27], [31, 21], [32, 27], [32, 28], [32, 29], [32, 22]]
  

function getLegalMoves(squares, canBomb, playerNum) {
  const parachutes = []
  const bombs = []
  const makeSoldiers = []
  const moveSoldiers = []
  const makeTanks = []
  const moveTanks = []
  const makeTrenches = []
  const makeSpies = []
  const moveSpies = []
  squares.forEach((square, index) => {
    if (square===0) { //empty
      parachutes.push(index)
      if (canBomb) {
        bombs.push(index)
      }
    } else if (playerNum===1 ? square===1 : square===2){ //parachute
      makeSoldiers.push(index)
      makeTrenches.push(index)
    } else if (playerNum===1 ? square===3 : square===4) { //soldier
      adjacency[index].forEach(adjacentI => {
        if (![5,6,7,8].includes(squares[adjacentI])) {
          moveSoldiers.push([index,adjacentI])
        }
      })
      makeTanks.push(index)
    } else if (playerNum===1 ? square===5 : square===6) { //tank
      getTwoFarAdjacencySet(i).forEach(twoFarI => {
        moveTanks.push([index,twoFarI])
      })
    } else if (playerNum===1 ? square===7 : square===8) { //trench
      makeSpies.push(index)
    } else if (playerNum===1 ? square===9 : square===10) { //spy
      adjacency[index].forEach(adjacentI => {
        if (playerNum===1 ? [2,4,6,8,10].includes(squares[adjacentI])
          : [1,3,5,7,9].includes(squares[adjacentI])) {
          moveSpies.push(adjacentI)
        }
      })
    }
  });
  return [parachutes,bombs,makeSoldiers,moveSoldiers,makeTanks
    ,moveTanks,makeTrenches,makeSpies,moveSpies]
}

function getTwoFarAdjacencySet(i) {
  let twoFarSet = new Set()
  adjacency[i].forEach(adjacentI => {
    twoFarSet.add(adjacentI)
    adjacency[adjacentI].forEach(twoFarI => {
      if (twoFarI !== i) {
        twoFarSet.add(twoFarI)
      }
    })
  })
  return twoFarSet
}

function putParachute(squares, i, playernum) {
  squares[i] = playernum===1?1:2
  return squares
}

function putBomb(squares,i) {
  adjacency[i].forEach(adjacentI => {
    if ([7,8].includes(squares[adjacentI])) {
      squares[adjacentI]=squares[adjacentI]-6
    } else {
      squares[adjacentI]=0
    }
  })
}

function makeSoldier(squares,i,playernum) {
  squares[i]=playernum===1 ? 3 : 4
  return squares
}

function moveSoldier(squares,origin,destination) {
  squares[destination]=squares[origin]
  squares[origin] = 0
  return squares
}

function makeTank(squares,i,playernum) {
  squares[i] = playernum===1 ? 5 : 6
  return squares
}

function moveTank(squares,origin,destination) {
  squares[destination] = squares[origin]
  squares[origin]=0
  if (!adjacency[origin].includes(destination)) {
    let middleI = adjacency[origin].filter(adjacentToOrigin => adjacency[destination].includes(adjacentToOrigin))
    squares[middleI] = 0
  }
  return squares
}

function makeTrench(squares,i,playernum) {
  squares[i] = playernum===1 ? 7 : 8
  return squares
}

function makeSpy(squares,i,playernum) {
  squares[i] = playernum===1 ? 9 : 10
  return squares
}

function moveSpy(squares,destination,playernum) {
  squares[destination] = playernum===1 ? squares[destination]-1
    : squares[destination]+1
  return squares
}

function makeMove(moves,squares,canBomb,playernum) {
  let [parachutes,bombs,makeSoldiers,moveSoldiers,makeTanks
    ,moveTanks,makeTrenches,makeSpies,moveSpies]
    = getLegalMoves(squares,canBomb,playernum)
  let moveFound = false
  let i = 0
  while(!moveFound && i<546) {
    let move = moves[i]
    if (move < 33 && parachutes.includes(move)) {
      squares = putParachute(squares,move,playernum)
      moveFound=true
    } else if (move<66 && bombs.includes(move-33)) {
      squares = putBomb(squares,move-33)
      moveFound = true
      return {newSquares: squares, isBomb: true}
    } else if (move<99) {
      move-=66
      if (makeSoldiers.includes(move)) {
        squares = makeSoldier(squares,move,playernum)
        moveFound=true
      }
    } else if (move<171) {
      move-=99
      if (moveSoldiers.includes(soldierSpyMoveList[move])) {
        squares = moveSoldier(squares,soldierSpyMoveList[move][0], soldierSpyMoveList[move][1])
        moveFound=true
      }
    } else if (move<204) {
      move-=171
      if (makeTanks.includes(move)) {
        squares = makeTank(squares,move,playernum)
        moveFound=true
      }
    } else if (move<408) {
      move-=204
      let tankMove = tankMoveList[move]
      if (moveTanks.includes(tankMove)) {
        squares = moveTank(squares,tankMove[0], tankMove[1])
        moveFound=true
      }
    } else if (move-441) {
      move-=408
      if (makeTrenches.includes(move)) {
        squares = makeTrench(squares,move,playernum)
        moveFound=true
      }
    } else if (move<474) {
      move-=441
      if (makeSpies.includes(move)) {
        squares = makeSpy(squares,move,playernum)
        moveFound=true
      }
    } else if (move<546) {
      move-=474
      let spyMove = soldierSpyMoveList[move]
      if (moveSpies.includes(spyMove)) {
        squares = moveSpy(squares,spyMove[1],playernum)
        moveFound=true
      }
    }

    //return if move was found otherwise iterate over next i
    if (moveFound) {
      return {newSquares: squares, isBomb: false}
    } else {
      i++
    }
  }
}

module.exports = {makeMove}