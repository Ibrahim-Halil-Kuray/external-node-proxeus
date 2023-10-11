const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 8080;

app.use(express.json());

app.get("/health", (req, res) => {
  res.send("I'm ok");
});

const PROXEUS_URL = "http://localhost:1323";
const RETRY_INTERVAL = 5;
// not found. Please try again or if the error persists contact the platform operator

async function registerToProxeus() {
  const nodeInfo = {
    ID: "UpperCaseService",
    Name: "UpperCaseService",
    Detail: "Converts string to uppercase",
    Url: `http://localhost:${PORT}`,
    Secret: "",
  };

  let registered = false,
    tryAgain = 10;
  while (!registered && --tryAgain > 0) {
    try {
      const response = await axios.post(
        `${PROXEUS_URL}/api/admin/external/register`,
        nodeInfo
      );
      if (response.status === 200) {
        console.log("[nodeservice] registered");
        registered = true;
      }
      console.log(response.body);
    } catch (error) {
      console.error("[nodeservice] error registering", error);
      await new Promise((res) => setTimeout(res, RETRY_INTERVAL * 1000));
    }
  }
}

app.post(/\/.*\/next$/, (req, res) => {
  const input = req.body.firstname;
  //const workflowId = req.params.wflowId;
  if (input) {
    console.log("Processed request: ", req.body);
    res.json({ "output.firstname": input.toUpperCase() });
  } else {
    console.error("Invalid request: ", req.body);
    res.status(400).send("text is missing");
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  registerToProxeus();
});
