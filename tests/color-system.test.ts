import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function luminance(hex: string) {
  const values = hex.match(/[0-9a-f]{2}/gi);
  assert.ok(values && values.length === 3);
  const [r, g, b] = values.map((v) => {
    const c = parseInt(v, 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string,b: string) {
  const x=luminance(a), y=luminance(b);
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}
test("graphite and porcelain theme has a strong accessible single accent",()=>{
  const c=readFileSync("src/styles/tokens.css","utf8");
  for(const color of ["--void: #0b0b10","--paper: #f7f8fc","--signal: #9ab0ff","--metal-warm: #c9d6ff"]){
    assert.ok(c.includes(color),color);
  }
  assert.ok(contrast("9ab0ff","0b0b10")>=7);
  assert.ok(contrast("f7f8fc","0b0b10")>=7);
  assert.ok(contrast("101329","9ab0ff")>=7);
});
test("old mint champagne lime and red accents are gone from shared UI",()=>{
  for(const path of ["src/styles/tokens.css","src/styles/home.css","src/styles/signature.css","src/styles/machine.css","src/styles/studio.css","src/components/SiteNav.module.css","src/app/opengraph-image.tsx","public/favicon.svg"]){
    const css=readFileSync(path,"utf8");
    assert.doesNotMatch(css,/#(?:a4dfd2|ecd9ba|e9d8bd|c7eaa4|ee3e48|d5efe3)\b/i,path);
    assert.doesNotMatch(css,/rgba\(\s*199\s*,\s*234\s*,\s*164\s*,/i,path);
  }
});
