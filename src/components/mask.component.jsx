import React from 'react';
import * as tf from "@tensorflow/tfjs";
import { nextFrame } from "@tensorflow/tfjs";
import Webcam from 'react-webcam';
import FPSStats from "react-fps-stats";
import { drawMask } from '../utilities';

class Mask extends React.Component {

    state = {
        modelUrl: 'https://masktfjs.s3.us-east.cloud-object-storage.appdomain.cloud/model.json',
        net: null,
        webcamRef: React.createRef(null),
        canvasRef: React.createRef(null)
    }

    detect = async() => {
        const { webcamRef, canvasRef, net } = this.state;
        // console.log("In detect function");
        // Check data is available
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video.readyState === 4 && 
            net!=null
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

            const img = tf.browser.fromPixels(video);
            const resizedImg = tf.image.resizeBilinear(img,[640,480]);
            const castedImg = resizedImg.cast('int32');
            const expandedImg = castedImg.expandDims(0);
            const obj = await net.executeAsync(expandedImg);
            // const obj = await net.executeAsync(expanded)
            // // console.log(await obj[4].array());
            const boxes = await obj[6].array()
            const classes = await obj[3].array()
            const scores = await obj[4].array()

            // Draw mesh
            const ctx = canvasRef.current.getContext("2d");

            // 5. TODO - Update drawing utility
            // drawSomething(obj, ctx)  
            drawMask(boxes[0], classes[0], scores[0], 0.8, videoWidth, videoHeight, ctx);

            tf.dispose(img)
            tf.dispose(resizedImg)
            tf.dispose(castedImg)
            tf.dispose(expandedImg)
            tf.dispose(obj)

        }
    }

    componentDidMount() {
        tf.loadGraphModel('https://masktfjs.s3.us-east.cloud-object-storage.appdomain.cloud/model.json')
            .then(net => {
                this.setState({ net }, () => console.log("Mask Model Loaded"));
            })
        // const net = await tf.loadGraphModel(this.state.modelUrl);

        setInterval(() => {
            this.detect()
        }, 200)
    }

    render() {
        if (!this.state.net) {
            return <h1>Loading....</h1>
        }

        return (
            <>
                <br />
                <h1>Mask Component</h1>
                <Webcam
                    ref={this.state.webcamRef}
                    muted={true}
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

                <canvas
                    ref={this.state.canvasRef}
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
                <FPSStats />
            </>
        )
    }
}

export default Mask;