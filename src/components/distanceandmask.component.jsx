import React from 'react';
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import { drawPerson,drawMask } from '../utilities';
import Webcam from 'react-webcam';
import FPSStats from 'react-fps-stats';

class DistanceAndMask extends React.Component {

    state = {
        ssdmodel: null,
        maskmodel:null,
        maskModelUrl: 'https://masktfjs.s3.us-east.cloud-object-storage.appdomain.cloud/model.json',
        webcamRef: React.createRef(null),
        canvasRef: React.createRef(null),
        numberOfPeople: null,
        numberofPeopleInDanger: null,
        withMask: null,
        withoutMask: null,
        maskWearedIncorrect:null
    }

    async componentDidMount() {
        const ssdmodel = await cocossd.load();
        const maskmodel = await tf.loadGraphModel(this.state.maskModelUrl);
        console.log("Mask and SSD models loaded");
        this.setState({ ssdmodel,maskmodel });

        setInterval(()=>{
            this.detectMask();
        }, 200);

        setInterval(() => {
            this.detectPerson();
        }, 200);
    }

    detectMask = async() => {
        const { webcamRef, canvasRef,maskmodel } = this.state;

        // Check data is available
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4 &&
            maskmodel !=null
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
            
             // Make mask detections
             const img = tf.browser.fromPixels(video);
             const resizedImg = tf.image.resizeBilinear(img,[900,580]);
             const castedImg = resizedImg.cast('int32');
             const expandedImg = castedImg.expandDims(0);
             const obj = await maskmodel.executeAsync(expandedImg);
             // const obj = await net.executeAsync(expanded)
             // // console.log(await obj[4].array());
             const boxes = await obj[6].array()
             const classes = await obj[3].array()
             const scores = await obj[4].array()
 
             // Draw mesh
             const ctx = canvasRef.current.getContext("2d");
 
             // 5. TODO - Update drawing utility
             // drawSomething(obj, ctx)  
             console.log(classes[0][0]);
             drawMask(boxes[0], classes[0], scores[0], 0.8, videoWidth, videoHeight, ctx);
 
             tf.dispose(img)
             tf.dispose(resizedImg)
             tf.dispose(castedImg)
             tf.dispose(expandedImg)
             tf.dispose(obj)
    }
}

    detectPerson = () => {
        const { webcamRef, canvasRef, ssdmodel,maskmodel } = this.state;

        // Check data is available
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4 &&
            ssdmodel !=null &&
            maskmodel !=null
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

            // Make Person Detections
            ssdmodel.detect(video)
                .then(tempobj => {
                    // Sort out for person class
                    var obj=[];
                    for(let i=0;i<tempobj.length;i++){
                        if(tempobj[i].class==="person") {
                            obj.push(tempobj[i]);
                        }
                    }
                    if (obj && obj.length > 0) {

                        for (let i = 0; i < obj.length; i++) {
                            var bbox = obj[i].bbox;
                            let x = bbox[0];
                            let y = bbox[1];
                            let width = bbox[2];
                            let height = bbox[3];

                            person.push([x, y, width, height]);
                        }

                        if (person) {

                            for (let i = 0; i < person.length; i++) {
                                for (let j = i + 1; j < person.length; j++) {
                                    let c1x = person[i][0] + 0.5 * person[i][2];
                                    let c1y = person[i][1] + 0.5 * person[i][3];

                                    let c2x = person[j][0] + 0.5 * person[j][2];
                                    let c2y = person[j][1] + 0.5 * person[j][3];
                                    // console.log(Math.sqrt((c1x - c2x) * (c1x - c2x) + (c1y - c2y) * (c1y - c2y)));
                                    if (Math.sqrt((c1x - c2x) * (c1x - c2x) + (c1y - c2y) * (c1y - c2y)) > 200) {
                                        if (!danger.has(i)) danger.add(i);
                                        if (!danger.has(j)) danger.add(j);
                                    }

                                }

                            }
                        }

                        // console.log(obj[0].bbox);
                        // console.log("People = ", person.length + " ", "numberofPeopleInDanger = ", danger.size);

                        const ctx = canvasRef.current.getContext("2d");
                        drawPerson(obj, danger, ctx);

                    }

                    this.setState({numberOfPeople:person.length, numberofPeopleInDanger:danger.size})

                })
            
           


        }
    }

    videoConstraints = {
        height: '580',
        width: '900',
        facingMode: 'user'
    }

    render() {
        // console.log("In render method");
        return (
            <div style={{ alignContent: "center", justifyContent: "center" }}>
                <h1>Social Distance and Mask Component</h1>
                <h3>Number of people = {this.state.numberOfPeople} , Danger = {this.state.numberofPeopleInDanger}</h3>
                {
                    this.state.ssdmodel && (
                        <>
                            <Webcam
                                style={{
                                    position: "absolute",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    left: 0,
                                    right: 0,
                                    textAlign: "center",
                                    zindex: 9,
                                    width: 900,
                                    height: 580,
                                  }}
                                audio={false}
                                height={580}
                                ref={this.state.webcamRef}
                                width={900}
                                videoConstraints={this.videoConstraints}
                                screenshotFormat='image/jpeg'
                            />
                            <canvas
                                ref={this.state.canvasRef}
                                style={{
                                    position: "absolute",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    left: 0,
                                    right: 0,
                                    textAlign: "center",
                                    zindex: 8,
                                    width: 900,
                                    height: 580,
                                  }}
                            />
                            <FPSStats/>
                        </>
                    )
                }

            </div>
        )
    }
}

export default DistanceAndMask;