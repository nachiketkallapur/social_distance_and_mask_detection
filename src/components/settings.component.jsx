import React, { useState } from 'react';
import { TextField, Button } from '@material-ui/core'

const handleChange=(event) => {

}

const Settings = () => {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [location, setLocation] = useState("");
    const [toEmail, setToEmail] = useState("");

    return (
        <div style={{ position: "relative", alignItems:"center", justifyContent: "center", margin: "0 auto", textAlign: "center" }}>
            <h1>Set the Settings for the email to be sent</h1>
            <form onSubmit={this.handleSubmit} autoComplete="off">
                <TextField
                    required
                    id="filled-required"
                    label="Suject to be sent"
                    name="subject"
                    value={subject}
                    variant="filled"
                    onChange={handleChange}
                    style={{ width: "350px", margin: "5px 0px" }}
                /><br />
                <TextField
                    required
                    id="filled-required"
                    label="Message to be sent"
                    name="message"
                    value={message}
                    variant="filled"
                    onChange={handleChange}
                    style={{ width: "350px", margin: "5px 0px" }}
                /><br />
                <TextField
                    required
                    id="filled-required"
                    label="Whom to send the email"
                    name="toEmail"
                    value={toEmail}
                    variant="filled"
                    type="email"
                    onChange={handleChange}
                    style={{ width: "350px", margin: "5px 0px" }}
                /><br />
                <TextField
                    required
                    id="filled-required"
                    label="Location"
                    name="location"
                    value={location}
                    variant="filled"
                    onChange={handleChange}
                    style={{ width: "350px", margin: "5px 0px" }}
                /><br />
            </form>
        </div>
    )
}

export default Settings;