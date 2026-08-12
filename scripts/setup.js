const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(ROOT, "seo-audit-2.txt");

const files = [
  // SEO infrastructure
  "src/app/sitemap.ts",
  "src/app/robots.ts",
  "src/app/news-sitemap.xml/route.ts",
  "src/app/news-sitemap/route.ts",

  // Website pages
  "src/app/(website)/page.tsx",
  "src/app/(website)/latest/page.tsx",
  "src/app/(website)/search/page.tsx",

  // Video / reels
  "src/app/(website)/video/page.tsx",
  "src/app/reels/page.tsx",
  "src/app/reel/[id]/page.tsx",

  // Possible live TV
  "src/app/live-tv/page.tsx",
  "src/app/(website)/live-tv/page.tsx",

  // Public services
  "src/services/public/article.public.service.ts",
  "src/services/public/category.public.service.ts",
  "src/services/public/author.public.service.ts",
  "src/services/public/video.public.service.ts",

  // Config
  "next.config.ts",
  "next.config.js",
  "next.config.mjs",
  "package.json",
];

let output = "";

function add(text = "") {
  output += text + "\n";
}

add("============================================================");
add("           INFINIA BHARAT NEWS SEO AUDIT - PART 2");
add("============================================================");
add("");
add(`PROJECT ROOT: ${ROOT}`);
add("");
add("This report contains the COMPLETE CODE of selected SEO files.");
add("");

for (const relativePath of files) {
  const fullPath = path.join(ROOT, relativePath);

  add("");
  add("============================================================");
  add(`FILE: ${relativePath}`);
  add("============================================================");
  add("");

  if (!fs.existsSync(fullPath)) {
    add("FILE NOT FOUND");
    continue;
  }

  try {
    const content = fs.readFileSync(fullPath, "utf8");

    if (!content.trim()) {
      add("FILE EXISTS BUT IS EMPTY");
    } else {
      add(content);
    }
  } catch (error) {
    add(`ERROR READING FILE: ${error.message}`);
  }
}

add("");
add("============================================================");
add("                    AUDIT COMPLETE");
add("============================================================");

fs.writeFileSync(OUTPUT, output, "utf8");

console.log("");
console.log("SEO audit PART 2 generated successfully.");
console.log("");
console.log(`Output file: ${OUTPUT}`);
console.log("");
console.log("Upload seo-audit-2.txt here.");