const {makeMove} = require('./gamesimul.js')
const tf = require('@tensorflow/tfjs-node')
const BOARD_RANGE = 10
const NUMBER_OF_CELLS = 33
const CONVERSION = {
  'RedPara': 1,
  'BluePara': 2,
  'RedSoldier': 3,
  'BlueSoldier': 4,
  'RedTank': 5,
  'BlueTank': 6,
  'RedTrench': 7,
  'BlueTrench': 8,
  'RedSpy': 9,
  'BlueSpy': 10,
  'Bomb' : 11
}
const agentTurnsToBomb = Array()

function newAgent(socketId) {
  agentTurnsToBomb.push({
    key: socketId,
    value: 0
  })
}

async function getNewSquares(squares,socketId, callback) {
  //convert squares to state
  const state = Array(NUMBER_OF_CELLS).fill(0)
  squares.forEach((item, index) => {
    if (item) {
      for (var key in CONVERSION) {
        if (key===item) {
          //divide by BOARD_RANGE
          state[index] = CONVERSION[key]/BOARD_RANGE
        }
      }
    }
  })
  //predict
  const model = await tf.loadLayersModel('file://tfjs_dir/model.json');
  var moves = reverseArgSort(model.predict(tf.stack([state])).arraySync()[0])
  //give back new squares array
  let canBomb = null
  agentTurnsToBomb.forEach(agent => {
    if (agent.key===socketId) {
      canBomb = agent.value>0 ? false : true
    }
  })
  if (canBomb === null) {
    newAgent(socketId)
    canBomb=true
  }
  for (var i=0; i<NUMBER_OF_CELLS; i++) {
    state[i]*=BOARD_RANGE
  }
  //console.log('moves '+moves+'\nnumber of moves: '+moves.length)
  let {newSquares, isBomb} = makeMove(moves,state,canBomb,2)
  agentTurnsToBomb.forEach(agent => {
    if (agent.key===socketId) {
      agent.value = isBomb 
        ? 4 
        : (agent.value===0 ? 0 : agent.value-1)
    }
  })
  newSquares.forEach((newSquare, i) => {
    for (var key in CONVERSION) {
      if (CONVERSION[key]===newSquare) {
        newSquares[i]=key
      } else if (newSquare===0) {
        newSquares[i] = null
      }
    }
  })
  callback(newSquares)
}

function reverseArgSort(arr) {
  return arr.map((value, index) => {return {index, value}})
    .sort((a,b) => {return a.value<b.value ? 1 : -1})
    .map(element => element.index)
}

module.exports = {getNewSquares}
