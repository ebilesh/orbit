const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={};vm.createContext(context);
vm.runInContext(fs.readFileSync('dist/parser.js','utf8'),context);
function preview(source){context.source=source;return vm.runInContext('expressionPreview(source,["u","v"])',context)}
const cosine=preview('cos(v)');
assert.match(cosine,/<mi mathvariant="normal">cos<\/mi><mo lspace="0" rspace="0">⁡<\/mo><mspace width="0\.06em"\/><mrow><mo fence="true">\(<\/mo><mi>v<\/mi><mo fence="true">\)<\/mo><\/mrow>/);
for(const source of ['(2+cos(v))*cos(u)','(2+cos(v))*sin(u)','a*sin(v)']){
  const markup=preview(source);
  assert.match(markup,/<mo lspace="0" rspace="0">⁢<\/mo><mspace width="0\.16em"\/>/);
  assert(!markup.includes('undefined'));
}
assert.match(preview('sqrt(u^2+v^2)'),/<msqrt>/);
assert.match(preview('abs(u)'),/<mo>\|<\/mo>/);
assert.match(preview('cos(1/(u+1))'),/<mfrac>/);
console.log('Math preview checks passed: isolated function arguments, application operator, thin product spacing, roots, absolute values, fractions');
