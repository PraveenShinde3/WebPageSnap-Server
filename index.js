const puppeteer = require("puppeteer");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 5000;

app.use("/static", express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
  });
});

app.post("/screenshot", async (req, res) => {
  // Create a browser instance
  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });

  // Create a new page
  const page = await browser.newPage();

  // Set viewport width and height
  await page.setViewport({ width: 1920, height: 1080 });

  const website_url = req.body.url;

  console.log(req.body.url);

  // Open URL in current page
  await page.goto(website_url, { waitUntil: "networkidle0" });

  // Capture screenshot
  await page.screenshot({
    path: "./public/screenshot/" + (await page.title()) + ".jpg",
  });

  // Close the browser instance
  await browser.close();

  res.json({
    success: true,
  });
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});
