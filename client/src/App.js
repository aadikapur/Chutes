import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Join from './components/Join/Join';
import GameSeven from './components/Game/GameSeven'

const App = () => (
    <Router>
        <Route path="/" exact component={Join} />
        <Route path="/gameseven" component={GameSeven} />
    </Router>
);

export default App;
