#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = process.cwd();

function createDir(dir) {
  const full = path.join(root, dir);
  if (!fs.existsSync(full)) {
    fs.mkdirSync(full, { recursive: true });
    console.log("📁", dir);
  }
}

function createFile(file, content = "") {
  const full = path.join(root, file);

  if (!fs.existsSync(full)) {
    fs.writeFileSync(full, content);
    console.log("📄", file);
  }
}

console.log("\n🚀 INFINIA BHARAT NEWS");
console.log("Enterprise Setup v1\n");

const folders = [

  "src/assets",

  "src/components",
  "src/components/article",
  "src/components/category",
  "src/components/common",
  "src/components/home",
  "src/components/layout",
  "src/components/ui",

  "src/config",

  "src/constants",

  "src/features",
  "src/features/admin",
  "src/features/articles",
  "src/features/auth",
  "src/features/comments",
  "src/features/notifications",
  "src/features/search",
  "src/features/videos",

  "src/lib",
  "src/lib/firebase",
  "src/lib/hooks",
  "src/lib/utils",

  "src/repositories",

  "src/services",

  "src/store",

  "src/styles",

  "src/types",

  "src/utils",

  "public/images",
  "public/icons",
  "public/logos"
];

folders.forEach(createDir);

const files = {

".env.local.example": `NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
`,

"README_PROJECT.md": `# INFINIA BHARAT NEWS

News Without Limits.

Enterprise Architecture
`,

"src/lib/firebase/firebase.ts":
`export {};
`,

"src/lib/firebase/auth.ts":
`export {};
`,

"src/lib/firebase/firestore.ts":
`export {};
`,

"src/lib/firebase/messaging.ts":
`export {};
`,

"src/config/site.ts":
`export const SITE_NAME="INFINIA BHARAT NEWS";
`,

"src/constants/routes.ts":
`export {};
`,

"src/constants/categories.ts":
`export {};
`,

"src/store/index.ts":
`export {};
`,

"src/types/article.ts":
`export interface Article {}
`,

"src/types/user.ts":
`export interface User {}
`,

"src/utils/index.ts":
`export {};
`
};

for (const file in files) {
  createFile(file, files[file]);
}

console.log("\n====================================");
console.log("✅ Enterprise Setup Complete");
console.log("====================================");

console.log(`
Next Steps

1. npm run dev

2. Firebase Integration

3. SEO Engine

4. CMS Development

5. Homepage UI
`);