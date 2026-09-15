import fs from"node:fs";import path from"node:path";
const root="public/media";let bytes=0;
function collect(directory){for(const entry of fs.readdirSync(directory,{withFileTypes:true})){const current=path.join(directory,entry.name);if(entry.isDirectory())collect(current);else if(entry.isFile())bytes+=fs.statSync(current).size}}
collect(root);
console.log(`local media total: ${(bytes/1024).toFixed(1)} KB`);if(bytes>8*1024*1024)throw new Error("Local media exceeds 8 MB review threshold");
