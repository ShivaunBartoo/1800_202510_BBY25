const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

// This converts all image files in a folder to a JSON file of Base64 strings.
// I used this to covert a dataset of ai-generated faces from https://thispersondoesnotexist.com/
// to strings that I can randomly assign to the test users.
// Requires Node.js. Will not run in the browser. Terminal command: node dev/parseImages.js

const folderPath = "./dev/faces"; //large folder, so .gitignored. Lmk if you need the source files for some reason.
const outputPath = "./dev/imagesBase64.json";

parseImages(folderPath, outputPath);

function parseImages(folderPath, outputPath) {
    const files = fs.readdirSync(folderPath);
    const base64Data = {};
    let index = 1;

    //write files in numeric order
    files.sort((a, b) => {
        let num = (name) => parseInt(name.split(".").at(0));
        return num(a) - num(b);
    });

    //read image files to a JSON object of base64 images.
    for (const file of files) {
        console.log("file name: " + file);
        const filePath = path.join(folderPath, file);
        const fileStats = fs.statSync(filePath);

        //copilot helped me select only image files with this line.
        if (fileStats.isFile() && /\.(png|jpe?g|gif|bmp|webp)$/i.test(file)) {
            const data = fs.readFileSync(filePath);
            //copilot helped me format the string correctly
            const base64String = `data:image/${path.extname(file).slice(1)};base64,${data.toString("base64")}`;
            base64Data[`image${index++}`] = base64String; //
        }
    }

    // Write the JSON object to a file
    fs.writeFileSync(outputPath, JSON.stringify(base64Data, null, 2));
    console.log(`Base64 data written to ${outputPath}`);
}
