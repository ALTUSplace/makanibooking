import fs from "node:fs";

const path = "client/src/contexts/LanguageContext.tsx";
const lines = fs.readFileSync(path, "utf8").split("\n");
const starts = lines
  .map((line, index) => ({ line, index }))
  .filter(({ line }) => /^  (ar|fr|en): \{$/.test(line));

let removals = 0;
for (let i = starts.length - 1; i >= 0; i -= 1) {
  const start = starts[i].index;
  const end = starts[i + 1]?.index ?? lines.length;
  const notificationLines = [];
  for (let j = start; j < end; j += 1) {
    if (lines[j].includes("allNotificationsRead:")) notificationLines.push(j);
  }
  if (notificationLines.length > 1) {
    const first = notificationLines[0];
    const second = notificationLines[1];
    lines.splice(first + 1, second - first);
    removals += 1;
  }
}

if (removals !== 3) {
  throw new Error(`Expected 3 duplicate language blocks, removed ${removals}`);
}
fs.writeFileSync(path, lines.join("\n"));
console.log(`Removed ${removals} duplicate language blocks.`);
