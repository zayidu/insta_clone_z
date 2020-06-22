import React from 'react';
import './App.css';
import { BrowserRouter, Route } from 'react-router-dom';
import Home from './components/screens/Home';
import SignIn from './components/screens/SignIn';
import Profile from './components/screens/Profile';
import SignUp from './components/screens/SignUp';

import NavBar from './components/NavBar';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <NavBar />
        <Route exact path="/" component={Home} />
        <Route exact path="/profile" component={Profile} />
        <Route exact path="/signin" component={SignIn} />
        <Route exact path="/signup" component={SignUp} />
      </div>
    </BrowserRouter>
  );
}

export default App;
