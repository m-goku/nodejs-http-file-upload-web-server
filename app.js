/*
A File upload web server.
1. build basic web server using http to sever html and css files.
2. Receive file from user and upload to server storage folder using streams and file system.
*/

import http from "node:http";
import fs from "node:fs/promises";
import path from "path";

const PORT = 3030;

//create server
const server = http.createServer();

//listen for incoming requests from client
server.on("request", async (req, res) => {
  //check for the get method and url and serve the equivalent files
  if (req.method === "GET" && req.url === "/") {
    //read contents of th html file and save into the fileHandler
    const fileHandler = await fs.open("./public/index.html", "r");
    //create a readable stream on top of the file handler, to stream the contents
    const readStream = fileHandler.createReadStream();
    //pipe the content to the response (send to client)
    readStream.pipe(res);
    //fileHandler.close();
  }

  if (req.method === "GET" && req.url === "/styles.css") {
    //read contents of th html file and save into the fileHandler
    const fileHandler = await fs.open("./public/styles.css", "r");
    //create a readable stream on top of the file handler, to stream the contents
    const readStream = fileHandler.createReadStream();
    //pipe the content to the response (send to client)
    readStream.pipe(res);
  }

  if (req.method === "GET" && req.url === "/uploads") {
    //const files = await fs.readdir("./storage");
    //read contents of th html file and save into the fileHandler
    const fileHandler = await fs.open("./public/uploads.html", "r");
    //create a readable stream on top of the file handler, to stream the contents
    const readStream = fileHandler.createReadStream();
    //pipe the content to the response (send to client)
    readStream.pipe(res);
    //fileHandler.close();
  }

  if (req.method === "GET" && req.url === "/files") {
    const files = await fs.readdir("./storage");
    res.end(JSON.stringify(files));
  }

  if (req.method === "POST" && req.url === "/upload") {
    // Get the content-type header to extract the boundary
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      res.writeHead(400, { "Content-Type": "text/plain" });
      res.end("Content-Type must be multipart/form-data");
      return;
    }

    const boundary = "--" + contentType.split("boundary=")[1];
    let rawData = Buffer.from(""); // Store the raw request body

    req.on("data", (chunk) => {
      rawData = Buffer.concat([rawData, chunk]);
    });

    req.on("end", async () => {
      // Convert the raw buffer to a string for parsing
      const bodyString = rawData.toString("binary");
      const parts = bodyString.split(boundary);

      let fileName = "";
      let fileData = null;

      // Parse each part of the multipart form data
      for (let part of parts) {
        if (part.includes('Content-Disposition: form-data; name="file"')) {
          // Extract the filename from the headers
          const fileNameMatch = part.match(/filename="(.+?)"/);
          if (fileNameMatch) {
            fileName = fileNameMatch[1];
          }

          // Extract the file content (binary data)
          const contentStart = part.indexOf("\r\n\r\n") + 4;
          const contentEnd = part.lastIndexOf("\r\n");
          if (contentStart < contentEnd) {
            const fileContent = part.slice(contentStart, contentEnd);
            // Convert the file content back to a buffer (binary)
            fileData = Buffer.from(fileContent, "binary");
          }
        }
      }

      // If a file was found, save it
      if (fileName && fileData) {
        const writeFileHandler = await fs.open(`./storage/${fileName}`, "w");
        const writeStream = writeFileHandler.createWriteStream();

        writeStream.write(fileData, (err) => {
          if (err) {
            console.error("Error saving file:", err);
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end("Error saving file");
            return;
          }
          // Log file details
          console.log("File uploaded:");
          console.log("Name:", fileName);
          console.log("Size:", fileData.length, "bytes");

          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end("File uploaded successfully");

          writeFileHandler.close();
        });
      } else {
        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("No file uploaded");
      }
    });

    //req.pipe(writeStream);
  }
});

server.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
