import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Join from './components/Join/Join';
import Game from './components/Game/Game';
import GameSameScreen from './components/GameSameScreen/GameSameScreen'

const App = () => (
    <Router>
        <Route path="/" exact component={Join} />
        <Route path="/game" component={Game} />
        <Route path="/samescreen" component={GameSameScreen} />
    </Router>
);

export default App;
