const COLS=10,ROWS=22,HID=2;
const SH={I:[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],J:[[1,0,0],[1,1,1],[0,0,0]],L:[[0,0,1],[1,1,1],[0,0,0]],O:[[1,1],[1,1]],S:[[0,1,1],[1,1,0],[0,0,0]],T:[[0,1,0],[1,1,1],[0,0,0]],Z:[[1,1,0],[0,1,1],[0,0,0]]};
const COL={I:'#3ce0f0',J:'#3a6cf8',L:'#f89c2c',O:'#f8e03c',S:'#4ce06c',T:'#b05cf0',Z:'#f04c5c'};
const KJ={'0>1':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],'1>0':[[0,0],[1,0],[1,-1],[0,2],[1,2]],'1>2':[[0,0],[1,0],[1,-1],[0,2],[1,2]],'2>1':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
'2>3':[[0,0],[1,0],[1,1],[0,-2],[1,-2]],'3>2':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],'3>0':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],'0>3':[[0,0],[1,0],[1,1],[0,-2],[1,-2]]};
const KI={'0>1':[[0,0],[-2,0],[1,0],[-2,-1],[1,2]],'1>0':[[0,0],[2,0],[-1,0],[2,1],[-1,-2]],'1>2':[[0,0],[-1,0],[2,0],[-1,2],[2,-1]],'2>1':[[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
'2>3':[[0,0],[2,0],[-1,0],[2,1],[-1,-2]],'3>2':[[0,0],[-2,0],[1,0],[-2,-1],[1,2]],'3>0':[[0,0],[1,0],[-2,0],[1,-2],[-2,1]],'0>3':[[0,0],[-1,0],[2,0],[-1,2],[2,-1]]};
const rot=m=>m.map((r,i)=>r.map((_,j)=>m[m.length-1-j][i]));
function mats(k){const a=[SH[k]];for(let i=1;i<4;i++)a.push(k=='O'?SH[k]:rot(a[i-1]));return a}
const MATS={};for(const k in SH)MATS[k]=mats(k);
let board,cur,hold,canHold,queue,bag,lines,dropT,lockT,lockMoves,clearing,clearT,cell,bx,by,stats,lastAct='';
function newBag(){const b=Object.keys(SH);for(let i=b.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[b[i],b[j]]=[b[j],b[i]]}return b}
function nextPiece(){while(queue.length<5){if(!bag.length)bag=newBag();queue.push(bag.pop())}return queue.shift()}
function fits(k,r,x,y){const m=MATS[k][r];for(let i=0;i<m.length;i++)for(let j=0;j<m[i].length;j++)if(m[i][j]){const X=x+j,Y=y+i;if(X<0||X>=COLS||Y>=ROWS)return false;if(Y>=0&&board[Y][X])return false}return true}
function spawn(k){cur={k,r:0,x:k=='O'?4:3,y:0};if(!fits(k,0,cur.x,cur.y)){gameOver();return}if(fits(k,0,cur.x,cur.y+1))cur.y++;dropT=0;lockT=0;lockMoves=0}
function gravF(){return Math.max(1,60*Math.pow(.8-(level-1)*.007,level-1))}
function startGame(lv){score=0;level=lv;startLevelBase=lv;lines=0;board=Array.from({length:ROWS},()=>Array(COLS).fill(0));queue=[];bag=[];hold=null;canHold=true;clearing=null;state='play';spawn(nextPiece());SND.start();ui()}
function gameOver(){state='over';overT=t;saveBest();SND.over();ui()}
function moved(){if(!fits(cur.k,cur.r,cur.x,cur.y+1)&&lockMoves<15){lockT=0;lockMoves++}}
function move(dx){if(state!='play'||clearing)return false;if(fits(cur.k,cur.r,cur.x+dx,cur.y)){cur.x+=dx;moved();SND.move();return true}return false}
function rotate(d){if(state!='play'||clearing||cur.k=='O')return;const nr=(cur.r+d+4)%4,tb=(cur.k=='I'?KI:KJ)[cur.r+'>'+nr];
 for(const[kx,ky]of tb){if(fits(cur.k,nr,cur.x+kx,cur.y-ky)){cur.x+=kx;cur.y-=ky;cur.r=nr;moved();SND.rot();return true}}return false}
function soft(){if(state!='play'||clearing)return;if(fits(cur.k,cur.r,cur.x,cur.y+1)){cur.y++;score+=1;dropT=0}}
function ghostY(){let y=cur.y;while(fits(cur.k,cur.r,cur.x,y+1))y++;return y}
function hard(){if(state!='play'||clearing)return;const y=ghostY();score+=2*(y-cur.y);cur.y=y;SND.hard();lock()}
function doHold(){if(state!='play'||clearing||!canHold)return;const k=cur.k;if(hold){spawn(hold)}else spawn(nextPiece());hold=k;canHold=false;SND.rot()}
function lock(){const m=MATS[cur.k][cur.r];let top=false;for(let i=0;i<m.length;i++)for(let j=0;j<m[i].length;j++)if(m[i][j]){const Y=cur.y+i;if(Y<HID)top=true;if(Y>=0)board[Y][cur.x+j]=cur.k}
 const full=[];for(let y=0;y<ROWS;y++)if(board[y].every(v=>v))full.push(y);canHold=true;
 if(full.length){clearing=full;clearT=0;const pts=[0,100,300,500,800][full.length]*level;score+=pts;lines+=full.length;say(['','SINGLE','DOUBLE','TRIPLE','QUAD!'][full.length]+' +'+pts,70);full.length==4?SND.quad():SND.clear();
  const nl=Math.floor(lines/10)+startLevelBase;if(nl>level){level=nl;say('LEVEL '+level+'!',90);SND.level()}}
 else{SND.lock();if(top&&full.length==0&&cur.y<HID-1){}spawn(nextPiece())}saveBest()}
let startLevelBase=1;
// input
const DAS=10,ARR=2;let held={},heldT={};
function act(a){A();if(a=='left')move(-1);else if(a=='right')move(1);else if(a=='down')soft();else if(a=='cw')rotate(1);else if(a=='ccw')rotate(-1);else if(a=='hard')hard();else if(a=='hold')doHold()}
document.querySelectorAll('#bar button').forEach(b=>{const a=b.dataset.a;b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(state!='play'||paused)return;act(a);if(a=='left'||a=='right'||a=='down'){held[a]=1;heldT[a]=0}});
 for(const ev of['pointerup','pointerleave','pointercancel'])b.addEventListener(ev,()=>{held[a]=0})});
const KM={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'cw',x:'cw',X:'cw',z:'ccw',Z:'ccw',' ':'hard',c:'hold',C:'hold',Shift:'hold'};
addEventListener('keydown',e=>{if(state!='play'){if((e.key==' '||e.key=='Enter')&&(state=='title'||(state=='over'&&t-overT>40))){A();startGame(state=='title'?startLv:1);startLevelBase=level}return}if(paused)return;const a=KM[e.key];if(!a)return;e.preventDefault();if(e.repeat)return;act(a);if(a=='left'||a=='right'||a=='down'){held[a]=1;heldT[a]=0}});
addEventListener('keyup',e=>{const a=KM[e.key];if(a)held[a]=0});
let ptr=null;
c.addEventListener('pointerdown',e=>{A();if(state=='title'||(state=='over'&&t-overT>40)){startGame(state=='title'?startLv:1);startLevelBase=level;return}if(state!='play'||paused)return;ptr={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now(),moved:false,acc:0}});
addEventListener('pointermove',e=>{if(!ptr||state!='play')return;const cs=cell/DPR*.85,dx=e.clientX-ptr.x,dy=e.clientY-ptr.y;
 if(Math.abs(dx)>=cs){const n=Math.trunc(dx/cs);for(let i=0;i<Math.abs(n);i++)move(Math.sign(n));ptr.x+=n*cs;ptr.moved=true}
 if(dy>=cs){const n=Math.trunc(dy/cs);for(let i=0;i<n;i++)soft();ptr.y+=n*cs;ptr.moved=true}else if(dy<-cs*2.5&&!ptr.held){ptr.held=1;doHold();ptr.moved=true}});
addEventListener('pointerup',e=>{if(!ptr)return;const dt=performance.now()-ptr.t,dy=e.clientY-ptr.sy,dx=e.clientX-ptr.sx;
 if(dy>cell/DPR*2&&dt<260&&dy>Math.abs(dx)*1.5)hard();else if(!ptr.moved&&dt<350&&Math.hypot(dx,dy)<14)rotate(e.clientX<innerWidth*.3?-1:1);ptr=null});
// sound
const SND={move:()=>tone(220,0,.03,'square',.03),rot:()=>tone(440,0,.05,'square',.04,660),lock:()=>tone(110,0,.08,'triangle',.1),hard:()=>{tone(160,0,.12,'square',.08,60);noise(.08,.15,800)},
clear:()=>seq([523,659,784],.06,'square',.07),quad:()=>seq([523,659,784,1046,1318],.07,'square',.08),level:()=>seq([392,523,659,784,1046],.08,'triangle',.1),start:()=>seq([330,440,554],.08,'square',.06),over:()=>seq([392,330,262,196],.18,'triangle',.12)};
const MEL=[440,0,523,587,659,0,587,523,494,0,440,494,523,0,0,0,392,0,440,494,523,0,494,440,415,0,440,494,440,0,0,0];
MUSIC=i=>{const n=MEL[i%32];if(n)tone(n,0,.14,'square',.025);if(i%4==0)tone([110,98,87,82][Math.floor(i/8)%4],0,.3,'triangle',.06)};
// update/draw
function update(){if(state!='play')return;
 for(const a of['left','right','down'])if(held[a]){heldT[a]++;if(heldT[a]>DAS&&(heldT[a]-DAS)%ARR==0)act(a)}
 if(clearing){if(++clearT>14){for(const y of clearing){board.splice(y,1);board.unshift(Array(COLS).fill(0))}clearing=null;spawn(nextPiece())}return}
 if(fits(cur.k,cur.r,cur.x,cur.y+1)){if(++dropT>=gravF()){const n=Math.max(1,Math.floor(1/ gravF()));for(let i=0;i<n&&fits(cur.k,cur.r,cur.x,cur.y+1);i++)cur.y++;dropT=0;lockT=0}}
 else if(++lockT>=30)lock()}
function onResize(){const top=58*DPR,bot=76*DPR;cell=Math.floor(Math.min((H-top-bot-10*DPR)/20,W*.6/10));bx=Math.floor((W-COLS*cell)/2);by=top+Math.floor((H-top-bot-20*cell)/2)}
function blk(x,y,s,col,a){g.globalAlpha=a||1;g.fillStyle=col;g.fillRect(x,y,s,s);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x,y,s,s*.16);g.fillRect(x,y,s*.16,s);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x,y+s*.84,s,s*.16);g.fillRect(x+s*.84,y,s*.16,s);g.globalAlpha=1}
function mini(k,cx,cy,s){const m=MATS[k][0],w=m[0].length,hh=m.length;let mi=9,ma=-1;m.forEach((r,i)=>{if(r.some(v=>v)){mi=Math.min(mi,i);ma=Math.max(ma,i)}});const rows=ma-mi+1;
 for(let i=0;i<hh;i++)for(let j=0;j<w;j++)if(m[i][j])blk(cx-w*s/2+j*s,cy-rows*s/2+(i-mi)*s,s,COL[k])}
function draw(){g.fillStyle='#0b0d24';g.fillRect(0,0,W,H);
 for(let i=0;i<30;i++){g.fillStyle='rgba(120,140,255,.08)';g.fillRect((i*137+t*.3)%W,(i*91)%H,3*DPR,3*DPR)}
 if(!board){board=Array.from({length:ROWS},()=>Array(COLS).fill(0))}
 g.fillStyle='#14183c';g.fillRect(bx-4*DPR,by-4*DPR,COLS*cell+8*DPR,20*cell+8*DPR);g.strokeStyle='#5a6cf8';g.lineWidth=3*DPR;g.strokeRect(bx-4*DPR,by-4*DPR,COLS*cell+8*DPR,20*cell+8*DPR);
 g.strokeStyle='rgba(255,255,255,.05)';g.lineWidth=1;for(let i=1;i<COLS;i++){g.beginPath();g.moveTo(bx+i*cell,by);g.lineTo(bx+i*cell,by+20*cell);g.stroke()}for(let i=1;i<20;i++){g.beginPath();g.moveTo(bx,by+i*cell);g.lineTo(bx+COLS*cell,by+i*cell);g.stroke()}
 for(let y=HID;y<ROWS;y++)for(let x=0;x<COLS;x++)if(board[y][x]){const fl=clearing&&clearing.includes(y);blk(bx+x*cell,by+(y-HID)*cell,cell,fl&&t%4<2?'#fff':COL[board[y][x]])}
 if(state=='play'&&cur&&!clearing){const gy=ghostY(),m=MATS[cur.k][cur.r];for(let i=0;i<m.length;i++)for(let j=0;j<m[i].length;j++)if(m[i][j]){
   if(gy+i>=HID){g.strokeStyle=COL[cur.k];g.lineWidth=2*DPR;g.globalAlpha=.6;g.strokeRect(bx+(cur.x+j)*cell+2*DPR,by+(gy+i-HID)*cell+2*DPR,cell-4*DPR,cell-4*DPR);g.globalAlpha=1}
   if(cur.y+i>=HID)blk(bx+(cur.x+j)*cell,by+(cur.y+i-HID)*cell,cell,COL[cur.k])}}
 const pw=Math.min(bx-12*DPR,cell*4.2),ms=Math.min(cell*.55,pw/4.5);
 txt('HOLD',bx-pw/2-8*DPR,by+10*DPR,12*DPR,'#aab');g.strokeStyle='#5a6cf8';g.lineWidth=2*DPR;g.strokeRect(bx-pw-8*DPR,by+20*DPR,pw,ms*3.4);if(hold)mini(hold,bx-pw/2-8*DPR,by+20*DPR+ms*1.7,ms);if(hold&&!canHold){g.fillStyle='rgba(0,0,0,.5)';g.fillRect(bx-pw-8*DPR,by+20*DPR,pw,ms*3.4)}
 const nx=bx+COLS*cell+8*DPR;txt('NEXT',nx+pw/2,by+10*DPR,12*DPR,'#aab');g.strokeRect(nx,by+20*DPR,pw,ms*3.2*3+4*DPR);if(queue)for(let i=0;i<3&&i<queue.length;i++)mini(queue[i],nx+pw/2,by+20*DPR+ms*1.6+i*ms*3.2,ms);
 const sy=by+20*DPR+ms*3.6;[['SCORE',score],['LINES',lines||0],['LEVEL',level],['BEST',best]].forEach(([k,v],i)=>{txt(k,bx-pw/2-8*DPR,sy+i*40*DPR+10*DPR,11*DPR,'#aab');txt(''+v,bx-pw/2-8*DPR,sy+i*40*DPR+26*DPR,14*DPR,'#fff')});
 txt('BLOCK DROP',W/2,26*DPR,20*DPR,'#f8e03c','#3a49c8');
 if(msgT>0)txt(msg,W/2,by+6*cell,18*DPR,'#fff','#000');
 if(state=='title'){panel(H*.2,330*S);txt('BLOCK',W/2,H*.2+50*S,46*S,'#3ce0f0','#000');txt('DROP',W/2,H*.2+100*S,46*S,'#f8e03c','#000');
  ['Swipe ◀ ▶ to move','Tap to rotate (left edge: ⟲)','Drag ▼ soft drop · flick ▼ drop','Swipe ▲ to HOLD','Clear lines to level up!'].forEach((s,i)=>txt(s,W/2,H*.2+(150+i*26)*S,15*S,'#fff'));
  txt(`BEST ${best}`,W/2,H*.2+290*S,15*S,'#f89c2c');if(t%60<40)txt('TAP TO START',W/2,H*.2+370*S,22*S,'#fff','#000')}
 if(state=='over'){panel(H*.28,190*S);txt('GAME OVER',W/2,H*.28+40*S,32*S,'#f04c5c');txt(`SCORE ${score}`,W/2,H*.28+82*S,20*S,'#fff');txt(`LINES ${lines} · BEST ${best}`,W/2,H*.28+112*S,15*S,'#f8e03c');if(t-overT>40&&t%50<35)txt('TAP TO PLAY AGAIN',W/2,H*.28+154*S,16*S,'#3ce0f0')}}
function uiGame(play){$('bar').style.display=play?'flex':'none'}
