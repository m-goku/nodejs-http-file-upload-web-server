/*
A File upload web server.
1. build basic web server using http to sever html and css files.
2. Receive file from user and upload to server storage folder using streams and file system.
*/

import http from "node:http";
import fs from "node:fs/promises";

const PORT = 3030;

//create server
const server = http.createServer();

//listen for incoming requests from client
server.on("request", async (req, res) => {
  if (req.method === "GET" && req.url === "/") {
    const fileHandler = await fs.open("./public/index.html", "r");
    const readStream = fileHandler.createReadStream();
    readStream.pipe(res);
  }

  if (req.method === "GET" && req.url === "/styles.css") {
    const fileHandler = await fs.open("./public/styles.css", "r");
    const readStream = fileHandler.createReadStream();
    readStream.pipe(res);
  }

  if (req.method === "GET" && req.url === "/file.png") {
    const fileHandler = await fs.open("./public/file.png", "r");
    const readStream = fileHandler.createReadStream();
    readStream.pipe(res);
  }

  if (req.method === "GET" && req.url === "/uploads") {
    const fileHandler = await fs.open("./public/uploads.html", "r");
    const readStream = fileHandler.createReadStream();
    readStream.pipe(res);
  }

  if (req.method === "GET" && req.url === "/files") {
    const files = await fs.readdir("./storage");
    res.end(JSON.stringify(files));
  }

  if (req.method === "POST" && req.url === "/upload") {
    const fileName = req.headers["x-file-name"];
    console.time("benchmark");

    const writeFileHandler = await fs.open(`./storage/${fileName}`, "w");
    const writeStream = writeFileHandler.createWriteStream();

    req.pipe(writeStream);

    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("File uploaded successfully");
      console.timeEnd("benchmark");
      writeFileHandler.close();
    });
  }
});

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
