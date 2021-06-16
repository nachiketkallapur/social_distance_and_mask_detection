// Import dependencies
import React from 'react';
import {Route, Switch} from 'react-router-dom';
import HomePage from './components/homepage.component';
import SocialDistance from './components/socialdistance.component.jsx';
import Mask from './components/mask.component.jsx';
import DistanceAndMask from './components/distanceandmask.component';

class App extends React.Component {

  render(){
    return (
      <Switch>
        <Route exact={true} path='/' component={HomePage} />
        <Route exact path='/socialdistance' component={SocialDistance} /> 
        <Route exact path='/mask' component={Mask} /> 
        <Route exact path='/distanceandmask' component={DistanceAndMask} /> 
      </Switch>
    )
  }
}

export default App;