const puppeteer = require("puppeteer");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
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

app.post("/screenshot", (req, res) => {
  console.log(req.body.url);
  takeScreenshot(req.body.url)
    .then((screenshot) => uploadScreenshot(screenshot))
    .then((result) => {
      console.log(result);
      res.json({ result: result });
    });
});

async function takeScreenshot(url) {
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

  const website_url = url;

  console.log(url);

  // Open URL in current page
  await page.goto(website_url, { waitUntil: "networkidle0" });

  // Capture screenshot
  const screenshot = await page.screenshot({
    omitBackground: false,
    encoding: "binary",
  });

  // Close the browser instance
  await browser.close();

  return screenshot;
}

app.listen(port, () => {
  console.log("Listening on port " + port);
});

function uploadScreenshot(screenshot) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {};
    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(screenshot);
  });
}
