import React from 'react';
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import { drawPerson } from '../utilities';
import Webcam from 'react-webcam';
import FPSStats from 'react-fps-stats';

class SocialDistance extends React.Component {

    state = {
        net: null,
        webcamRef: React.createRef(null),
        canvasRef: React.createRef(null),
        numberOfPeople: 0,
        dangers: 0
    }

    async componentDidMount() {
        const net = await cocossd.load();
        this.setState({ net });

        setInterval(() => {
            this.detect(net);
        }, 200);
    }

    numberOfPeople = 0;
    dangers = 0;

    detect = () => {
        const { webcamRef, canvasRef, net } = this.state;
        if (!net) return;

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
                .then(tempobj => {
                    // Sort out only person class
                    var obj = [];
                    for (let i = 0; i < tempobj.length; i++) {
                        if (tempobj[i].class === "person") {
                            obj.push(tempobj[i]);
                        }
                    }
                    if (obj && obj.length > 0) {

                        for (let i = 0; i < obj.length; i++) {
                            if (obj[i].class !== "person") continue;
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
                                    if (Math.sqrt((c1x - c2x) * (c1x - c2x) + (c1y - c2y) * (c1y - c2y)) < 200) {
                                        if (!danger.has(i)) danger.add(i);
                                        if (!danger.has(j)) danger.add(j);
                                    }

                                }

                            }
                        }

                        // console.log(obj[0].bbox);
                        // console.log("People = ", person.length + " ", "Dangers = ", danger.size);

                        const ctx = canvasRef.current.getContext("2d");
                        drawPerson(obj, danger, ctx);

                    }

                    this.setState({ numberOfPeople: person.length, dangers: danger.size })

                })
        }
    }

    videoConstraints = {
        height: '480',
        width: '900',
        facingMode: 'user'
    }

    render() {
        // console.log("In render method");
        return (
            <div style={{ position: "relative", alignContent: "center", justifyContent: "center", margin:"0 auto",textAlign:"center" }}>
                <h1>Social Distance Component</h1>
                <h3>Number of people = {this.state.numberOfPeople} , Dangers = {this.state.dangers}</h3>
                {
                    this.state.net && (
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
                                    height: 480,
                                }}
                                audio={false}
                                height={480}
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
                                    height: 480,
                                }}
                            />
                            <FPSStats top="10%" left="95%" />
                        </>
                    )
                }

            </div>
        )
    }
}

export default SocialDistance;