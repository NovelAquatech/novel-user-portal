import express from "express";
import path from "path";
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const port = process.env.PORT || 8080;
const app = express();

console.log(__dirname);
app.use('/css', express.static('dist/css'));
app.use('/images', express.static('dist/images'));
app.use('/assets', express.static('dist/assets'));
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port);


