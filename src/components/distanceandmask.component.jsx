import React from 'react';
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import { drawPerson, drawMask } from '../utilities';
import Webcam from 'react-webcam';
import FPSStats from 'react-fps-stats';
import img1 from '../assets/img1.jpg'
import {Button} from '@material-ui/core';

class DistanceAndMask extends React.Component {

    state = {
        ssdmodel: null,
        maskmodel: null,
        maskModelUrl: 'https://masktfjs.s3.us-east.cloud-object-storage.appdomain.cloud/model.json',
        webcamRef: React.createRef(null),
        canvasRef: React.createRef(null),
        numberOfPeople: null,
        numberofPeopleInDanger: null,
        withMask: null,
        withoutMask: null,
        maskWearedIncorrect: null,
        settings:JSON.parse(localStorage.getItem("settings")),
        lastAutoEmailSent:null
    }

    sendAlertEmail = () => {
        const { settings } = this.state;
        console.log(settings.lastAlertEmailSent);
        // if (this.state.numberOfPeople <= this.state.settings.threshold) {
        //     alert("Observed capacity is less than or equal to allowedCapacity");
        //     return;
        // }

        //3,00,000 milliseconds = 5 minutes
        if (settings.lastAlertEmailSent && (new Date().getTime() - settings.lastAlertEmailSent < 300000)) {
            if(this.state.settings.autoEmail === "false"){
                alert("Last alert email was sent less than just 5 minutes ago\nNext email can be sent at " + new Date(settings.lastAlertEmailSent + 300000));
                return;
            } else return;
        }

        fetch('http://localhost:8080/alert/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...settings, allowedCapacity: settings.threshold, observedCapacity: this.state.numberOfPeople,time: new Date().getTime() })
        })
            .then(res => res.json())
            .then(({ err, message }) => {
                if (err === true) {
                    alert("Error in sending alert email");
                } else {
                    alert(message);
                    settings["lastAlertEmailSent"] = new Date().getTime();
                    localStorage.removeItem("settings");
                    console.log(settings);
                    localStorage.setItem("settings", JSON.stringify(settings));
                    this.setState({ settings: JSON.parse(localStorage.getItem("settings")) })
                }
            })
    }

    async componentDidMount() {
        const ssdmodel = await cocossd.load();
        const maskmodel = await tf.loadGraphModel(this.state.maskModelUrl);
        console.log("Mask and SSD models loaded");
        this.setState({ ssdmodel, maskmodel });

        setInterval(() => {
            this.detectMask();
        }, 200);

        setInterval(() => {
            this.detectPerson();
        }, 200);
    }

    detectMask = async () => {
        const { webcamRef, canvasRef, maskmodel } = this.state;

        // Check data is available
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4 &&
            maskmodel != null
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
            const resizedImg = tf.image.resizeBilinear(img, [900, 580]);
            const castedImg = resizedImg.cast('int32');
            const expandedImg = castedImg.expandDims(0);
            const obj = await maskmodel.executeAsync(expandedImg);
            // const obj = await net.executeAsync(expanded)
            // // console.log(await obj[4].array());
            const boxes = await obj[6].array()
            const classes = await obj[3].array()
            const scores = await obj[4].array()

            // Draw mesh
            if (canvasRef.current) {

                const ctx = canvasRef.current.getContext("2d");

                // 5. TODO - Update drawing utility
                // drawSomething(obj, ctx)  
                // console.log(classes[0][0]);
                drawMask(boxes[0], classes[0], scores[0], 0.8, videoWidth, videoHeight, ctx);
            }

            tf.dispose(img)
            tf.dispose(resizedImg)
            tf.dispose(castedImg)
            tf.dispose(expandedImg)
            tf.dispose(obj)
        }
    }

    detectPerson = () => {
        const { webcamRef, canvasRef, ssdmodel, maskmodel } = this.state;

        // Check data is available
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4 &&
            ssdmodel != null &&
            maskmodel != null
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
                    var obj = [];
                    for (let i = 0; i < tempobj.length; i++) {
                        if (tempobj[i].class === "person") {
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

                    if (this.state.settings.autoEmail==="true" && this.state.numberOfPeople > this.state.settings.threshold && (new Date().getTime() - this.state.settings.lastAlertEmailSent) > 300000
                        && (!this.state.lastAutoEmailSent || (new Date().getTime() - this.state.lastAutoEmailSent) > 5000)) {
                        console.log("Sending auto email alert");
                        this.sendAlertEmail();
                        this.setState({ lastAutoEmailSent: new Date().getTime() })
                    }
                    this.setState({ numberOfPeople: person.length, numberofPeopleInDanger: danger.size })

                })




        }
    }

    videoConstraints = {
        height: '480',
        width: '900',
        facingMode: 'user'
    }

    render() {
        // console.log(this.state);
        if (!this.state.ssdmodel) {
            return <h1>Loading...</h1>
        }
        return (
            <div style={{
                position: "absolute",
                width:"100%",
                height:"91vh",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                textAlign: "center",
                backgroundImage : `url(${img1})`
                
            }}>
                <h1>Social Distance and Mask Monitoring</h1>
                <h3>Number of people = {this.state.numberOfPeople}</h3>
                <h3>Danger = {this.state.numberofPeopleInDanger}</h3>

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
                {
                    this.state.settings.autoEmail === "false" &&
                    <Button variant="contained" color="primary" style={{
                        position: "relative",
                        left: "40%",
                        top: "0%",
                        cursor:"pointer"
                    }}
                        onClick={this.sendAlertEmail}
                    >
                        Send Alert! Email
                    </Button>
                }
            </div>
        )
    }
}

export default DistanceAndMask;