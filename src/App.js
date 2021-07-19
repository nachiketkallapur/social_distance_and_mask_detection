// Import dependencies
import React from 'react';
import {Route, Switch} from 'react-router-dom';
import HomePage from './components/homepage.component';
import SocialDistance from './components/socialdistance.component';
import Mask from './components/mask.component';
import DistanceAndMask from './components/distanceandmask.component';
import Navbar from './components/navbar.component';
import img1 from './assets/img1.jpg'
import './App.css'
import Settings  from './components/settings.component';

class App extends React.Component {

  componentDidMount(){
    console.log("In component did mount");
    if(localStorage.getItem("settings")){
      var settings = JSON.parse(localStorage.getItem("settings"));

    } else {
      var settings={
        message:"SOP violation occured in the below location",
        subject:"Distance_N_Mask emal ALERT!!",
        location:"Davanagere, Karnataka",
        toEmail:"nachiketkallapur@gmail.com",
        threshold:10,
        autoEmail:false,
        lastAlertEmailSent:null
      }
    }

    navigator.geolocation.getCurrentPosition(({coords: {latitude, longitude}})=>{
      settings["latitude"]=latitude;
      settings["longitude"]=longitude;
      localStorage.removeItem("settings");
      localStorage.setItem('settings',JSON.stringify(settings));
      // console.log(latitude,longitude)
    })

  }

  // componentWillUnmount(){
  //   localStorage.removeItem("settings");
  // }

  render(){
    return (
      <div className='app-container'>
      <Navbar />
      <Switch>
        <Route exact={true} path='/' component={HomePage} />
        <Route exact path='/socialdistance' component={SocialDistance} /> 
        <Route exact path='/mask' component={Mask} /> 
        <Route exact path='/distanceandmask' component={DistanceAndMask} /> 
        <Route exact path='/settings' component={Settings} /> 
      </Switch>
      </div>
    )
  }
}

export default App;