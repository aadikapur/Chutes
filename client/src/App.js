import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Join from './components/Join/Join';
import GameSeven from './components/Game/GameSeven'
import GameAI from './components/Game/GameAI'

const App = () => (
    <Router>
        <Route path="/" exact component={Join} />
        <Route path="/game" component={GameSeven} />
        <Route path="/ai" component={GameAI} />
    </Router>
);

export default App;
