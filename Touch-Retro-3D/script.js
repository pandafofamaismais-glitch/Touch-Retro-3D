import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const $=id=>document.getElementById(id);
const menu=$("menu"), phasesScreen=$("phases"), charsScreen=$("characters"), how=$("how"), game=$("game");
const sceneHost=$("scene"), grid=$("phaseGrid"), charGrid=$("characterGrid");
const livesEl=$("lives"), scoreEl=$("score"), progressEl=$("progress"), phaseNameEl=$("phaseName"), gameNameEl=$("gameName"), tipEl=$("phaseTip"), message=$("message");
const stick=$("stick"), knob=$("stickKnob"), actions=$("actions");

const PHASES=[
 {n:1,name:"MARIO KART",tag:"CORRIDA",tip:"Arraste para trocar de faixa. Use TURBO para acelerar.",chars:["Mario","Luigi","Peach","Toad"]},
 {n:2,name:"BOMBERMAN",tag:"BOMBAS",tip:"Toque para colocar bombas. Afaste-se antes da explosão.",chars:["Bomberman","White","Black","Pink"]},
 {n:3,name:"PAC-MAN",tag:"LABIRINTO",tip:"Use o joystick para comer pontos e fugir dos fantasmas.",chars:["Pac-Man","Inky","Pinky","Clyde"]},
 {n:4,name:"SUPER MARIO BROS.",tag:"PLATAFORMA",tip:"Mova no joystick e toque em PULAR para passar pelos obstáculos.",chars:["Mario","Luigi","Toad","Peach"]},
 {n:5,name:"DONKEY KONG",tag:"ARCADE",tip:"Suba a estrutura e desvie dos barris rolando.",chars:["Jumpman","Donkey Kong","Pauline","Diddy Kong"]},
 {n:6,name:"STREET FIGHTER",tag:"LUTA",tip:"Ataque, defenda e faça uma sequência de golpes.",chars:["Ryu","Ken","Chun-Li","Guile"]},
 {n:7,name:"MORTAL KOMBAT",tag:"COMBATE",tip:"Derrote o adversário usando ataque e defesa no timing certo.",chars:["Scorpion","Sub-Zero","Kitana","Liu Kang"]},
 {n:8,name:"POKÉMON",tag:"BATALHA",tip:"Escolha um golpe a cada turno e reduza o HP do oponente.",chars:["Pikachu","Charizard","Bulbasaur","Squirtle"]},
 {n:9,name:"SONIC",tag:"VELOCIDADE",tip:"Arraste para mudar de faixa, pegue anéis e evite obstáculos.",chars:["Sonic","Tails","Knuckles","Amy"]},
 {n:10,name:"FLAPPY BIRD",tag:"VOO",tip:"Toque para bater as asas. Passe pelos canos sem encostar.",chars:["Bird","Blue Bird","Red Bird","Yellow Bird"]},
 {n:11,name:"GUITAR HERO",tag:"RITMO",tip:"Toque no botão quando as notas chegarem à linha de acerto.",chars:["Guitarist","Rockstar","DJ","Drummer"]},
 {n:12,name:"RETRO CHAOS",tag:"FINAL",tip:"A final mistura corrida, coleta, esquiva, salto, ataque e ritmo.",chars:["Retro Hero","Pixel Knight","Arcade Kid","Glitch"]}
];
let unlocked=Number(localStorage.getItem("touchRetroUnlocked")||1);
unlocked=Math.max(1,Math.min(12,unlocked));
let phase=1, chosenChar="", score=0,lives=3,running=false,paused=false,last=0,raf=0;
let renderer,camera,world,player,enemy,objects=[],state={},joy={x:0,y:0},touchId=null;

const charEmoji={Mario:"🍄",Luigi:"🟢",Peach:"👑",Toad:"🔴",Bomberman:"💣",White:"⚪",Black:"⚫",Pink:"🌸","Pac-Man":"🟡",Inky:"🔵",Pinky:"🩷",Clyde:"🟠",Jumpman:"🧢","Donkey Kong":"🦍","Pauline":"🎀","Diddy Kong":"🐒",Ryu:"🥋",Ken:"🥋","Chun-Li":"🥊",Guile:"🪖",Scorpion:"🔥","Sub-Zero":"❄️",Kitana:"🪭","Liu Kang":"🐉",Pikachu:"⚡",Charizard:"🔥",Bulbasaur:"🌿",Squirtle:"💧",Sonic:"💨",Tails:"🦊",Knuckles:"🔴",Amy:"🔨",Bird:"🐦","Blue Bird":"🐦","Red Bird":"🐦","Yellow Bird":"🐦",Guitarist:"🎸",Rockstar:"🎤",DJ:"🎧",Drummer:"🥁","Retro Hero":"⭐","Pixel Knight":"🛡️","Arcade Kid":"👾",Glitch:"🌀"};

function showOnly(el){[menu,phasesScreen,charsScreen,how,game].forEach(x=>x.classList.add("hidden"));el.classList.remove("hidden")}
window.showPhases=()=>{showOnly(phasesScreen);renderPhases()};
window.showHow=()=>showOnly(how);
window.backToMenu=()=>{stopGame();showOnly(menu)};
function renderPhases(){
 grid.innerHTML="";
 PHASES.forEach(p=>{
   const b=document.createElement("button");b.className="phase"+(p.n>unlocked?" locked":"");
   b.innerHTML=`<span class="num">FASE ${String(p.n).padStart(2,"0")}</span><strong>${p.name}</strong><small>${p.n>unlocked?"🔒 BLOQUEADA":"✓ LIBERADA"}</small><span class="tag">${p.tag}</span>`;
   if(p.n<=unlocked)b.onclick=()=>choosePhase(p.n);
   grid.appendChild(b);
 });
}
function choosePhase(n){
 phase=n; const p=PHASES[n-1];
 $("charGame").textContent=p.name; $("charHint").textContent=p.tip;
 charGrid.innerHTML="";
 p.chars.forEach(c=>{
   const b=document.createElement("button");b.className="character";
   b.innerHTML=`<div class="avatar">${charEmoji[c]||"👾"}</div><strong>${c}</strong><small>ESCOLHER</small>`;
   b.onclick=()=>startGame(c);charGrid.appendChild(b);
 });
 showOnly(charsScreen);
}

function startGame(c){
 chosenChar=c; score=0;lives=3;paused=false;running=true;state={};objects=[];
showOnly(game);setup3D();setupPhase();updateHUD();
last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);
}
function stopGame(){running=false;cancelAnimationFrame(raf);if(renderer){renderer.dispose();sceneHost.innerHTML=""}}
function setup3D(){
 sceneHost.innerHTML="";
 renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;
 sceneHost.appendChild(renderer.domElement);
 world=new THREE.Scene();world.fog=new THREE.Fog(0x07101d,18,65);
 camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.1,200);
 world.add(new THREE.HemisphereLight(0xbdd5ff,0x18202e,2.1));
 const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(10,20,8);sun.castShadow=true;world.add(sun);
 window.onresize=()=>{if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};
}
function mat(color,emissive=0){return new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.12,emissive,emissiveIntensity:emissive?1.4:0})}
function box(x,y,z,sx,sy,sz,color){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;world.add(m);objects.push(m);return m}
function sphere(x,y,z,r,color){const m=new THREE.Mesh(new THREE.SphereGeometry(r,18,14),mat(color));m.position.set(x,y,z);m.castShadow=true;world.add(m);objects.push(m);return m}
function floor(color=0x182334,w=40,d=80){return box(0,-.3,0,w,.5,d,color)}
function clearObjects(){objects.forEach(o=>world.remove(o));objects=[];player=null;enemy=null}
function makeAvatar(c,color=0xffd43b){
 const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.85,6,12),mat(color));body.position.y=1;body.castShadow=true;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.42,16,12),mat(0xffc38f));head.position.y=1.85;head.castShadow=true;g.add(head);
 const mark=new THREE.Mesh(new THREE.BoxGeometry(.55,.12,.08),mat(0x111827));mark.position.set(0,1.95,.39);g.add(mark);
 world.add(g);return g;
}
function addAction(label,fn,secondary=false){
 const b=document.createElement("button");b.className="action"+(secondary?" secondary-action":"");b.textContent=label;b.addEventListener("pointerdown",e=>{e.preventDefault();if(running&&!paused)fn()});actions.appendChild(b);return b;
}
function setupControls(){
 actions.innerHTML="";
 stick.onpointerdown=e=>{e.preventDefault();touchId=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e)};
 stick.onpointermove=e=>{if(e.pointerId===touchId)moveStick(e)};
 stick.onpointerup=stick.onpointercancel=()=>{touchId=null;joy.x=joy.y=0;knob.style.transform="translate(0,0)"};
 function moveStick(e){
  const r=stick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
  let dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.36,d=Math.hypot(dx,dy);if(d>max){dx=dx/d*max;dy=dy/d*max}
  joy.x=dx/max;joy.y=dy/max;knob.style.transform=`translate(${dx}px,${dy}px)`;
 }
}
function setupPhase(){
 clearObjects();setupControls();const p=PHASES[phase-1];gameNameEl.textContent=p.name;phaseNameEl.textContent=`FASE ${phase}`;
 tipEl.textContent=p.tip;state.start=performance.now();state.goal=0;state.hit=0;
 switch(phase){
 case 1:return kart();
 case 2:return bomber();
 case 3:return pacman();
 case 4:return mario();
 case 5:return donkey();
 case 6:return street();
 case 7:return mortal();
 case 8:return pokemon();
 case 9:return sonic();
 case 10:return flappy();
 case 11:return guitar();
 case 12:return finalPhase();
 }
}

function kart(){
 floor(0x182b20,26,100);camera.position.set(0,8,12);player=makeAvatar(chosenChar,0xe5b62b);player.position.set(0,.3,8);state.lane=0;state.dist=0;state.spawn=0;
 for(let x of [-4,-2,0,2,4])box(x,-.02,-20,1.6,.1,100,0x263449);
 addAction("TURBO",()=>{state.boost=Math.min((state.boost||0)+1,3);score+=10},true);
}
function updateKart(dt){
 player.position.x+=(joy.x*5-player.position.x)*dt*5;player.position.x=THREE.MathUtils.clamp(player.position.x,-5,5);
 player.position.z=8;state.dist+=(7+(state.boost>0?8:0))*dt;if(state.boost>0)state.boost-=dt;
 state.spawn-=dt;if(state.spawn<=0){state.spawn=.7;const x=[-4,-2,0,2,4][Math.floor(Math.random()*5)];box(x,.45,-45,.9,.9,1.8,0xd44747).userData.road=true}
 objects.filter(o=>o.userData.road).forEach(o=>{o.position.z+= (7+(state.boost>0?8:0))*dt;if(Math.abs(o.position.x-player.position.x)<.8&&Math.abs(o.position.z-player.position.z)<1){o.position.z=100;loseLife()}});
 objects.filter(o=>o.userData.road&&o.position.z>20).forEach(o=>world.remove(o));
 if(state.dist>70)win();
}

function bomber(){
 floor(0x30422c,28,28);camera.position.set(0,12,13);camera.lookAt(0,0,0);player=makeAvatar(chosenChar,0xffd43b);player.position.y=.2;state.bombs=[];
 for(let x=-5;x<=5;x+=2){for(let z=-5;z<=5;z+=2)if(Math.random()<.65)box(x,.6,z,1.3,1.2,1.3,0xb4773d).userData.crate=true}
 addAction("💣",()=>placeBomb());addAction("⚡",()=>{joy.x*=1.5;joy.y*=1.5},true);
}
function placeBomb(){if(state.bombs.length>=3)return;const b=sphere(player.position.x,.55,player.position.z,.45,0x111827);b.userData.bomb=true;b.userData.t=1.5;state.bombs.push(b);score+=5}
function updateBomber(dt){
 player.position.x+=joy.x*5*dt;player.position.z+=joy.y*5*dt;player.position.x=THREE.MathUtils.clamp(player.position.x,-6,6);player.position.z=THREE.MathUtils.clamp(player.position.z,-6,6);
 state.bombs.forEach(b=>{b.userData.t-=dt;b.scale.setScalar(1+Math.sin(performance.now()/70)*.1);if(b.userData.t<=0){world.remove(b);const blast=box(b.position.x,.2,b.position.z,4,.3,.6,0xff8a00);blast.userData.blast=true;setTimeout(()=>world.remove(blast),180);state.bombs=state.bombs.filter(x=>x!==b);state.goal++;objects.filter(o=>o.userData.crate&&o.position.distanceTo(b.position)<4).forEach(o=>{world.remove(o);score+=10})}});
 if(state.goal>=4||score>=50)win();
}
function pacman(){
 floor(0x142342,24,24);camera.position.set(0,14,12);camera.lookAt(0,0,0);player=makeAvatar(chosenChar,0xffd43b);player.position.y=.25;
 for(let x=-5;x<=5;x+=2){box(x,.8,-6,1.4,1.6,.6,0x3152a4);box(x,.8,6,1.4,1.6,.6,0x3152a4)}
 for(let z=-4;z<=4;z+=2){box(-6,.8,z,.6,1.6,1.4,0x3152a4);box(6,.8,z,.6,1.6,1.4,0x3152a4)}
 state.pellets=[];for(let i=0;i<15;i++){const p=sphere((Math.random()*10-5),.3,(Math.random()*10-5),.13,0xffd43b);p.userData.pellet=true;state.pellets.push(p)}
 state.ghost=sphere(0,.5,-3,.5,0xe85d75);state.ghost.userData.ghost=true;addAction("↔",()=>{});
}
function updatePac(dt){
 player.position.x+=joy.x*4*dt;player.position.z+=joy.y*4*dt;player.position.x=THREE.MathUtils.clamp(player.position.x,-5.3,5.3);player.position.z=THREE.MathUtils.clamp(player.position.z,-5.3,5.3);
 state.pellets.forEach(p=>{if(p.parent&&p.position.distanceTo(player.position)<.65){world.remove(p);score+=10;state.goal++}});
 state.ghost.position.lerp(player.position,.35*dt);if(state.ghost.position.distanceTo(player.position)<.7)loseLife();
 if(state.goal>=12)win();
}
function mario(){
 floor(0x3d7c38,35,70);camera.position.set(0,7,12);player=makeAvatar(chosenChar,0xd93636);player.position.set(0,.2,8);state.vy=0;state.coins=0;state.z=8;state.spawn=0;
 for(let i=0;i<9;i++){box((Math.random()*8-4),.6,3-i*7,1.5,1.2,1.2,0x8d5a35).userData.block=true}
 addAction("⬆",()=>{if(player.position.y<.4){state.vy=8}},false);
}
function updateMario(dt){
 state.vy-=20*dt;player.position.y+=state.vy*dt;if(player.position.y<.25){player.position.y=.25;state.vy=0}
 player.position.x+=joy.x*5*dt;player.position.x=THREE.MathUtils.clamp(player.position.x,-5,5);state.z-=4*dt;
 objects.filter(o=>o.userData.block).forEach(o=>{o.position.z+=4*dt;if(Math.abs(o.position.x-player.position.x)<.9&&Math.abs(o.position.z-player.position.z)<1&&player.position.y<1)loseLife()});
 if(Math.random()<dt*.6){const c=sphere(Math.random()*8-4,1, -35,.2,0xffd43b);c.userData.coin=true}
 objects.filter(o=>o.userData.coin).forEach(c=>{c.position.z+=4*dt;if(c.position.distanceTo(player.position)<.8){world.remove(c);score+=10;state.coins++}})
 if(state.coins>=8)win();
}
function donkey(){
 floor(0x6b3b22,26,34);camera.position.set(0,10,14);player=makeAvatar(chosenChar,0x7b4a2b);player.position.set(-5,.3,10);state.level=0;state.spawn=0;
 for(let y=0;y<5;y++){const z=10-y*5;box(0,y*2,z,20,.35,2,0x8b5a2b);for(let x=-8;x<9;x+=2)box(x,y*2+.45,z,1,.5,.3,0xb98242)}
 addAction("JUMP",()=>{if(player.position.y<1)state.jump=8});
}
function updateDonkey(dt){
 state.jump=(state.jump||0)-12*dt;player.position.y+=state.jump*dt;if(player.position.y<.5){player.position.y=.5;state.jump=0}
 player.position.x+=joy.x*5*dt;player.position.x=THREE.MathUtils.clamp(player.position.x,-9,9);state.z-=Math.abs(joy.y)*dt*4;
 if(Math.random()<dt*.8){const b=sphere(Math.random()*16-8,.7,player.position.z,.45,0xa86b32);b.userData.barrel=true;b.userData.v=-5}
 objects.filter(o=>o.userData.barrel).forEach(b=>{b.position.x+=b.userData.v*dt;if(Math.abs(b.position.x-player.position.x)<.8&&Math.abs(b.position.y-player.position.y)<1)loseLife()});
 if(player.position.x>8){state.level++;player.position.x=-8;player.position.y+=2;score+=25}if(state.level>=5)win();
}
function fightBase(type){
 floor(0x251d35,26,20);camera.position.set(0,6,12);player=makeAvatar(chosenChar,0x3b82f6);player.position.set(-3,.2,0);enemy=makeAvatar("enemy",0xd44747);enemy.position.set(3,.2,0);state.enemyHP=type==="street"?8:10;state.combo=0;state.guard=false;
 addAction("👊",()=>attack(),false);addAction("🛡️",()=>{state.guard=true;setTimeout(()=>state.guard=false,500)},true);
}
function attack(){if(!enemy||state.enemyHP<=0)return;state.enemyHP--;score+=10;state.combo++;enemy.position.x=3+(Math.random()-.5)*.3;if(state.enemyHP<=0)win()}
function updateFight(dt){player.position.x+=joy.x*2*dt;player.position.x=THREE.MathUtils.clamp(player.position.x,-5,-1);if(enemy)enemy.rotation.y+=dt*1.5;if(Math.random()<dt*.22&&!state.guard)loseLife()}
function street(){fightBase("street")}
function mortal(){fightBase("mortal")}
function pokemon(){
 floor(0x243b53,30,20);camera.position.set(0,7,13);player=makeAvatar(chosenChar,0x35a7ff);player.position.set(-3,.3,0);enemy=makeAvatar("opponent",0xe85d75);enemy.position.set(3,.3,-1);state.enemyHP=12;state.turn=true;
 addAction("⚡",()=>pokeAttack(3));addAction("🛡️",()=>pokeAttack(1),true);addAction("🔥",()=>pokeAttack(2),true);
}
function pokeAttack(dmg){if(!state.turn||!enemy)return;state.turn=false;state.enemyHP-=dmg;score+=dmg*10;setTimeout(()=>{if(state.enemyHP>0&&!paused&&running){if(Math.random()>.25)loseLife();state.turn=true}else if(state.enemyHP<=0)win()},350)}
function updatePokemon(){}
function sonic(){
 floor(0x23552d,28,100);camera.position.set(0,7,12);player=makeAvatar(chosenChar,0x1987ff);player.position.set(0,.3,8);state.dist=0;state.rings=0;state.spawn=0;
 addAction("💨",()=>{state.dash=.6;score+=5});
}
function updateSonic(dt){
 player.position.x+=joy.x*7*dt;player.position.x=THREE.MathUtils.clamp(player.position.x,-5,5);state.dist+= (12+(state.dash?10:0))*dt;if(state.dash){state.dash-=dt}
 state.spawn-=dt;if(state.spawn<=0){state.spawn=.45;const o=sphere(Math.random()*10-5,.6,-35,.35,0xffd43b);o.userData.ring=true}
 objects.filter(o=>o.userData.ring).forEach(o=>{o.position.z+=(12+(state.dash?10:0))*dt;if(o.position.distanceTo(player.position)<.7){world.remove(o);score+=10;state.rings++}});
 if(Math.random()<dt*.6){const o=box(Math.random()*10-5,.5,-40,1,1,1,0x333b4d);o.userData.sonicObstacle=true}
 objects.filter(o=>o.userData.sonicObstacle).forEach(o=>{o.position.z+=12*dt;if(o.position.distanceTo(player.position)<1)loseLife()});
 if(state.dist>90)win();
}
function flappy(){
 floor(0x5d8dba,30,50);camera.position.set(0,2,10);player=makeAvatar(chosenChar,0xf1c83b);player.position.set(-5,2,0);state.vy=0;state.pipe=0;state.passed=0;
 addAction("🐦",()=>state.vy=7);
}
function updateFlappy(dt){
 state.vy-=14*dt;player.position.y+=state.vy*dt;state.pipe-=dt;if(state.pipe<=0){state.pipe=1.6;const gap=2+Math.random()*1.2,z=-25;const center=-.5+Math.random()*3;const top=box(4,center+4.5,z,1.5,6,1.5,0x3e9147);const bot=box(4,center-4.5,z,1.5,5,1.5,0x3e9147);top.userData.pipe=bot.userData.pipe=true;top.userData.center=bot.userData.center=center;top.userData.scored=false}
 objects.filter(o=>o.userData.pipe).forEach(o=>{o.position.z+=8*dt;if(!o.userData.scored&&o.position.z>player.position.z){o.userData.scored=true;score+=5;state.passed++}
 if(Math.abs(o.position.z-player.position.z)<1.2&&Math.abs(o.position.x-player.position.x)<1){const c=o.userData.center;if((o.position.y>c && player.position.y>c+1.2)||(o.position.y<c && player.position.y<c-1.2))loseLife()}});
 if(player.position.y<-3||player.position.y>7)loseLife();if(state.passed>=8)win();
}
function guitar(){
 floor(0x101827,20,36);camera.position.set(0,7,12);player=makeAvatar(chosenChar,0xa94cff);player.position.set(0,.3,9);state.note=0;state.hit=0;
 for(let i=0;i<4;i++)box(-4+i*2,0,-2,1.7,.3,30,[0xd33b55,0x3da7ff,0x4ecb71,0xf1c83b][i]);
 addAction("♪",()=>hitNote());
}
function hitNote(){const n=objects.find(o=>o.userData.note&&Math.abs(o.position.z-player.position.z)<2);if(n){world.remove(n);score+=20;state.hit++}else loseLife()}
function updateGuitar(dt){
 state.note-=dt;if(state.note<=0){state.note=.65;const lane=Math.floor(Math.random()*4);const n=sphere(-4+lane*2,.5,-12,.3,0xffffff);n.userData.note=true;n.userData.lane=lane}
 objects.filter(o=>o.userData.note).forEach(n=>{n.position.z+=8*dt;if(n.position.z>12){world.remove(n);loseLife()}});
 if(state.hit>=12)win();
}
function finalPhase(){
 floor(0x1c1b2e,32,70);camera.position.set(0,8,13);player=makeAvatar(chosenChar,0xffd43b);player.position.set(0,.3,8);state.goal=0;state.spawn=0;
 addAction("⚡",()=>{state.boost=.5;score+=5});addAction("💥",()=>{objects.filter(o=>o.userData.target&&o.position.distanceTo(player.position)<4).forEach(o=>{world.remove(o);score+=10;state.goal++})},true);
}
function updateFinal(dt){
 player.position.x+=joy.x*6*dt;player.position.z=8;state.spawn-=dt;if(state.spawn<=0){state.spawn=.55;const kind=Math.floor(Math.random()*3);let o=sphere(Math.random()*10-5,.6,-30,.4,kind===0?0xffd43b:kind===1?0xe85d75:0x55aaff);o.userData.target=true}
 objects.filter(o=>o.userData.target).forEach(o=>{o.position.z+=9*dt;if(o.position.distanceTo(player.position)<.9){world.remove(o);if(Math.random()<.5)loseLife()}});
 state.goal++;if(state.goal>160)win(true);
}

function update(dt){
 if(paused)return;
 switch(phase){
  case 1:updateKart(dt);break;case 2:updateBomber(dt);break;case 3:updatePac(dt);break;case 4:updateMario(dt);break;case 5:updateDonkey(dt);break;
  case 6:updateFight(dt);break;case 7:updateFight(dt);break;case 8:updatePokemon(dt);break;case 9:updateSonic(dt);break;case 10:updateFlappy(dt);break;case 11:updateGuitar(dt);break;case 12:updateFinal(dt);
 }
}
function animateWorld(){if(!world)return;camera.lookAt(0,1,0);renderer.render(world,camera)}
function loop(t){if(!running)return;const dt=Math.min(.035,(t-last)/1000);last=t;update(dt);updateHUD();animateWorld();raf=requestAnimationFrame(loop)}
function updateHUD(){
 livesEl.textContent=lives;scoreEl.textContent=score;let val=0;
 if(phase===1)val=state.dist/70;if(phase===2)val=state.goal/4;if(phase===3)val=state.goal/12;if(phase===4)val=state.coins/8;if(phase===5)val=state.level/5;
 if(phase===6||phase===7||phase===8)val=1-(state.enemyHP||0)/(phase===6?8:phase===7?10:12);
 if(phase===9)val=state.dist/90;if(phase===10)val=state.passed/8;if(phase===11)val=state.hit/12;if(phase===12)val=state.goal/160;
 progressEl.style.width=`${Math.max(0,Math.min(100,val*100))}%`;
}
function loseLife(){
 if(!running)return;lives--;state.hit=0;
 if(lives<=0){running=false;showMessage("GAME OVER","Toque para voltar às fases",()=>showPhases())}
 else{if(player){player.position.x=0;player.position.y=Math.max(.5,player.position.y)}}
}
function win(final=false){
 if(!running)return;score+=100;running=false;
 if(phase===unlocked&&unlocked<12){unlocked++;localStorage.setItem("touchRetroUnlocked",unlocked)}
 if(final)showMessage("🏆 RETRO MASTER","Você venceu a fase final.",()=>showPhases());
 else showMessage(`FASE ${phase} CONCLUÍDA!`,`Personagem: ${chosenChar} • Pontos: ${score}`,()=>{if(phase<12)choosePhase(phase+1);else showPhases()});
}
function showMessage(title,sub,fn){message.innerHTML=`<div>${title}<small>${sub}<br><br>TOQUE PARA CONTINUAR</small></div>`;message.classList.remove("hidden");message.onclick=()=>{message.classList.add("hidden");message.onclick=null;fn()}}
window.togglePause=()=>{if(!running)return;if(!paused){paused=true;message.innerHTML=`<div>PAUSADO<small>Toque aqui para continuar</small></div>`;message.classList.remove("hidden");message.onclick=()=>{paused=false;message.classList.add("hidden");message.onclick=null}}else{paused=false;message.classList.add("hidden")}};

["pointerdown","touchstart","gesturestart"].forEach(ev=>document.addEventListener(ev,e=>{if(ev!=="pointerdown")e.preventDefault()},{passive:false}));
actions.addEventListener("pointerdown",e=>e.stopPropagation());
showPhases();
