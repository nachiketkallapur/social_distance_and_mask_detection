import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import "./App.css";
import { drawRect } from "./utilities";
import FPSStats from "react-fps-stats";

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
  
    const [numberOfPeople, setNumberOfPeople] = useState(0);
    const [dangers, setDangers] = useState(0);
  
    // Main function
    const runCoco = async () => {
      const net = await cocossd.load();
      console.log("Handpose model loaded.");
      //  Loop and detect hands
      setInterval(() => {
        detect(net);
      }, 10);
    };
  
    const detect = async (net) => {
      // Check data is available
      if (
        typeof webcamRef.current !== "undefined" &&
        webcamRef.current !== null &&
        webcamRef.current.video.readyState === 4
      ) {
        // Get Video Properties
        const video = webcamRef.current.video;
        const videoWidth = webcamRef.current.video.videoWidth;
        const videoHeight = webcamRef.current.video.videoHeight;
  
        // Set video width
        webcamRef.current.video.width = videoWidth;
        webcamRef.current.video.height = videoHeight;
  
        // Set canvas height and width
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
       
        var person = [];
        var danger = new Set();
  
        // Make Detections
        net.detect(video)
          .then(obj => {
            // Draw mesh
            if (obj && obj.length > 0) {
              
              for (let i = 0; i < obj.length; i++) {
                var bbox = obj[i].bbox;
                let x = bbox[0];
                let y = bbox[1];
                let width = bbox[2];
                let height = bbox[3];
  
                person.push([x, y, width, height]);
              }
  
              if(person){
  
                for (let i = 0; i < person.length; i++) {
                  for (let j = i + 1; j < person.length; j++) {
                    let c1x = person[i][0] + 0.5 * person[i][2];
                    let c1y = person[i][1] + 0.5 * person[i][3];
    
                    let c2x = person[j][0] + 0.5 * person[j][2];
                    let c2y = person[j][1] + 0.5 * person[j][3];
                    // console.log(Math.sqrt((c1x - c2x) * (c1x - c2x) + (c1y - c2y) * (c1y - c2y)));
                    if (Math.sqrt((c1x - c2x) * (c1x - c2x) + (c1y - c2y) * (c1y - c2y)) > 200) {
                      if(!danger.has(i)) danger.add(i);
                      if(!danger.has(j)) danger.add(j);
                    }
    
                  }
  
                }
              }
  
              // console.log(obj[0].bbox);
              console.log("People = " , person.length + " " , "Dangers = " , danger.size);
          
              const ctx = canvasRef.current.getContext("2d");
              drawRect(obj,danger,ctx);
  
            }
  
            setNumberOfPeople(person.length);
            setDangers(danger.size);
  
          })
      }
    };
  
    useEffect(() => { runCoco() }, []);
    // var text="abc";
    return (
      <div className="App">
          <h1>Number of People = {numberOfPeople}</h1>
          <h1>Dangers = {dangers}</h1>
        <header className="App-header">
          <Webcam
            ref={webcamRef}
            muted={true}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 9,
              width: 640,
              height: 480,
            }}
          />
  
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zindex: 8,
              width: 640,
              height: 480,
            }}
          />
          <FPSStats />
        </header>
      </div>
    );
  }
  
  export default App;