const puppeteer = require("puppeteer");
const fs = require("fs");
const request = require("request");

(async () => {

  // Take argument from CLI
  let argument = process.argv[2];
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(argument.toString());

  let doc = await page.evaluate(async () => {

    // Take only tags with img attribute
    let images = document.getElementsByTagName("img");

    let imagesArr = [...images];

    let imgSrc = [];

    imagesArr.forEach((element) => {
      element.src.includes(".jpg") &&
        !element.src.includes("0_0") &&
        imgSrc.push(element.src);
    });

    return imgSrc;
  });

  var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
      request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
    });
  };

  let timestamp = Date.now();
  timestamp = timestamp.toString();

  //   Make a directory with timestamp's file name
  fs.mkdir(timestamp, { recursive: true }, (err) => {
    if (err) throw err;
  });

  //   Download and move files to the created directory
  doc.forEach((item, i) => {
    download(item, `${i}.jpg`, function () {
      fs.rename(`./${i}.jpg`, `./${timestamp}/${i}.jpg`, function (err) {
        if (err) throw err;
        console.log("Successfully downloaded...");
      });
    });
  });

  await browser.close();
})();
