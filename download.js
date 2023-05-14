const fs = require('fs');
const { request } = require('http');
const https = require('https');

// URL of the image
const url = 'https://www.thenetnaija.co/static/img/logo.silver.png';
const sli = url.lastIndexOf('/');
const name = url.slice(sli + 1);
console.log(name);

https.get(url, (req, res) => {
  // Image will be stored at this path
  const path = `${__dirname}/images/${name}.jpeg`;
  const filePath = fs.createWriteStream(path);
  req.pipe(filePath);
  filePath.on('finish', () => {
    filePath.close();
    console.log('Download Completed');
  });
});
