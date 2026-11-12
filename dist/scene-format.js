/* .abhilash v1: UTF-8 text, "ABHILASH 1" header, then a JSON scene.
   No executable content. Legacy Orbit JSON scenes are accepted on import. */
const SceneFormat=(()=>{
 const header='ABHILASH 1\n';
 const finite=v=>typeof v==='number'&&Number.isFinite(v);
 function validate(s){
  const counts={implicit:0,explicit:0,parametric:4,curve:2,field:0};
  if(!s||typeof s!=='object'||s.version!==1)throw Error('Unsupported scene version. This app opens version 1 files.');
  if(!Array.isArray(s.objects)||s.objects.length>8)throw Error('A scene can contain up to 8 objects.');
  const objects=s.objects.map(o=>{
   if(!o||!Object.hasOwn(counts,o.type)||!Array.isArray(o.expr)||o.expr.length!==(['explicit','implicit'].includes(o.type)?1:3)||!o.expr.every(v=>typeof v==='string'&&v.length<=4000)||!Array.isArray(o.ranges)||o.ranges.length!==counts[o.type]||!o.ranges.every(v=>typeof v==='string'&&v.length<=1000))throw Error('The scene contains an invalid graph object.');
   if(o.point!==undefined&&(!Array.isArray(o.point)||o.point.length!==2||!o.point.every(finite)))throw Error('Invalid inspection point.');
   if(o.probe!==undefined&&!finite(o.probe))throw Error('Invalid curve inspection parameter.');return{type:o.type,expr:[...o.expr],ranges:[...o.ranges],visible:o.visible!==false,...(o.type==='explicit'?{point:o.point||[1,1],tangent:o.tangent===true}:o.type==='curve'?{probe:o.probe??0,tangent:o.tangent===true}:{})};
  });
  if(!finite(s.lo)||!finite(s.hi)||Math.abs(s.lo)>1e7||Math.abs(s.hi)>1e7||s.hi-s.lo<.1||s.hi-s.lo>60)throw Error('Invalid plot domain. Its width must be between 0.1 and 60.');
  if(!finite(s.a)||s.a<0||s.a>3)throw Error('Invalid animation parameter. Use a value from 0 to 3.');
  let view;
  if(s.view!==undefined){let v=s.view;if(!v||!Array.isArray(v.target)||v.target.length!==3||!v.target.every(x=>finite(x)&&Math.abs(x)<=1e7)||![v.span,v.yaw,v.pitch,v.zoom].every(finite)||v.span<=0||v.span>1e9||Math.abs(v.pitch)>Math.PI/2+.001||v.zoom<.3||v.zoom>3)throw Error('Invalid saved camera view.');view={target:[...v.target],span:v.span,yaw:v.yaw,pitch:v.pitch,zoom:v.zoom,mesh:v.mesh!==false,grid:v.grid!==false}}
  return{version:1,objects,a:s.a,lo:s.lo,hi:s.hi,...(view?{view}:{})};
 }
 function encode(scene){return header+JSON.stringify(validate(scene),null,2)+'\n'}
 function decode(text){if(typeof text!=='string'||text.length>100000)throw Error('Scene file is too large (maximum 100 KB).');text=text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n');let payload=text;if(text.startsWith('ABHILASH')){const end=text.indexOf('\n');if(end<0||text.slice(0,end)!=='ABHILASH 1')throw Error('Unsupported .abhilash format version.');payload=text.slice(end+1)}let data;try{data=JSON.parse(payload)}catch{throw Error('Cannot read this file. Open an .abhilash file or an older Orbit JSON scene.')}return validate(data)}
 return{encode,decode};
})();
