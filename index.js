const puppeteer = require("puppeteer");
const fs = require("fs");
const request = require("request");

(async () => {
  // Take argument from CLI
  let argument = process.argv[2];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(argument.toString());

  let doc = await page.evaluate(async () => {
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
    console.log({ uri });
    request.head(uri, function (err, res, body) {
      console.log("content-type:", res.headers["content-type"]);
      console.log("content-length:", res.headers["content-length"]);
      request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
    });
  };

  //   console.log(doc)

  let timestamp = Date.now();

  fs.mkdir(timestamp.toString(), { recursive: true }, (err) => {
    if (err) throw err;
  });

  doc.forEach((item, i) => {
    download(item, `${i}.jpg`, function () {
        // fs.copy(`./${i}.jpg`, './${timestamp}', function (err) {
        //     if (err) {
        //       console.error(err);
        //     } else {
        //       console.log("success!");
        //     }
        //   }); //copies directory, even if it has subdirectories or files
    });
  });


  await browser.close();
})();
