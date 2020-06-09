import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Join from './components/Join/Join';
import GameFive from './components/Game/GameFive';
import GameSeven from './components/Game/GameSeven'

const App = () => (
    <Router>
        <Route path="/" exact component={Join} />
        <Route path="/gamefive" component={GameFive} />
        <Route path="/gameseven" component={GameSeven} />
    </Router>
);

export default App;
