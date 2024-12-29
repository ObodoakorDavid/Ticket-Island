import fs from "fs-extra";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import ImageModule from "docxtemplater-image-module-free";
import path from "path";
import https from "https";
import http from "http";
import { Transform as Stream } from "stream";
import sizeOf from "image-size";
import { fileURLToPath } from "url";

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const base64Regex = /^(?:data:)?image\/(png|jpg|jpeg|svg|svg\+xml);base64,/;
const validBase64 =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

function base64Parser(dataURL) {
  if (typeof dataURL !== "string" || !base64Regex.test(dataURL)) {
    return false;
  }

  const stringBase64 = dataURL.replace(base64Regex, "");

  if (!validBase64.test(stringBase64)) {
    throw new Error(
      "Error parsing base64 data, your data contains invalid characters"
    );
  }

  // For nodejs, return a Buffer
  if (typeof Buffer !== "undefined" && Buffer.from) {
    return Buffer.from(stringBase64, "base64");
  }

  // For browsers, return a string (of binary content) :
  const binaryString = window.atob(stringBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    const ascii = binaryString.charCodeAt(i);
    bytes[i] = ascii;
  }
  return bytes.buffer;
}

// Returns a Promise<Buffer> of the image
function getHttpData(url, callback) {
  (url.substr(0, 5) === "https" ? https : http)
    .request(url, function (response) {
      if (response.statusCode !== 200) {
        return callback(
          new Error(
            `Request to ${url} failed, status code: ${response.statusCode}`
          )
        );
      }

      const data = new Stream();
      response.on("data", function (chunk) {
        data.push(chunk);
      });
      response.on("end", function () {
        callback(null, data.read());
      });
      response.on("error", function (e) {
        callback(e);
      });
    })
    .end();
}

const imageOptions = {
  getImage(tagValue, tagName) {
    const base64Value = base64Parser(tagValue);
    if (base64Value) {
      return base64Value;
    }
    // tagValue is "https://docxtemplater.com/xt-pro-white.png"
    // tagName is "image"
    return new Promise(function (resolve, reject) {
      getHttpData(tagValue, function (err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  },

  getSize(img, tagValue, tagName) {
    // img is the value that was returned by getImage
    const sizeObj = sizeOf(img);
    const maxWidth = 160;
    if (sizeObj.width > maxWidth) {
      const height = Math.round((maxWidth / sizeObj.width) * sizeObj.height);
      return [maxWidth, height];
    }
    return [sizeObj.width, sizeObj.height];
  },
};

const generateCV = async (informations) => {
  const templatePath = path.join(__dirname, "..", "..", "template.docx");
  const outputFilePath = path.join(__dirname, "..", "..", "output.docx");

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found at path: ${templatePath}`);
  }

  // Load the docx file as binary content
  const content = fs.readFileSync(templatePath, "binary");

  // Create a zip instance for the docx file
  const zip = new PizZip(content);

  // Create a docxtemplater instance
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    modules: [new ImageModule(imageOptions)],
  });

  await doc.renderAsync(informations);

  // Generate the output
  const buf = doc.getZip().generate({
    type: "nodebuffer",
    compression: "DEFLATE",
  });

  // Save the output file
  fs.writeFileSync(outputFilePath, buf);

  return outputFilePath;
};

export default generateCV;
