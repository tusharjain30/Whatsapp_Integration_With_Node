const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require('dotenv').config();

const whatsapp = require("./routes/whatsapp/index");

app.use(bodyParser.json());
app.use("/whatsapp", whatsapp);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});