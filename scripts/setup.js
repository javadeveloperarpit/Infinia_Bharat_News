const fs = require("fs");
const path = require("path");

const publicDir = path.join(process.cwd(), "public");

function scan(dir, prefix = "") {
  if (!fs.existsSync(dir)) {
    console.log("❌ public folder nahi mila:", dir);
    return;
  }

  const items = fs.readdirSync(dir, {
    withFileTypes: true,
  });

  for (const item of items) {
    const relativePath = path.join(prefix, item.name);

    if (item.isDirectory()) {
      console.log(`📁 ${relativePath}/`);
      scan(
        path.join(dir, item.name),
        relativePath
      );
    } else {
      const filePath = path.join(dir, item.name);
      const stats = fs.statSync(filePath);

      console.log(
        `📄 ${relativePath} (${stats.size} bytes)`
      );
    }
  }
}

console.log("\n=================================");
console.log("PUBLIC FOLDER STRUCTURE");
console.log("=================================\n");

scan(publicDir);

console.log("\n=================================");
console.log("DONE");
console.log("=================================\n");