import React, {useState, useEffect} from 'react'
import queryString from 'query-string'
import io from 'socket.io-client'
import './Chat.css'
//Assumes the server port is localhost:5000
const ENDPOINT = 'localhost:5000'
let socket

const Chat = ({ location }) => {
  //useState is hook to define init and update
  const [name, setName] = useState('')
  const [room, setRoom] = useState('')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState('')

  //useEffect is hook to define lifecycle of chat component
  useEffect(() => {
    const {name, room} = queryString.parse(location.search)
    setName(name)
    setRoom(room)

    //the variable socket is now a socket to ENDPOINT
    socket = io(ENDPOINT)
    //socket join
    socket.emit('join', {name, room}, (error) => {
      if (error) {
        alert(error)
      }
    })
    //cleanup for chat component
    return () => {
      //socket disconnect
      socket.emit('disconnect')
      socket.off()
    }
    //useEffect only fires when ENDPOINT or location.search change
  }, [ENDPOINT, location.search])

  useEffect(() => {
    socket.on('message', (message) => {
      //...messages means all of the things in messages listed out
      setMessages([...messages, "<br />" + message.text])
    })
  }, [])

  const sendMessage = (event) => {
    event.preventDefault()
    if (message) {
      socket.emit('sendMessage', message, () => setMessage(''))
    }
  }

  return (
    <div className="outerContainer">
      <div className="container">
        <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}/>
      </div>
    </div>
  )
}

export default Chat;
