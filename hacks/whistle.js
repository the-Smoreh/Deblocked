(()=>{

if(window.__dogwhistle)return;
window.__dogwhistle=!0;

const S=document.createElement("style");
S.textContent=`#dwpp_ui{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(20,20,38,.93);backdrop-filter:blur(16px);border-radius:18px;box-shadow:0 10px 40px rgba(0,0,0,.5),0 0 30px rgba(0,255,255,.18);padding:18px 20px;min-width:320px;max-width:95vw;color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;text-align:center;z-index:2147483000;overflow:hidden;user-select:none}#dwpp_ui.hidden{opacity:0;transform:translate(-50%,-50%) scale(.9);pointer-events:none;transition:opacity .25s,transform .25s}#dwpp_bg{position:absolute;inset:0;z-index:0;opacity:.3;pointer-events:none;mix-blend-mode:screen}#dwpp_content{position:relative;z-index:1}#dwpp_ui header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;cursor:move}#dwpp_ui h1{font-size:18px;margin:0;display:flex;gap:8px;align-items:center}#dwpp_ui h1:before{content:"";width:12px;height:12px;border-radius:50%;background:linear-gradient(135deg,#00f6ff,#9d00ff);box-shadow:0 0 10px #00f6ff}#dwpp_titlegrad{background:linear-gradient(90deg,#00f6ff,#9d00ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}#dwpp_note,#dwpp_risk{font-size:13px;margin:2px 0;min-height:18px;opacity:.92}#dwpp_risk{font-weight:700}#dwpp_ui .actions button{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;transition:transform .15s}#dwpp_ui .actions button:hover{transform:scale(1.15)}#dwpp_freqs{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px}#dwpp_freqs button{padding:7px 14px;border:none;border-radius:12px;background:linear-gradient(135deg,rgba(0,255,255,.22),rgba(157,0,255,.22));box-shadow:inset 0 0 0 1px rgba(255,255,255,.08),0 6px 16px rgba(0,0,0,.25);color:#fff;font-size:13px;cursor:pointer;transition:transform .12s,box-shadow .2s,background .2s}#dwpp_freqs button:hover{transform:translateY(-1px);background:linear-gradient(135deg,rgba(0,255,255,.3),rgba(157,0,255,.3))}#dwpp_freqs button.active{background:linear-gradient(135deg,#00f6ff,#9d00ff);box-shadow:0 0 22px rgba(0,255,255,.6)}small{display:block;margin-top:8px;opacity:.7;font-size:12px}/* --- HUD --- */#dwpp_hud{position:fixed;right:24px;bottom:32px;display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:16px;background:rgba(255,255,255,.55);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);z-index:2147483600;opacity:0;pointer-events:none;transition:opacity .25s ease}#dwpp_hud.show{opacity:1}#dwpp_hud .ic{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#a3d0ff;color:#0b3b7a;font-size:15px;flex-shrink:0}#dwpp_hud .ic.muted{background:#d7d7d7;color:#666}#dwpp_hud .track{position:relative;width:180px;height:3px;border-radius:2px;background:rgba(0,0,0,.15);overflow:hidden}#dwpp_hud .fill{height:100%;width:60%;background:#1a73e8;transition:width .2s ease-in-out,background .15s ease}#dwpp_hud .fill.muted{background:#a0a0a0}#dwpp_hud .dot{position:absolute;top:50%;transform:translate(-50%,-50%);width:8px;height:8px;border-radius:50%;background:#1a73e8;transition:left .2s ease-in-out}#dwpp_hud .dot.muted{background:#999}#dwpp_hud .chev{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.1);color:#444;font-size:13px}`;
document.body.appendChild(S);

/* --- main UI --- */
const U=document.createElement("div");
U.id="dwpp_ui";
U.innerHTML=`<canvas id="dwpp_bg"></canvas><div id="dwpp_content"><header><h1><span id="dwpp_titlegrad">Dog Whistle++</span></h1><div class="actions"><button id="dwpp_min">➖</button><button id="dwpp_close">✖</button></div></header><div id="dwpp_note"></div><div id="dwpp_risk"></div><div id="dwpp_freqs"></div><small>Ctrl + X to hide/show · + / - to adjust volume HUD</small></div>`;
document.body.appendChild(U);

const cv=U.querySelector("#dwpp_bg"),cx=cv.getContext("2d"),note=U.querySelector("#dwpp_note"),risk=U.querySelector("#dwpp_risk");

const freqs=[
{hz:12000,txt:"1",risk:"🔴 Very High – easily heard",rc:"#ff7070"},
{hz:14000,txt:"2",risk:"🟠 High – noticeable to many adults",rc:"#ffaa47"},
{hz:16000,txt:"3",risk:"🟡 Medium – ALOT of people detect",rc:"#ffd84d"},
{hz:17000,txt:"4",risk:"🟢 Low – CAN be Heard",rc:"#78ff9c"},
{hz:18000,txt:"5",risk:"🟢 Very Low – Not Hearable to Many",rc:"#66ffc4"},
{hz:19000,txt:"6",risk:"🟢 Very Low – stealthy",rc:"#66ffc4"},
{hz:20000,txt:"7",risk:"🟣 Minimal – near ultrasonic",rc:"#a39dff"},
{hz:21000,txt:"8",risk:"🟣 Stealth – ultrasonic edge",rc:"#a39dff"},
{hz:22000,txt:"9",risk:"⚫ Silent – beyond human range",rc:"#9aa0a6"}
];

const F=U.querySelector("#dwpp_freqs");
let AC=null,OSC=null,GAIN=null,PLAY=null,RAF=null,LH=17000;

function sizeCanvas(){
  cv.width=Math.max(320,Math.min(880,U.clientWidth));
  cv.height=Math.max(100,Math.min(190,Math.round(U.clientHeight*.45)));
}
sizeCanvas();
new ResizeObserver(sizeCanvas).observe(U);

function drawWave(){
  let t=0;
  cancelAnimationFrame(RAF);
  (function loop(){
    cx.clearRect(0,0,cv.width,cv.height);
    const hz=PLAY||LH||17000;
    const norm=(hz-12000)/10000;
    const cycles=3+norm*12;
    const amp=(5+norm*18);
    const spike=1+norm*2;
    const mid=cv.height/2;
    cx.beginPath();
    for(let x=0;x<=cv.width;x++){
      const y=mid+Math.sin((x/cv.width)*cycles*2*Math.PI + t)*amp*Math.sin((x/cv.width)*spike*Math.PI*2);
      x===0?cx.moveTo(x,y):cx.lineTo(x,y);
    }
    cx.strokeStyle="rgba(0,255,255,.8)";
    cx.lineWidth=2;
    cx.shadowColor="rgba(0,255,255,.3)";
    cx.shadowBlur=8;
    cx.stroke();
    t+=.05+(hz-12000)/200000;
    RAF=requestAnimationFrame(loop);
  })();
}
drawWave();

function play(hz){
  stop();
  try{
    AC=new(window.AudioContext||window.webkitAudioContext)();
    OSC=AC.createOscillator();
    GAIN=AC.createGain();
    GAIN.gain.value=.15;
    OSC.type="sine";
    OSC.frequency.value=hz;
    OSC.connect(GAIN);
    GAIN.connect(AC.destination);
    OSC.start();
    PLAY=hz;
    LH=hz;
  }catch(e){}
}
function stop(){
  if(OSC){OSC.stop();OSC.disconnect();OSC=null}
  if(GAIN){GAIN.disconnect();GAIN=null}
  if(AC){AC.close();AC=null}
  PLAY=null;
  F.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
}
freqs.forEach(f=>{
  const b=document.createElement("button");
  b.textContent=f.hz+" Hz";
  b.title=f.txt;
  F.appendChild(b);
  b.onmouseenter=()=>{
    note.textContent="Note: "+f.txt;
    risk.textContent="Detection Risk: "+f.risk;
    risk.style.color=f.rc;
  };
  b.onclick=()=>{
    PLAY===f.hz?stop():(stop(),play(f.hz),setActive(b));
  };
});
function setActive(b){
  F.querySelectorAll("button").forEach(x=>x.classList.remove("active"));
  b.classList.add("active");
}

/* draggable window */
(function(e){
  let a=0,b=0,c=0,d=0;
  const h=e.querySelector("header");
  function m(ev){ev.preventDefault();c=ev.clientX;d=ev.clientY;document.onmouseup=x;document.onmousemove=y}
  function y(ev){ev.preventDefault();a=c-ev.clientX;b=d-ev.clientY;c=ev.clientX;d=ev.clientY;e.style.top=e.offsetTop-b+"px";e.style.left=e.offsetLeft-a+"px";e.style.transform="translate(0,0)"}
  function x(){document.onmouseup=null;document.onmousemove=null}
  h.onmousedown=m;
})(U);

U.querySelector("#dwpp_close").onclick=()=>{
  stop();cancelAnimationFrame(RAF);U.remove();S.remove();window.__dogwhistle=!1;
};
U.querySelector("#dwpp_min").onclick=()=>U.classList.toggle("hidden");
document.addEventListener("keydown",e=>{if(e.ctrlKey&&"x"===e.key.toLowerCase())U.classList.toggle("hidden")});

/* HUD */
if(!document.getElementById("dwpp_hud")){
  let VOL=70,T;
  const H=document.createElement("div");
  H.id="dwpp_hud";
  H.innerHTML=`<div class="ic" id="dwpp_hic">🔊</div><div class="track"><div class="fill" id="dwpp_hfill"></div><div class="dot" id="dwpp_hdot"></div></div><div class="chev">›</div>`;
  document.body.appendChild(H);
  const I=H.querySelector("#dwpp_hic"),FILL=H.querySelector("#dwpp_hfill"),DOT=H.querySelector("#dwpp_hdot");
  function show(){H.classList.add("show");clearTimeout(T);T=setTimeout(()=>H.classList.remove("show"),5000)}
  function update(){
    FILL.style.width=VOL+"%";
    DOT.style.left=VOL+"%";
    if(VOL<=0){I.textContent="🔇";I.classList.add("muted");FILL.classList.add("muted");DOT.classList.add("muted")}
    else if(VOL<40){I.textContent="🔉";I.classList.remove("muted");FILL.classList.remove("muted");DOT.classList.remove("muted")}
    else{I.textContent="🔊";I.classList.remove("muted");FILL.classList.remove("muted");DOT.classList.remove("muted")}
  }
  document.addEventListener("keydown",e=>{
    if(e.key==="+"||e.key==="="){VOL=Math.min(100,VOL+5);update();show()}
    else if(e.key==="-"||e.key==="_"){VOL=Math.max(0,VOL-5);update();show()}
  });
  update();
}

})();
