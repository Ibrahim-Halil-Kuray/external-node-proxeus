const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 8080;

app.use(express.json());

app.get('/health', (req, res) => {
    res.send("I'm ok");
});

const PROXEUS_URL = 'http://localhost:1323';
const RETRY_INTERVAL = 5;
// not found. Please try again or if the error persists contact the platform operator

async function registerToProxeus() {
    const nodeInfo = {
        ID: 'UpperCaseService',
        Name: 'UpperCaseService',
        Detail: 'Converts string to uppercase',
        Url: `http://localhost:${PORT}`,
        Secret: '21ibrahim'
    };

    while (true) {
        try {
            const response = await axios.post(`${PROXEUS_URL}/api/admin/external/register`, nodeInfo);
            if (response.status === 200) {
                console.log("[nodeservice] registered");
                break;
            }
        } catch (error) {
            console.error("[nodeservice] error registering", error);
            await new Promise(res => setTimeout(res, RETRY_INTERVAL * 1000));
        }
    }
}

app.post('/convert', (req, res) => {
    const input = req.body.input;
    console.log("Received request: ", req.body);
    if (input) {
        res.json({ input: input.toUpperCase() });
    } else {
        res.status(400).send("text is missing");
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    registerToProxeus();
});
