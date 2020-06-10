const maxUsersInRoom = 2
const users = []

const addUser = ({ id, room}) => {
  //trim whitespace and make everything lower case
  room = room.trim().toLowerCase()

  const usersInRoom = getUsersInRoom(room)
  console.log(`users: ${users}`)
  console.log(`users in room ${room}: ${usersInRoom}`)
  if (usersInRoom && usersInRoom.length === maxUsersInRoom) {
    return {error: 'Room is full'}
  }

  //if theres no error, add user and send back user
  console.log(getUsersInRoom(room).length)
  const user = {id, room, playerNum: getUsersInRoom(room).length === 0 ? 1 : 2}
  users.push(user)
  return {user}
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)
  if (index !== -1) {
    return users.splice(index,1)[0]
  }
}

function getUser(id) {
  return users.find((user) => user.id === id)
}

function getUsersInRoom(room) {
  return users.filter(user => (user.room === room))
}

module.exports = {addUser,removeUser,getUser}