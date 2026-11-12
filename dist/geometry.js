/* Piecewise-linear zero-set approximation using a consistent tetrahedral grid. */
function implicitMesh(fn,min,max,resolution=22){
 const n=resolution,size=n+1,step=(max-min)/n,values=new Float64Array(size**3),index=(i,j,k)=>(i*size+j)*size+k;
 for(let i=0;i<=n;i++)for(let j=0;j<=n;j++)for(let k=0;k<=n;k++)values[index(i,j,k)]=fn(min+i*step,min+j*step,min+k*step);
 const corners=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],tets=[[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6],[0,5,1,6]],triangles=[];
 function emit(a,b,c){if(!a||!b||!c)return;let ab=b.map((v,i)=>v-a[i]),ac=c.map((v,i)=>v-a[i]),normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]],len=Math.hypot(...normal);if(len>step*step*1e-9)triangles.push({points:[a,b,c],light:.08+.24*Math.abs((normal[0]*.35+normal[1]*.45+normal[2]*.82)/len)})}
 for(let i=0;i<n;i++)for(let j=0;j<n;j++)for(let k=0;k<n;k++){
  const ps=corners.map(([x,y,z])=>[min+(i+x)*step,min+(j+y)*step,min+(k+z)*step]),vs=corners.map(([x,y,z])=>values[index(i+x,j+y,k+z)]);
  if(vs.some(v=>!Number.isFinite(v)))continue;
  if(vs.every(v=>v>=0)||vs.every(v=>v<0))continue;
  const edge=(a,b)=>{let t=vs[a]/(vs[a]-vs[b]),p=ps[a].map((v,k)=>v+t*(ps[b][k]-v)),residual=fn(...p);return Number.isFinite(residual)&&Math.abs(residual)<=Math.max(Math.abs(vs[a]),Math.abs(vs[b]))*.6+1e-8?p:null};
  for(const tet of tets){const inside=tet.filter(v=>vs[v]<0),outside=tet.filter(v=>vs[v]>=0);if(inside.length===0||outside.length===0)continue;if(inside.length===1||outside.length===1){let single=inside.length===1?inside[0]:outside[0],rest=inside.length===1?outside:inside;emit(...rest.map(v=>edge(single,v)))}else{let [a,b]=inside,[c,d]=outside,ac=edge(a,c),ad=edge(a,d),bc=edge(b,c),bd=edge(b,d);emit(ac,ad,bc);emit(ad,bd,bc)}}
 }
 return triangles;
}
function implicitSource(input){const parts=String(input).split('=');if(parts.length>2)throw Error('Use one equation, such as x²+y²=4.');if(parts.length===2){if(!parts[0].trim()||!parts[1].trim())throw Error('Enter both sides of the equation.');return '('+parts[0]+')-('+parts[1]+')'}return input}
function vectorComponents(input){let s=String(input).trim().replace(/^\s*(?:r|F)\s*\([^)]*\)\s*=\s*/,'').replace(/\\(?:left|right)/g,'').replace(/\\langle/g,'⟨').replace(/\\rangle/g,'⟩');const pairs={'⟨':'⟩','[':']','(':')'};if(pairs[s[0]]&&s.at(-1)===pairs[s[0]])s=s.slice(1,-1);let parts=[],start=0,depth=0;for(let i=0;i<s.length;i++){if('({['.includes(s[i]))depth++;else if(')}]'.includes(s[i]))depth--;if(depth<0)throw Error('Check the vector brackets.');if(s[i]===','&&depth===0){parts.push(s.slice(start,i).trim());start=i+1}}parts.push(s.slice(start).trim());if(depth!==0||parts.length!==3||parts.some(s=>!s))throw Error('Enter three components: ⟨x, y, z⟩.');return parts}

/* Bounded adaptive curve sampling. Gaps are retained instead of joined. */
function sampleCurve(at,start,end,scale=10){
 const segments=[],finite=p=>Array.isArray(p)&&p.length===3&&p.every(v=>Number.isFinite(v)&&Math.abs(v)<1e7);let gaps=false;
 const dist=(p,q)=>Math.hypot(...p.map((v,i)=>v-q[i])),tolerance=Math.max(scale,1e-6)/1500;
 function walk(t0,p0,t1,p1,depth){let tm=(t0+t1)/2,pm=at(tm);if(!finite(p0)||!finite(p1)||!finite(pm)){if(depth<8){walk(t0,p0,tm,pm,depth+1);walk(tm,pm,t1,p1,depth+1)}else gaps=true;return}let chord=dist(p0,p1),deviation=dist(pm,p0.map((v,i)=>(v+p1[i])/2));if((deviation>tolerance||chord>scale/12)&&depth<8){walk(t0,p0,tm,pm,depth+1);walk(tm,pm,t1,p1,depth+1);return}if(chord>scale*2||deviation>Math.max(scale/2,tolerance*100)){gaps=true;return}segments.push({p:p0,q:p1,t0,t1})}
 let prev=at(start);for(let i=1;i<=128;i++){let t0=start+(end-start)*(i-1)/128,t1=start+(end-start)*i/128,next=at(t1);walk(t0,prev,t1,next,0);prev=next}
 return{segments,gaps,length:gaps?null:segments.reduce((sum,s)=>sum+dist(s.p,s.q),0)};
}
function curveDerivative(at,t){const h=1e-5*Math.max(1,Math.abs(t)),before=at(t-h),after=at(t+h);return after.map((v,i)=>(v-before[i])/(2*h))}
