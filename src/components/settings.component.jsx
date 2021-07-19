import React, { useState, useEffect } from 'react';
import {
    TextField,
    Button,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    FormLabel
} from '@material-ui/core'
import img1 from '../assets/img1.jpg';



const Settings = () => {
    const settings = JSON.parse(localStorage.getItem("settings"));
    const [subject, setSubject] = useState(settings.subject);
    const [message, setMessage] = useState(settings.message);
    const [threshold, setThreshold] = useState(settings.threshold);
    const [location, setLocation] = useState(settings.location);
    const [longitude, setLongitude] = useState(settings.longitude);
    const [latitude, setLatitude] = useState(settings.latitude);
    const [toEmail, setToEmail] = useState(settings.toEmail);
    const [autoEmail, setAutoEmail] = useState(settings.autoEmail);
    const [lastAlertEmailSent, setLastAlertEmailSent] = useState(settings.lastAlertEmailSent);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(({ coords: { latitude, longitude } }) => {
            setLongitude(longitude);
            setLatitude(latitude);
            settings.latitude = latitude;
            settings.longitude = longitude;
            localStorage.setItem("settings", JSON.stringify(settings));
        })
    }, [])

    const handleChange = (event) => {
        const { name, value } = event.target;
        console.log(name, value);
        if (name === "location") setLocation(value);
        else if (name === "message") setMessage(value);
        else if (name === "subject") setSubject(value);
        else if (name === "threshold") setThreshold(value);
        else if (name === "toEmail") setToEmail(value);
        // else if (name === "longitude") setLongitude(value);
        // else if (name === "latitude") setLatitude(value);
        else if (name === "autoEmail") setAutoEmail(value);
        // else if (name==="lastAlertEmailSent") setLastAlertEmailSent(value);
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        localStorage.setItem('settings', JSON.stringify({ subject, message, location, toEmail, latitude, longitude, threshold, autoEmail, lastAlertEmailSent }));
        alert("Settings saved successfully");
    }

    return (
        <div style={{
            position: "absolute",
            width: "100%",
            height: "auto",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            textAlign: "center",
            backgroundImage: `url(${img1})`
        }}>
            <h1>Set the Settings for the ALERT email to be sent</h1>
            <form onSubmit={handleSubmit} autoComplete="off">
                <TextField
                    required
                    id="filled-required"
                    label="Subject to be sent"
                    name="subject"
                    defaultValue={subject}
                    variant="filled"
                    onChange={handleChange}
                    style={{ width: "470px", margin: "5px 0px" }}
                /><br />
                <TextField
                    required
                    id="filled-required"
                    label="Message to be sent"
                    name="message"
                    defaultValue={message}
                    variant="filled"
                    onChange={handleChange}
                    style={{ width: "470px", margin: "5px 0px" }}
                /><br />
                <TextField
                    required
                    id="filled-required"
                    label="Allowed public capacity(threshold)"
                    name="threshold"
                    defaultValue={threshold}
                    variant="filled"
                    type="number"
                    InputProps={{ inputProps: { min: 0 } }}
                    onChange={handleChange}
                    style={{ width: "470px", margin: "5px 0px" }}
                /><br />
                <TextField
                    required
                    id="filled-required"
                    label="Whom to send the email"
                    name="toEmail"
                    defaultValue={toEmail}
                    variant="filled"
                    type="email"
                    onChange={handleChange}
                    style={{ width: "470px", margin: "5px 0px" }}
                /><br />
                <TextField
                    disabled
                    required
                    id="filled-required"
                    label="Last alert Email Sent"
                    name="lastAlertEmailSent"
                    defaultValue={new Date(parseInt(lastAlertEmailSent))}
                    variant="filled"
                    type="email"
                    onChange={handleChange}
                    style={{ width: "470px", margin: "5px 0px" }}
                /><br />
                <FormControl component="fieldset">
                    <FormLabel component="legend">Send Auto Emails</FormLabel>
                    <RadioGroup aria-label="autoEmail" name="autoEmail" value={autoEmail} onChange={handleChange}>
                        <FormControlLabel value="true" control={<Radio />} label="Yes" />
                        <FormControlLabel value="false" control={<Radio />} label="No" />
                    </RadioGroup>
                </FormControl><br />
                <TextField
                    required
                    id="filled-required"
                    label="Location"
                    name="location"
                    defaultValue={location}
                    variant="filled"
                    onChange={handleChange}
                    style={{ width: "470px", margin: "5px 0px" }}
                /><br />
                <TextField
                    disabled
                    required
                    id="filled-required"
                    label="Latitude"
                    name="latitude"
                    defaultValue={latitude}
                    variant="filled"
                    onChange={handleChange}
                    style={{ width: "470px", margin: "5px 0px" }}
                /><br />
                <TextField
                    disabled
                    required
                    id="filled-required"
                    label="Longitude"
                    name="longitude"
                    defaultValue={longitude}
                    variant="filled"
                    onChange={handleChange}
                    style={{ width: "470px", margin: "5px 0px" }}
                /><br />
                <Button variant="contained" color="primary" type="submit">Set</Button>
                <br />
            </form>
        </div>
    )
}

export default Settings;