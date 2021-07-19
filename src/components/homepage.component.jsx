import React from 'react';
import FPSStats from 'react-fps-stats';
import homeimg from '../assets/homepage.jpg'
import img1 from '../assets/img1.jpg'

const HomePage = () => {
    return (
        <div style={{
            margin:"0 auto",
            textAlign:"center",
            position:"absolute",
            alignItems:"center",
            justifyContent:"center",
            height:"91vh",
            width:"100%",
            backgroundImage:`url(${img1})`
            }}>
            <h1>Welcome to Social Distance and Mask monitoring dashboard</h1>
            <img src={homeimg} alt="homeimg" style={{
                position:"relative",
                // zIndex:-1,
                width:"80%",
                height:"80%"
            }} />
        </div>
    )
}

export default HomePage;