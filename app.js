import express from "express";
import bodyParser from "body-parser";
const app = express();
app.use(bodyParser.json());
app.get("/health", (req, res) => {
  res.status(200).json({
      status: "ok",
    });
});
app.post('/sort-ticket', sortTicketHandler);
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});