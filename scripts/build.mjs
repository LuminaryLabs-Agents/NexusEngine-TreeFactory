import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of ["index.html", "styles.css", ".nojekyll"]) {
  fs.copyFileSync(path.join(root, entry), path.join(dist, entry));
}

fs.cpSync(path.join(root, "src"), path.join(dist, "src"), {
  recursive: true
});

console.log("TreeFactory static build created", {
  dist,
  files: countFiles(dist)
});

function countFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .reduce((total, entry) => total + (
      entry.isDirectory()
        ? countFiles(path.join(directory, entry.name))
        : 1
    ), 0);
}
