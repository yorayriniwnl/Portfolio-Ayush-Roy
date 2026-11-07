import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function luminance(hex: string) {
  const values = hex.match(/[0-9a-f]{2}/gi);
  assert.ok(values && values.length === 3);
  const [r,g,b] = values.map(value => {
    const c=parseInt(value,16)/255;
    return c<=0.04045 ? c/12.92 : ((c+0.055)/1.055)**2.4;
  });
  return 0.2126*r + 0.7152*g + 0.0722*b;
}
function contrast(a:string,b:string) {
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
test("Obsidian Pearl palette retains accessible contrast and one restrained accent",()=>{
  const css=readFileSync("src/styles/tokens.css","utf8");
  for(const token of ["--void: #09090D","--paper: #F7F4FA","--signal: #BBA4D9","--metal-warm: #E6DFEB"]) {
    assert.ok(css.includes(token),token);
  }
  assert.ok(contrast("BBA4D9","09090D")>=7);
  assert.ok(contrast("F7F4FA","09090D")>=7);
  assert.ok(contrast("22192B","BBA4D9")>=7);
});
test("obsolete mint, neon-blue, champagne and lime do not leak to branded pages",()=>{
  for(const path of ["src/styles/tokens.css","src/styles/home.css","src/styles/signature.css","src/styles/machine.css","src/styles/studio.css","src/components/SiteNav.module.css","src/app/opengraph-image.tsx","public/favicon.svg"]) {
    const data=readFileSync(path,"utf8");
    assert.doesNotMatch(data,/#(?:a4dfd2|ecd9ba|e9d8bd|c7eaa4|ee3e48|d5efe3|9ab0ff|c9d6ff)\b/i,path);
    assert.doesNotMatch(data,/rgba\(\s*(?:199\s*,\s*234\s*,\s*164|154\s*,\s*176\s*,\s*255)\s*,/i,path);
  }
});