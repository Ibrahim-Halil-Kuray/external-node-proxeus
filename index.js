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

async function registerToProxeus() {
  const nodeInfo = {
    ID: "UpperCaseService",
    Name: "UpperCaseService",
    Detail: "Converts string to uppercase",
    Url: `http://localhost:${PORT}`,
    Secret: "mySecret",
  };

  let registered = false;
  let tryAgain = 10;
  while (!registered && tryAgain > 0) {
    try {
      const response = await axios.post(
        `${PROXEUS_URL}/api/admin/external/register`,
        nodeInfo
      );
      if (response.status === 200) {
        console.log("[nodeservice] registered");
        registered = true;
      }
      console.log(response.data);
    } catch (error) {
      console.error("[nodeservice] error registering", error.response.data);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL * 1000));
      tryAgain--;
    }
  }
}

app.post(/\/.*\/next$/, (req, res) => {
  const input = req.body.firstname;
  //const workflowId = req.params.wflowId;
  if (input) {
    console.log("Processed request: ", req.body);
    res.json({ "input.firstname": input.toUpperCase() });
  } else {
    console.error("Invalid request: ", req.body);
    res.status(400).send("text is missing");
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  registerToProxeus();
});
