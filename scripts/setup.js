const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const IGNORE = [
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  ".vercel",
  "package-lock.json"
];

const ALLOWED = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".json",
  ".css"
];


let output = "";

function add(text = "") {
  output += text + "\n";
}


function scanDirectory(dir) {

  const items = fs.readdirSync(dir);


  for (const item of items) {

    if (IGNORE.includes(item)) continue;


    const fullPath = path.join(dir,item);


    const stat = fs.statSync(fullPath);


    if(stat.isDirectory()) {

      scanDirectory(fullPath);

    } 
    else {

      exportFile(fullPath);

    }

  }

}



function exportFile(filePath) {


const ext = path.extname(filePath);


if(!ALLOWED.includes(ext))
return;


const relative =
path.relative(ROOT,filePath);



let content="";

try {

content =
fs.readFileSync(
filePath,
"utf8"
);

}
catch(e){

return;

}



add("\n\n");
add("================================================");
add("FILE PATH:");
add(relative);
add("================================================");
add("\n");
add(content);

}



add("========================================");
add(" INFINIA COMPLETE SOURCE EXPORT ");
add("========================================");


scanDirectory(ROOT);



const outputFile =
path.join(
ROOT,
"infinia-source-code.txt"
);


fs.writeFileSync(
outputFile,
output,
"utf8"
);


console.log(
"✅ Complete source exported:"
);
console.log(
"infinia-source-code.txt"
);