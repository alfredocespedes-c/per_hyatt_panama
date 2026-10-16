import * as THREE from 'three';
const Q=new URLSearchParams(location.search), FIX=Q.has('t')?parseFloat(Q.get('t')):null, END=11.2;
const cv=document.getElementById('gl'), R=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
R.setPixelRatio(Math.min(devicePixelRatio,2)); R.outputColorSpace=THREE.SRGBColorSpace; R.toneMapping=THREE.ACESFilmicToneMapping; R.toneMappingExposure=1.1;
const cam=new THREE.PerspectiveCamera(50,1,0.5,4000);
const cl=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)), P=(t,a,b)=>cl((t-a)/(b-a)), ease=p=>p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2, eIn=p=>p*p*p;
let seed=11; const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
function tex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
// Pepsi globe (red top, white wave, blue bottom)
const PB='#004B93',PR='#E4002B',PD='#001E50';
function globe(x,cx,cy,r){x.save();x.beginPath();x.arc(cx,cy,r,0,7);x.clip();x.fillStyle='#fff';x.fillRect(cx-r,cy-r,2*r,2*r);
 x.fillStyle=PR;x.beginPath();x.moveTo(cx-r,cy-r);x.lineTo(cx+r,cy-r);x.lineTo(cx+r,cy-.24*r);x.bezierCurveTo(cx+.4*r,cy-.5*r,cx-.3*r,cy+.05*r,cx-r,cy-.2*r);x.closePath();x.fill();
 x.fillStyle=PB;x.beginPath();x.moveTo(cx-r,cy+r);x.lineTo(cx+r,cy+r);x.lineTo(cx+r,cy+.16*r);x.bezierCurveTo(cx+.3*r,cy-.05*r,cx-.3*r,cy+.5*r,cx-r,cy+.24*r);x.closePath();x.fill();x.restore();
 x.strokeStyle='#fff';x.lineWidth=Math.max(2,r*.05);x.beginPath();x.arc(cx,cy,r,0,7);x.stroke()}
const canT=tex(512,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#003a7a');g.addColorStop(.5,'#0057b8');g.addColorStop(1,'#003a7a');x.fillStyle=g;x.fillRect(0,0,w,h);
 globe(x,w*.28,h*.42,95);x.fillStyle='#fff';x.font='800 92px Segoe UI,Arial';x.textAlign='center';x.textBaseline='middle';x.fillText('pepsi',w*.28,h*.7);
 x.fillStyle='rgba(255,255,255,.85)';x.fillRect(0,18,w,5);x.fillRect(0,h-23,w,5);x.fillStyle=PR;x.fillRect(0,h*.86,w,8)});
const canSide=new THREE.MeshStandardMaterial({map:canT,metalness:.55,roughness:.28,emissive:0x0a2a66,emissiveIntensity:.35}),canTop=new THREE.MeshStandardMaterial({color:0xd7dde6,metalness:.9,roughness:.25});
const canGeo=new THREE.CylinderGeometry(1,1,1,32);
function can(r,h){const m=new THREE.Mesh(canGeo,[canSide,canTop,canTop]);m.scale.set(r,h,r);return m}
// ---------- CITY ----------
const city=new THREE.Scene();
city.background=tex(16,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0a1630');g.addColorStop(.45,'#28385f');g.addColorStop(.62,'#b9686a');g.addColorStop(.7,'#f2a65e');g.addColorStop(1,'#1a1d2c');x.fillStyle=g;x.fillRect(0,0,w,h)});
city.fog=new THREE.Fog(0x2a3556,300,1500);
city.add(new THREE.HemisphereLight(0xffd2a8,0x0b1530,1.0));const sun=new THREE.DirectionalLight(0xffb37a,1.6);sun.position.set(-300,120,-500);city.add(sun);
const sea=new THREE.Mesh(new THREE.PlaneGeometry(6000,3000),new THREE.MeshStandardMaterial({color:0x2c4672,emissive:0x1a2c4e,emissiveIntensity:.6,metalness:.2,roughness:.35}));sea.rotation.x=-Math.PI/2;sea.position.z=-1560;city.add(sea);
const land=new THREE.Mesh(new THREE.PlaneGeometry(8000,4000),new THREE.MeshStandardMaterial({color:0x1d2433,roughness:1}));land.rotation.x=-Math.PI/2;land.position.set(0,.1,1940);city.add(land);
const win=(lit,col)=>tex(64,256,(x,w,h)=>{x.fillStyle='#141c2c';x.fillRect(0,0,w,h);for(let yy=4;yy<h;yy+=8)for(let xx=3;xx<w;xx+=8){x.fillStyle=rnd()<lit?(rnd()<.7?col:'#9fc4ff'):'#202a3d';x.fillRect(xx,yy,5,5)}});
const mats=[win(.35,'#ffd28a'),win(.25,'#ffe7b8'),win(.45,'#ffc56b')].map(m=>new THREE.MeshStandardMaterial({map:m,emissiveMap:m,emissive:0xffffff,emissiveIntensity:.9,roughness:.6,metalness:.2}));
const box=new THREE.BoxGeometry(1,1,1);box.translate(0,.5,0);
for(let i=0;i<420;i++){let x=(rnd()-.5)*1300,z=-40+rnd()*900;if(Math.abs(x)<70&&z<170)continue;
 const near=Math.exp(-((x*x)/(2*260*260))-((z-120)**2)/(2*300*300)),h=12+rnd()*40+near*150*rnd(),w=12+rnd()*22,d=12+rnd()*22;
 const m=new THREE.Mesh(box,mats[i%3]);m.scale.set(w,h,d);m.position.set(x,0,z);city.add(m)}
// shoreline lights
const pts=[];for(let i=0;i<260;i++)pts.push((rnd()-.5)*1500,1.5,-48+rnd()*4);const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
city.add(new THREE.Points(lg,new THREE.PointsMaterial({color:0xffd9a0,size:1.2,sizeAttenuation:true})));
// HYATT towers
const H=new THREE.Group();H.position.set(0,0,60);city.add(H);
const glass=tex(128,512,(x,w,h)=>{const g=x.createLinearGradient(0,0,w,0);g.addColorStop(0,'#1b2c4a');g.addColorStop(1,'#2d4a74');x.fillStyle=g;x.fillRect(0,0,w,h);
 for(let yy=0;yy<h;yy+=10){x.fillStyle='rgba(255,255,255,.06)';x.fillRect(0,yy,w,1);for(let xx=0;xx<w;xx+=16){if(rnd()<.55){x.fillStyle=rnd()<.8?'rgba(255,214,150,.9)':'rgba(170,205,255,.8)';x.fillRect(xx+2,yy+2,12,6)}}}});
const gm=new THREE.MeshStandardMaterial({map:glass,emissiveMap:glass,emissive:0xffffff,emissiveIntensity:1.05,metalness:.6,roughness:.18});
[[-15,96,24],[16,82,22]].forEach(([x,h,w])=>{const t=new THREE.Mesh(box,gm);t.scale.set(w,h,w);t.position.x=x;H.add(t);
 const cap=new THREE.Mesh(box,new THREE.MeshStandardMaterial({color:0xffffff,emissive:x<0?0xE4002B:0x1f6bff,emissiveIntensity:1.4}));cap.scale.set(w+1.4,1.6,w+1.4);cap.position.set(x,h,0);H.add(cap)});
const pod=new THREE.Mesh(box,new THREE.MeshStandardMaterial({color:0x2a3346,roughness:.7}));pod.scale.set(70,14,44);H.add(pod);
const lobby=tex(512,128,(x,w,h)=>{const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#fff1d0');g.addColorStop(1,'#e6b46f');x.fillStyle=g;x.fillRect(0,0,w,h);x.fillStyle='rgba(60,40,20,.55)';for(let i=0;i<w;i+=32)x.fillRect(i,0,3,h);x.fillRect(0,h*.45,w,3)});
const door=new THREE.Mesh(new THREE.PlaneGeometry(40,10),new THREE.MeshBasicMaterial({map:lobby}));door.position.set(0,5.2,-22.05);door.rotation.y=Math.PI;H.add(door);
const sign=tex(1024,180,(x,w,h)=>{x.fillStyle='rgba(0,0,0,0)';x.clearRect(0,0,w,h);x.font='600 120px Georgia,serif';x.textAlign='center';x.textBaseline='middle';x.shadowColor='#ffe2ad';x.shadowBlur=24;x.fillStyle='#fff7e8';x.fillText('HYATT REGENCY',w/2,h/2+6)});
const sg=new THREE.Mesh(new THREE.PlaneGeometry(22,3.9),new THREE.MeshBasicMaterial({map:sign,transparent:true}));sg.position.set(-15,90,-12.2);sg.rotation.y=Math.PI;H.add(sg);
const cano=tex(1024,96,(x,w,h)=>{x.fillStyle=PB;x.fillRect(0,0,w,h);globe(x,60,h/2,34);let fs=44;do{x.font=`700 ${fs}px Segoe UI,Arial`;fs--}while(x.measureText('PEPSI  ×  HYATT REGENCY PANAMA CITY').width>w-140);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText('PEPSI  ×  HYATT REGENCY PANAMA CITY',w/2+40,h/2+2)});
const cn=new THREE.Mesh(new THREE.BoxGeometry(30,1.6,8),[0,0,0,0,0,0].map((_,i)=>i===5?new THREE.MeshBasicMaterial({map:cano}):new THREE.MeshStandardMaterial({color:0x004B93})));cn.position.set(0,11,-25);H.add(cn);
const beacon=new THREE.PointLight(0x3d8bff,4000,260,1.6);beacon.position.set(0,40,-60);H.add(beacon);
const gT=tex(512,512,(x,w,h)=>{x.clearRect(0,0,w,h);x.shadowColor='#6aa8ff';x.shadowBlur=40;globe(x,w/2,h/2,200)});
const gb=new THREE.Mesh(new THREE.PlaneGeometry(18,18),new THREE.MeshBasicMaterial({map:gT,transparent:true}));gb.position.set(16,58,-11.2);gb.rotation.y=Math.PI;H.add(gb);
const bigCan=can(5,16);bigCan.position.set(-19,8,-32);bigCan.rotation.y=Math.PI*.6;H.add(bigCan);const bigCan2=can(5,16);bigCan2.position.set(19,8,-32);bigCan2.rotation.y=Math.PI*.4;H.add(bigCan2);
const canLight=new THREE.PointLight(0x2f7dff,900,90,1.6);canLight.position.set(0,14,-48);H.add(canLight);
const path=new THREE.CatmullRomCurve3([new THREE.Vector3(-260,260,-760),new THREE.Vector3(-120,170,-430),new THREE.Vector3(-30,95,-170),new THREE.Vector3(0,36,-95),new THREE.Vector3(0,17,-58)]);
const look=new THREE.CatmullRomCurve3([new THREE.Vector3(0,60,60),new THREE.Vector3(-5,62,60),new THREE.Vector3(-4,50,60),new THREE.Vector3(0,20,60),new THREE.Vector3(0,9,0)]);
// ---------- BALLROOM ----------
const room=new THREE.Scene();room.background=new THREE.Color(0x020a1c);room.fog=new THREE.Fog(0x041232,30,90);
room.add(new THREE.HemisphereLight(0xdfe9ff,0x06163a,.6));
const carpet=tex(512,512,(x,w,h)=>{x.fillStyle='#06204a';x.fillRect(0,0,w,h);x.strokeStyle='rgba(120,170,255,.28)';x.lineWidth=3;for(let i=0;i<w;i+=64)for(let j=0;j<h;j+=64){x.beginPath();x.arc(i+32,j+32,20,0,7);x.stroke();x.beginPath();x.moveTo(i,j+32);x.lineTo(i+32,j);x.lineTo(i+64,j+32);x.lineTo(i+32,j+64);x.closePath();x.stroke()}});
carpet.wrapS=carpet.wrapT=THREE.RepeatWrapping;carpet.repeat.set(10,14);
const fl=new THREE.Mesh(new THREE.PlaneGeometry(44,70),new THREE.MeshStandardMaterial({map:carpet,roughness:.9}));fl.rotation.x=-Math.PI/2;room.add(fl);
const wallT=tex(256,256,(x,w,h)=>{x.fillStyle='#0d2c63';x.fillRect(0,0,w,h);x.fillStyle='#0a2352';for(let i=0;i<w;i+=64)x.fillRect(i,0,4,h);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(0,h*.62,w,6)});wallT.wrapS=THREE.RepeatWrapping;wallT.repeat.set(14,1);
const wm=new THREE.MeshStandardMaterial({map:wallT,roughness:.8});
[[-22,0,Math.PI/2],[22,0,-Math.PI/2]].forEach(([x,z,r])=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(70,10),wm);w.position.set(x,5,z);w.rotation.y=r;room.add(w)});
const back=new THREE.Mesh(new THREE.PlaneGeometry(44,10),wm);back.position.set(0,5,-35);room.add(back);
const ceil=new THREE.Mesh(new THREE.PlaneGeometry(44,70),new THREE.MeshStandardMaterial({color:0x0b1f45,emissive:0x061638,emissiveIntensity:.6,roughness:.9}));ceil.rotation.x=Math.PI/2;ceil.position.y=9.5;room.add(ceil);
const stage=new THREE.Mesh(new THREE.BoxGeometry(26,1,7),new THREE.MeshStandardMaterial({color:0x14100c,roughness:.5}));stage.position.set(0,.5,-31);room.add(stage);
const scr=tex(1600,900,(x,w,h)=>{const g=x.createRadialGradient(w/2,0,50,w/2,h/2,w*.75);g.addColorStop(0,'#1a6fe0');g.addColorStop(.55,PB);g.addColorStop(1,PD);x.fillStyle=g;x.fillRect(0,0,w,h);
 globe(x,w/2,230,140);x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.font='800 150px Segoe UI,Arial';x.fillText('pepsi',w/2,460);
 x.fillStyle='#cfe0ff';x.font='600 54px Segoe UI,Arial';x.fillText('welcomes',w/2,570);x.font='700 64px Segoe UI,Arial';x.fillStyle='#fff';x.fillText('HYATT REGENCY',w/2,660);x.fillText('PANAMA CITY',w/2,730);
 x.fillStyle=PR;x.fillRect(w/2-80,775,160,8);x.fillStyle='#cfe0ff';x.font='400 52px Segoe UI,Arial';x.fillText('Four quick questions',w/2,835)});
const screen=new THREE.Mesh(new THREE.PlaneGeometry(16,9),new THREE.MeshBasicMaterial({map:scr}));screen.position.set(0,5.2,-34.9);room.add(screen);
const glow=new THREE.PointLight(0x3d8bff,90,30,1.5);glow.position.set(0,5,-31);room.add(glow);
[-11.5,11.5].forEach(x=>{const c=can(1.7,7.5);c.position.set(x,4.75,-31.5);c.rotation.y=-Math.PI/2+(x<0?.5:-.5);room.add(c);const l=new THREE.PointLight(x<0?0xE4002B:0x2f7dff,40,14,1.6);l.position.set(x,3,-27);room.add(l)});
const cloth=new THREE.MeshStandardMaterial({color:0xf3eee6,roughness:.85}),chairM=new THREE.MeshStandardMaterial({color:0xdfe6ef,metalness:.7,roughness:.3}),cand=new THREE.MeshBasicMaterial({color:0xffd9a0});
const tg=new THREE.CylinderGeometry(1.5,1.6,1.5,28),cg=new THREE.BoxGeometry(.5,1.1,.5),fg=new THREE.SphereGeometry(.38,16,12);
for(const x of [-16,-9.5,9.5,16])for(const z of [20,12,4,-4,-12,-20]){const t=new THREE.Mesh(tg,cloth);t.position.set(x,.75,z);room.add(t);
 for(let k=0;k<3;k++){const a=k/3*Math.PI*2+.4,c=can(.17,.6);c.position.set(x+Math.cos(a)*.42,1.8,z+Math.sin(a)*.42);c.rotation.y=-a+Math.PI;room.add(c)}
 for(let k=0;k<8;k++){const a=k/8*Math.PI*2,ch=new THREE.Mesh(cg,chairM);ch.position.set(x+Math.cos(a)*2.2,.55,z+Math.sin(a)*2.2);ch.rotation.y=-a;room.add(ch)}}
const crys=new THREE.MeshBasicMaterial({color:0xfff1d6}),ring=new THREE.TorusGeometry(1.4,.07,8,40),bead=new THREE.SphereGeometry(.12,10,8);
[[-11,14],[11,14],[-11,-2],[11,-2],[-11,-18],[11,-18],[0,22],[0,6],[0,-10]].forEach(([x,z])=>{const g=new THREE.Group();g.position.set(x,8.2,z);
 for(let r=0;r<3;r++){const t=new THREE.Mesh(ring,crys);t.rotation.x=Math.PI/2;t.position.y=-r*.45;t.scale.setScalar(1-r*.25);g.add(t);for(let k=0;k<14;k++){const a=k/14*Math.PI*2,b=new THREE.Mesh(bead,crys);b.position.set(Math.cos(a)*1.4*(1-r*.25),-r*.45-.25,Math.sin(a)*1.4*(1-r*.25));g.add(b)}}
 const rod=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.3,6),new THREE.MeshStandardMaterial({color:0xc8a46b,metalness:.8}));rod.position.y=.65;g.add(rod);
 room.add(g)});
[-21.8,21.8].forEach(x=>{const c=new THREE.Mesh(new THREE.BoxGeometry(.2,.25,70),new THREE.MeshBasicMaterial({color:x<0?0xff2a4d:0x3d8bff}));c.position.set(x,8.9,0);room.add(c)});
[[-11,8.6,6],[11,8.6,6],[0,8.6,-10],[0,8.6,18],[-11,8.6,-18],[11,8.6,-18]].forEach((p,i)=>{const l=new THREE.PointLight(i%3===2?0xff3355:0xbcd4ff,55,26,1.6);l.position.set(...p);room.add(l)});
// ---------- TIMELINE ----------
const fade=document.getElementById('fade'),title=document.getElementById('title'),survey=document.getElementById('survey');
let done=false;
function frame(t){const portrait=innerWidth<innerHeight;
 if(t<6.15){const p=ease(P(t,.3,6.15)),q=eIn(P(t,4.6,6.15));const u=cl(.15*p+.85*Math.max(p,q)*0+p);
  cam.fov=portrait?74:48;cam.position.copy(path.getPointAt(cl(u)));cam.lookAt(look.getPointAt(cl(u)));cam.updateProjectionMatrix();
  sea.material.color.setHSL(.6,.5,.2+.02*Math.sin(t*2));R.render(city,cam);
  const fin=1-P(t,0,.9),fout=P(t,5.75,6.15);fade.style.background='#fff';fade.style.opacity=t<1?Math.max(fin,0):fout;if(t<1)fade.style.background='#000';
  title.style.opacity=(P(t,1.2,1.9)*(1-P(t,3.6,4.3))).toFixed(3);
 }else{const p=P(t,6.15,10.2),z=28-ease(p)*50.5,y=4.2+Math.sin(p*Math.PI)*.8;
  cam.fov=(portrait?66:52)-ease(P(t,9.4,10.6))*(portrait?2:8);cam.position.set(Math.sin(p*3)*.6*(1-p),y,Math.max(z,-23.3));cam.lookAt(0,5.2-(1-p)*.8,-35);cam.updateProjectionMatrix();
  R.render(room,cam);title.style.opacity=0;fade.style.background='#fff';fade.style.opacity=(1-P(t,6.15,6.7)).toFixed(3);
  if(t>=10.4&&!done)openSurvey();}
}
function openSurvey(){done=true;survey.classList.add('on');requestAnimationFrame(()=>survey.classList.add('show'));document.getElementById('skip').style.display='none'}
function size(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',size);size();
let t0=null;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function loop(ts){if(t0===null)t0=ts;const t=(ts-t0)/1000;if(!done){frame(Math.min(t,END));requestAnimationFrame(loop)}}
document.getElementById('skip').onclick=()=>{frame(10.3);openSurvey()};
document.getElementById('replay').onclick=()=>{survey.classList.remove('show','on');done=false;t0=null;document.getElementById('skip').style.display='';requestAnimationFrame(loop)};
// ---------- SURVEY (mock: localStorage) ----------
const KEY='hyatt-pty-survey-v1',f=document.getElementById('f'),err=document.getElementById('err');
f.addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(f));
 for(const k in d)d[k]=d[k].trim();if(!d.gm||!d.fb||!d.hotel){err.textContent='Please answer all four questions.';return}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)){err.textContent='Please enter a valid e-mail.';document.getElementById('email').focus();return}
 err.textContent='';const all=JSON.parse(localStorage.getItem(KEY)||'[]');all.push({...d,at:new Date().toISOString()});localStorage.setItem(KEY,JSON.stringify(all));
 f.style.display='none';document.getElementById('thanks').style.display='block'});
document.getElementById('again').onclick=()=>{f.reset();f.style.display='';document.getElementById('thanks').style.display='none'};
function admin(){const a=document.getElementById('admin'),rows=JSON.parse(localStorage.getItem(KEY)||'[]');a.style.display='block';document.body.style.overflow='auto';
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 a.innerHTML=`<h2 style="font-family:Georgia,serif;font-weight:400">Responses (demo · this device) — ${rows.length}</h2><p><button id="csv">Download CSV</button></p><table><tr><th>Date</th><th>General Manager</th><th>F&amp;B Director</th><th>Hotel</th><th>E-mail</th></tr>${rows.map(r=>`<tr><td>${esc(r.at)}</td><td>${esc(r.gm)}</td><td>${esc(r.fb)}</td><td>${esc(r.hotel)}</td><td>${esc(r.email)}</td></tr>`).join('')}</table>`;
 document.getElementById('csv').onclick=()=>{const q=v=>'"'+String(v).replace(/"/g,'""')+'"';const csv=['date,general_manager,fb_director,hotel,email',...rows.map(r=>[r.at,r.gm,r.fb,r.hotel,r.email].map(q).join(','))].join('\n');
  const b=new Blob(['\ufeff'+csv],{type:'text/csv'}),l=document.createElement('a');l.href=URL.createObjectURL(b);l.download='hyatt-survey.csv';l.click()}}
window.__frame=frame;
if(Q.has('admin'))admin();else if(FIX!==null){frame(FIX);if(FIX>=10.4)openSurvey()}else if(reduce||Q.has('form')){frame(10.3);openSurvey()}else requestAnimationFrame(loop);

