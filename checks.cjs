const fs=require('fs'),vm=require('vm'),assert=require('assert');const noop=()=>{};let paintedBackground;const themeColors={'--plot-bg':'#212529'};const listeners={};const ctx=new Proxy({},{get:(target,key)=>key==='fillRect'?()=>{paintedBackground=target.fillStyle}:target[key]??noop,set:(target,key,value)=>(target[key]=value,true)});function el(){return{value:'',style:{},dataset:{},classList:{add:noop,remove:noop},append:noop,replaceWith:noop,setAttribute:noop,querySelector:()=>el(),querySelectorAll:()=>[],addEventListener:noop,getContext:()=>ctx,getBoundingClientRect:()=>({width:1000,height:600}),setPointerCapture:noop}}const cache={};const sandbox={window:{addEventListener:(name,fn)=>listeners[name]=fn},getComputedStyle:()=>({getPropertyValue:name=>themeColors[name]||'#aeb8c1'}),console,Math,Number,JSON,localStorage:{getItem:()=>null,setItem:noop},document:{querySelector:s=>cache[s]??=(el()),querySelectorAll:()=>[],createElement:()=>el(),addEventListener:noop},ResizeObserver:class{observe(){}},devicePixelRatio:1,requestAnimationFrame:noop};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/scene-format.js','utf8')+fs.readFileSync('dist/parser.js','utf8')+fs.readFileSync('dist/geometry.js','utf8')+fs.readFileSync('dist/app.js','utf8'),sandbox);const tests=[['2cos(t)',['t'],[0],2],['2pi',[],[],2*Math.PI],['xy',['x','y'],[3,4],12],['2(x+1)(y-1)',['x','y'],[2,4],18],['-t^2',['t'],[3],-9],['2^3^2',[],[],512],['\\frac{1}{2}x',['x'],[6],3],['\\sqrt{x^{2}+y^{2}}',['x','y'],[3,4],5],['2\\sin(t)',['t'],[Math.PI/2],2],['\\sin^{2}(t)',['t'],[Math.PI/2],1],['\\frac{\\frac{1}{2}}{\\sqrt{4}}',[],[],.25],['2e-3x',['x'],[10],.02],['2π',[],[],2*Math.PI],['x²+y³',['x','y'],[2,3],31],['sin(x)cos(y)',['x','y'],[Math.PI/2,0],1],['x+y+z',['x','y','z'],[1,2,3],6]];for(let [src,vars,args,want]of tests){sandbox.test={src,vars,args};let actual=vm.runInContext('compile(test.src,test.vars)(...test.args)',sandbox);assert(Math.abs(actual-want)<1e-9,`${src}: ${actual} != ${want}`)}for(let bad of ['alert(1)','sin(x','\\unknown{x}','x;1','<script>','\\frac{1}']){sandbox.bad=bad;assert.throws(()=>vm.runInContext('compile(bad)',sandbox))}vm.runInContext(`W=1000;H=600;for(const [name,desc,obj] of examples){objects=[clone(obj)];refresh();if(objects[0].error)throw Error(name+objects[0].error);fitScene()}objects=[clone(defaults.field)];refresh();if(!$('#status').textContent.includes('216 vectors'))throw Error('Vector sampling failed');const d=deriv((x,y)=>x*x+3*y,2,1);if(Math.abs(d[1]-4)>1e-6||Math.abs(d[2]-3)>1e-6)throw Error('Derivative failure');console.log('All 9 examples, field sampling, and derivatives passed');`,sandbox);console.log(tests.length+' math cases and 6 invalid-input checks passed');


listeners["orbit-theme-change"]();assert.equal(paintedBackground,"#212529");themeColors["--plot-bg"]="#f8f9fa";listeners["orbit-theme-change"]();assert.equal(paintedBackground,"#f8f9fa");console.log("Canvas redraw follows dark and light theme tokens");

// Exercise the real canvas handlers, including switching between drag and pinch.
vm.runInContext('W=0;zoom=1;yaw=0;pitch=0',sandbox);
const plot=cache['#plot'];
const pointer=(pointerId,clientX,clientY,extra={})=>({pointerId,clientX,clientY,pointerType:'touch',button:0,...extra});
const camera=()=>vm.runInContext('({zoom,yaw,pitch,pointers:graphPointers.size})',sandbox);
plot.onpointerdown(pointer(1,100,100));
plot.onpointermove(pointer(1,110,105));
assert(Math.abs(camera().yaw-.08)<1e-10);
assert(Math.abs(camera().pitch-.04)<1e-10);
plot.onpointerdown(pointer(2,210,105));
plot.onpointermove(pointer(2,310,105));
assert.equal(camera().zoom,2);
assert(Math.abs(camera().yaw-.08)<1e-10,'pinch must not rotate the graph');
plot.onpointermove(pointer(2,160,105));
assert.equal(camera().zoom,.5);
plot.onpointerup(pointer(2,160,105));
plot.onpointermove(pointer(1,115,105));
assert(Math.abs(camera().yaw-.12)<1e-10,'lifting a finger must not jump the camera');
assert.equal(camera().zoom,.5);
plot.onpointercancel(pointer(1,115,105));
plot.onpointermove(pointer(1,200,200));
assert(Math.abs(camera().yaw-.12)<1e-10);
assert.equal(camera().pointers,0);
plot.onpointerdown(pointer(3,0,0));
plot.onpointerdown(pointer(4,0,0));
plot.onpointermove(pointer(4,100,0));
assert(Number.isFinite(camera().zoom),'coincident fingers must not divide by zero');
plot.onpointermove(pointer(4,10000,0));assert.equal(camera().zoom,3);
plot.onpointermove(pointer(4,.001,0));assert.equal(camera().zoom,.3);
plot.onlostpointercapture(pointer(3,0,0));
plot.onlostpointercapture(pointer(4,.001,0));
plot.onpointerdown(pointer(5,0,0,{pointerType:'mouse',button:2}));
assert.equal(camera().pointers,0,'right mouse button must not rotate');
plot.onpointerdown(pointer(6,0,0,{pointerType:'mouse'}));
plot.onpointermove(pointer(6,10,0,{pointerType:'mouse'}));
plot.onpointerup(pointer(6,10,0,{pointerType:'mouse'}));
assert(Math.abs(camera().yaw-.2)<1e-10,'mouse rotation still works');
let wheelPrevented=false;
plot.onwheel({deltaY:-100,preventDefault(){wheelPrevented=true}});
assert(wheelPrevented);assert(camera().zoom>.3);
console.log('Gesture checks passed: drag, pinch in/out, no rotation during pinch, finger lift, cancel, lost capture, coincident fingers, zoom limits, mouse and wheel');
