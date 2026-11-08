import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
const lum=(hex:string)=>{const c=(hex.match(/[a-f0-9]{2}/gi)||[]).map(s=>parseInt(s,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);assert.equal(c.length,3);return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const contrast=(a:string,b:string)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
test("Monograph keeps an accessible neutral ink and warm-paper palette",()=>{
 const css=readFileSync("src/styles/tokens.css","utf8");
 const editorial=readFileSync("src/styles/monograph.css","utf8");
 const global=readFileSync("src/app/globals.css","utf8");
 assert.match(css,/--void: #0c0d0c/);assert.match(css,/--paper: #f5f3ed/);assert.match(css,/--signal: #e2dfd5/);
 assert.ok(global.includes('@import "../styles/monograph.css"'));
 assert.ok(contrast("f5f3ed","0c0d0c")>14);
 assert.ok(contrast("171816","f1f0eb")>14);
 assert.ok(contrast("121310","e2dfd5")>12);
 assert.match(editorial,/\.home \.home-work \{ background: #f1f0eb/);
 assert.match(editorial,/\.home \.home-about \{ background: #deddd5/);
});
test("new identity excludes previous mint and violet accents",()=>{
 assert.doesNotMatch(readFileSync("src/styles/monograph.css","utf8"),/#(?:a4dfd2|9ab0ff|bba4d9|ecd9ba|e9d8bd|c7eaa4)\b/i);
});