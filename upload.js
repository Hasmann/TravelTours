const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <h2>With <code>"express"</code> npm package</h2>
    <form action="/api/upload" enctype="multipart/form-data" method="post">
      <div>Text field title: <input type="text" name="title" /></div>
      <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
      <input type="submit" value="Upload" />
    </form>
  `);
});
app.post('/api/upload', (req, res, next) => {
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    console.log(files);
    console.log('//////////////////////////////////////////');
    console.log(files.someExpressFiles.filepath);
    const oldPath = files.someExpressFiles.filepath;
    const newpath = `${__dirname}/images/test.jpg`;
    fs.rename(oldPath, newpath, (err) => {
      if (err) {
        console.log('NOT UPLOADED');
      } else console.log('UPLOADED SUCESSFULLY');
    });
    res.json({ fields, files });
  });
});

app.listen(3000, () => {
  console.log('Server listening on http://localhost:3000 ...');
});
