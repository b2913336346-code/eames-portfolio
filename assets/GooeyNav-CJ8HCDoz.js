import{r as S,j as _}from"./index-Chs3BRlF.js";const se=typeof window>"u"?S.useEffect:S.useLayoutEffect,re={dark:{"--gn-frame":"rgba(38, 35, 46, 0.66)","--gn-frame-edge":"rgba(255, 255, 255, 0.08)","--gn-frame-highlight":"rgba(255, 255, 255, 0.07)","--gn-frame-shadow":"0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)","--gn-ink":"#f4f4f5","--gn-muted":"rgba(244, 244, 245, 0.62)"},light:{"--gn-frame":"rgba(240, 240, 243, 0.8)","--gn-frame-edge":"rgba(24, 24, 27, 0.07)","--gn-frame-highlight":"rgba(255, 255, 255, 0.95)","--gn-frame-shadow":"0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)","--gn-ink":"#27272a","--gn-muted":"rgba(39, 39, 42, 0.62)"}},ut={dark:{color:"#f4f4f5",hover:"rgba(255, 255, 255, 0.08)",shadow:.4},light:{color:"#27272a",hover:"rgba(24, 24, 27, 0.06)",shadow:.2}},kt={sm:"gooey-nav--sm",md:"gooey-nav--md",lg:"gooey-nav--lg"},ie=[{label:"Home",href:"#"},{label:"Work",href:"#"},{label:"About",href:"#"},{label:"Contact",href:"#"}],H=32,tt=4,P=72,ce=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`,le=`#version 300 es
precision highp float;

uniform vec2 uSize;
uniform float uRatio;
uniform vec4 uPills[${tt}];
uniform vec4 uHover;
uniform vec4 uDrops[${H}];
uniform vec2 uTails[${H}];
uniform vec3 uTints[${H}];
uniform int uCount;
uniform float uSmooth;
uniform vec3 uPill;
uniform vec4 uHoverColor;
uniform float uShadow;

out vec4 outColor;

float sdPill(vec2 p, vec4 box) {
  vec2 extent = max(box.zw, vec2(0.0));
  float r = min(extent.x, extent.y);
  vec2 q = abs(p - box.xy) - extent + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

vec4 blend(vec4 a, vec4 b, float k) {
  float h = clamp(0.5 + 0.5 * (b.w - a.w) / k, 0.0, 1.0);
  return vec4(mix(b.rgb, a.rgb, h), mix(b.w, a.w, h) - k * h * (1.0 - h));
}

vec4 field(vec2 p) {
  vec4 shape = vec4(uPill, 1e5);
  for (int i = 0; i < ${tt}; i++) {
    vec4 pill = uPills[i];
    if (pill.z <= 0.0) continue;
    shape = blend(shape, vec4(uPill, sdPill(p, pill)), uSmooth);
  }
  for (int i = 0; i < ${H}; i++) {
    if (i >= uCount) break;
    vec4 drop = uDrops[i];
    if (drop.z <= 0.0) continue;
    float d = sdCapsule(p, drop.xy, drop.xy - uTails[i], drop.z);
    if (d > shape.w + uSmooth) continue;
    shape = blend(shape, vec4(uTints[i], d), uSmooth);
  }
  return shape;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uSize.y * uRatio - gl_FragCoord.y) / uRatio;
  vec4 shape = field(p);
  float d = shape.w;
  float aa = max(fwidth(d), 0.35);
  float body = clamp(0.5 - d / aa, 0.0, 1.0);

  vec2 grad = vec2(dFdx(d), -dFdy(d));
  vec2 n = length(grad) > 0.0001 ? normalize(grad) : vec2(0.0, 1.0);
  float rim = (1.0 - smoothstep(0.0, 1.6, -d)) * max(0.0, -n.y) * 0.3;
  vec3 fill = mix(shape.rgb, vec3(1.0), rim) * (1.0 - 0.06 * max(0.0, n.y) * (1.0 - smoothstep(0.0, 6.0, -d)));

  float lifted = field(p - vec2(0.0, 3.0)).w;
  float shadow = (1.0 - smoothstep(-3.0, 9.0, lifted)) * uShadow * (1.0 - body);

  float hover = clamp(0.5 - sdPill(p, uHover) / aa, 0.0, 1.0) * uHoverColor.a;

  vec4 color = vec4(0.0, 0.0, 0.0, shadow);
  color = vec4(uHoverColor.rgb * hover, hover) + color * (1.0 - hover);
  color = vec4(fill * body, body) + color * (1.0 - body);
  outColor = color;
}
`,mt=a=>{const l=/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(a).trim());if(l){const x=l[1].length===3?l[1].replace(/./g,r=>r+r):l[1];return[0,2,4].map(r=>parseInt(x.slice(r,r+2),16)/255).concat(1)}const R=/rgba?\(([^)]+)\)/i.exec(String(a));if(R){const x=R[1].split(",").map(r=>parseFloat(r));return[x[0]/255,x[1]/255,x[2]/255,x[3]??1]}return[1,1,1,1]},he=a=>.2126*a[0]+.7152*a[1]+.0722*a[2]>.55?"#18161d":"#ffffff",q=a=>Math.min(1,Math.max(0,a)),fe=a=>{const l=q(a);return l<.5?4*l*l*l:1-(-2*l+2)**3/2},Tt=(a,l,R,x,r)=>{const I=1-r;return I*I*I*a+3*I*I*r*l+3*I*r*r*R+r*r*r*x},ue=(a,l,R,x)=>{if(R<=.5||x<=.5)return"";const r=Math.min(R,x)/2;return`M${a+r},${l}H${a+R-r}A${r},${r} 0 0 1 ${a+R},${l+r}V${l+x-r}A${r},${r} 0 0 1 ${a+R-r},${l+x}H${a+r}A${r},${r} 0 0 1 ${a},${l+x-r}V${l+r}A${r},${r} 0 0 1 ${a+r},${l}Z`},Ct=(a,l,R)=>{const x=a.createShader(l);return a.shaderSource(x,R),a.compileShader(x),x},me=["uSize","uRatio","uPills","uHover","uDrops","uTails","uTints","uCount","uSmooth","uPill","uHoverColor","uShadow"],de=a=>{const l=a.createProgram();if(a.attachShader(l,Ct(a,a.VERTEX_SHADER,ce)),a.attachShader(l,Ct(a,a.FRAGMENT_SHADER,le)),a.linkProgram(l),!a.getProgramParameter(l,a.LINK_STATUS))return a.deleteProgram(l),null;const R=Object.fromEntries(me.map(r=>[r,a.getUniformLocation(l,r)])),x=a.createBuffer();return a.bindBuffer(a.ARRAY_BUFFER,x),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),a.STATIC_DRAW),{program:l,uniforms:R,buffer:x,position:a.getAttribLocation(l,"aPosition")}},ge=({items:a=ie,initialActiveIndex:l=0,activeIndex:R,onChange:x,theme:r="dark",color:I,activeTextColor:Nt,colors:jt=[],size:dt="md",frame:et=!0,animationTime:Ht=600,particleCount:It=15,timeVariance:Lt=300,spread:zt=56,gooeyness:pt=.5,wobble:Dt=.5,hoverEffect:Bt=!0,className:Ot="",style:qt})=>{const[Ut,Vt]=S.useState(l),D=Math.min(Math.max(0,R??Ut),Math.max(0,a.length-1)),gt=S.useRef(null),vt=S.useRef(null),xt=S.useRef(null),bt=S.useRef(null),yt=S.useRef(null),W=S.useRef(null),ot=S.useRef(D);ot.current=D;const U=r==="light"?"light":"dark",at=I||ut[U].color,Mt=mt(at),wt={animationTime:Ht,particleCount:It,timeVariance:Lt,spread:zt,gooeyness:pt,wobble:Dt,hoverEffect:Bt,pillRgb:Mt,tints:jt.map(mt),hoverRgb:mt(ut[U].hover),shadow:ut[U].shadow},V=S.useRef(wt);V.current=wt;const Gt=C=>{C!==D&&(R===void 0&&Vt(C),x?.(C,a[C]))};se(()=>{const C=gt.current,w=vt.current,A=xt.current,L=bt.current,N=yt.current;if(!C||!w||!A||!L||!N)return;const Y=window.matchMedia("(prefers-reduced-motion: reduce)").matches,d=w.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1}),B=d?de(d):null;N.style.display=B?"none":"block",w.style.display=B?"block":"none";const j={width:0,height:0};let F=[],E=-1;const k=new Map,T=[],h={x:0,y:0,w:0,h:0,alpha:0,index:-1},O=new Float32Array(tt*4),G=new Float32Array(H*4),nt=new Float32Array(H*2),K=new Float32Array(H*3);let Z=0,st=0,rt=!1;const it=()=>{const t=C.getBoundingClientRect(),p=Math.min(window.devicePixelRatio||1,2);j.width=t.width,j.height=t.height;const s=t.width+P*2,n=t.height+P*2;Object.assign(w.style,{left:`${-P}px`,top:`${-P}px`,width:`${s}px`,height:`${n}px`});const y=Math.max(1,Math.round(s*p)),v=Math.max(1,Math.round(n*p));(w.width!==y||w.height!==v)&&(w.width=y,w.height=v),F=Array.from(A.children).map(u=>{const m=u.getBoundingClientRect();return{x:m.left-t.left,y:m.top-t.top,w:m.width,h:m.height}})},Xt=(t,p,s)=>{const n=(u,m)=>{let b=1e5;const f=i=>{const g=q(.5+.5*(i-b)/s);b=i+(b-i)*g-s*g*(1-g)};for(const i of t){const g=Math.min(i.hw,i.hh),o=Math.abs(u-i.cx)-i.hw+g,M=Math.abs(m-i.cy)-i.hh+g;f(Math.hypot(Math.max(o,0),Math.max(M,0))+Math.min(Math.max(o,M),0)-g)}for(const i of p){const g=u-i.x,o=m-i.y,M=-i.tx,c=-i.ty,e=M*M+c*c,$=e>1e-4?q((g*M+o*c)/e):0,z=Math.hypot(g-M*$,o-c*$)-i.r;z>b+s||f(z)}return b},v=[];for(let u=0;u<j.height;u+=1){const m=u+.5;let b=n(0,m),f=b<0?0:null;for(let i=2;i<=j.width+2;i+=2){const g=n(Math.min(i,j.width),m);if(b<0!=g<0){const o=i-2+2*b/(b-g);g<0?f=o:f!==null&&(v.push(`M${f.toFixed(1)},${u}H${o.toFixed(1)}V${u+1}H${f.toFixed(1)}Z`),f=null)}b=g}f!==null&&v.push(`M${f.toFixed(1)},${u}H${j.width}V${u+1}H${f.toFixed(1)}Z`)}return v.join("")},ct=t=>(k.has(t)||k.set(t,{mass:0,scale:0,velocity:0,outgoing:0}),k.get(t)),$t=(t,p)=>{const s=F[t];if(!s||p<=.002)return null;const n=s.h*Math.min(1.08,.42+.58*Math.sqrt(Math.max(0,p))),y=Math.max(n,s.w*Math.max(0,p)**.75);return{x:s.x+s.w/2-y/2,y:s.y+s.h/2-n/2,w:y,h:n}},lt=(t,p,s,n)=>{const y=V.current,v=F[p];if(!v)return;const u=Math.max(0,y.spread),m=v.x+v.w/2+(Math.random()-.5)*v.w*.45,b=v.y+v.h/2+(Math.random()-.5)*v.h*.2,f=Math.max(.15,y.animationTime/1e3),i=(Math.random()-.5)*(Math.max(0,y.timeVariance)/1e3),g=Math.max(.15,f*(.62+Math.random()*.32)+i*.6),o=Math.random()*Math.PI*2,M=Math.random()*Math.PI*2,c=u*(.7+Math.random()*.6),e=u*(.55+Math.random()*.55),$=Math.min(g/3,.12);t.index=p,t.start=s,t.duration=g,t.path=[t.x,t.y,n?t.x+Math.cos(o)*c*1.6:t.x+t.vx*$,n?t.y+Math.sin(o)*c*1.6:t.y+t.vy*$,m+Math.cos(M)*e*1.5,b+Math.sin(M)*e*1.5,m,b]},Wt=(t,p,s)=>{const n=V.current,y=k.get(t),v=F[t];if(!y||!v||!F[p])return;const u=y.mass-y.outgoing;if(u<=.002)return;const m=H-T.length,b=Math.min(m,Math.max(1,Math.round(Math.max(1,n.particleCount)*u)));if(b<=0)return;const f=Math.max(.15,n.animationTime/1e3)*.16;for(let i=0;i<b;i++){const g=u/b;y.outgoing+=g,T.push({x:v.x+v.w/2+(Math.random()-.5)*v.w*.6,y:v.y+v.h/2+(Math.random()-.5)*v.h*.3,vx:0,vy:0,mass:g,size:.8+Math.random()*.4,given:0,source:t,index:p,leave:s+Math.random()*f*1e3,emerged:0,absorbed:0,state:"waiting",tint:n.tints.length?n.tints[Math.floor(Math.random()*n.tints.length)]:null})}},X=()=>{const t=V.current,p=F[E]?.h??F[0]?.h??36,s=p*(.18+.5*q(t.gooeyness)),n=[],y=[];for(const[o,M]of k){const c=$t(o,M.scale);c&&n.push({cx:c.x+c.w/2,cy:c.y+c.h/2,hw:c.w/2,hh:c.h/2})}for(const o of T){if(o.state==="waiting")continue;const M=.26*p*o.size*Math.min(o.emerged,1-o.absorbed);if(M<=.05)continue;const c=Math.hypot(o.vx,o.vy),e=Math.min(M*1.1,c*.018);y.push({x:o.x,y:o.y,r:M,tx:c>.01?o.vx/c*e:0,ty:c>.01?o.vy/c*e:0,tint:o.tint})}if(n.length===1&&!y.length){const o=n[0];L.style.clipPath=`path('${ue(o.cx-o.hw,o.cy-o.hh,o.hw*2,o.hh*2)}')`}else L.style.clipPath=`path('${Xt(n,y,s)||"M0,0Z"}')`;if(L.style.visibility="visible",!B||!d){const o=$t(E,1);o&&(N.style.transform=`translate(${o.x.toFixed(2)}px, ${o.y.toFixed(2)}px)`,N.style.width=`${o.w}px`,N.style.height=`${o.h}px`),N.style.opacity=o?"1":"0";return}let u=0;for(const o of n){if(u>=tt)break;O[u*4]=o.cx+P,O[u*4+1]=o.cy+P,O[u*4+2]=o.hw,O[u*4+3]=o.hh,u+=1}O.fill(0,u*4);let m=0;for(const o of y){if(m>=H)break;G[m*4]=o.x+P,G[m*4+1]=o.y+P,G[m*4+2]=o.r,G[m*4+3]=0,nt[m*2]=o.tx,nt[m*2+1]=o.ty;const M=o.tint||t.pillRgb;K[m*3]=M[0],K[m*3+1]=M[1],K[m*3+2]=M[2],m+=1}const{program:b,uniforms:f,buffer:i,position:g}=B;d.viewport(0,0,w.width,w.height),d.clearColor(0,0,0,0),d.clear(d.COLOR_BUFFER_BIT),d.useProgram(b),d.bindBuffer(d.ARRAY_BUFFER,i),d.enableVertexAttribArray(g),d.vertexAttribPointer(g,2,d.FLOAT,!1,0,0),d.uniform2f(f.uSize,j.width+P*2,j.height+P*2),d.uniform1f(f.uRatio,w.width/Math.max(1,j.width+P*2)),d.uniform4fv(f.uPills,O),d.uniform4f(f.uHover,h.x+P,h.y+P,h.w/2,h.h/2),d.uniform4fv(f.uDrops,G),d.uniform2fv(f.uTails,nt),d.uniform3fv(f.uTints,K),d.uniform1i(f.uCount,m),d.uniform1f(f.uSmooth,s),d.uniform3f(f.uPill,t.pillRgb[0],t.pillRgb[1],t.pillRgb[2]),d.uniform4f(f.uHoverColor,t.hoverRgb[0],t.hoverRgb[1],t.hoverRgb[2],t.hoverRgb[3]*h.alpha),d.uniform1f(f.uShadow,t.shadow),d.drawArrays(d.TRIANGLE_STRIP,0,4)},_t=t=>{Z=0;const p=V.current,s=Math.min(.05,(t-st)/1e3||0);st=t;const n=.09,y=.12;for(let c=T.length-1;c>=0;c--){const e=T[c];if(e.state==="waiting"){if(t<e.leave)continue;e.state="flying",lt(e,e.index,t,!0)}if(e.state==="flying"){e.emerged=Math.min(1,e.emerged+s/n);const $=k.get(e.source);if($&&e.given<e.mass){const ft=Math.min(e.mass*(s/n),e.mass-e.given);$.mass=Math.max(0,$.mass-ft),$.outgoing=Math.max(0,$.outgoing-ft),e.given+=ft}const z=q((t-e.start)/1e3/e.duration),St=fe(z),[Kt,Jt,Qt,te,ee,oe,ae,ne]=e.path,Ft=Tt(Kt,Qt,ee,ae,St),Et=Tt(Jt,te,oe,ne,St);s>0&&(e.vx=(Ft-e.x)/s,e.vy=(Et-e.y)/s),e.x=Ft,e.y=Et,z>=1&&(e.state="absorbing")}if(e.state==="absorbing"){const $=Math.min(1-e.absorbed,s/y);e.absorbed+=$,e.vx*=.8,e.vy*=.8;const z=ct(e.index);z.mass=Math.min(1,z.mass+e.mass*$),e.absorbed>=1&&T.splice(c,1)}}const v=Y?1:1-.72*q(p.wobble),u=26,m=Math.max(1,Math.ceil(s/(1/240))),b=s/m;for(const[c,e]of k){for(let $=0;$<m;$++)e.velocity+=(u*u*(e.mass-e.scale)-2*v*u*e.velocity)*b,e.scale+=e.velocity*b;c!==E&&e.mass<=.002&&e.outgoing<=.002&&Math.abs(e.scale)<.004&&k.delete(c)}if(h.index>=0&&F[h.index]){const c=F[h.index],e=1-Math.exp(-s/.06);h.x+=(c.x+c.w/2-h.x)*e,h.y+=(c.y+c.h/2-h.y)*e,h.w+=(c.w-h.w)*e,h.h+=(c.h-h.h)*e}const f=p.hoverEffect&&h.index>=0&&h.index!==E?1:0;h.alpha+=(f-h.alpha)*(1-Math.exp(-s/.08)),X();const i=k.get(E),g=T.length===0&&k.size===1&&i&&Math.abs(i.mass-i.scale)<8e-4&&Math.abs(i.velocity)<.004,o=F[h.index],M=Math.abs(f-h.alpha)>.003||o&&Math.abs(o.x+o.w/2-h.x)+Math.abs(o.w-h.w)>.1;!g||M?Z=requestAnimationFrame(_t):(i.mass=1,i.scale=1,i.velocity=0,h.alpha=f,X())},J=()=>{Z||rt||(st=performance.now(),Z=requestAnimationFrame(_t))},Q=t=>{k.clear(),T.length=0,E=t;const p=ct(t);p.mass=1,p.scale=1,p.velocity=0,X()},Yt=(t,p)=>{if(t===E)return;if(!F[t]||Y||E<0){Q(t);return}const s=performance.now();E=t,ct(t);for(const n of T)n.index=t,n.state==="flying"&&lt(n,t,s,!1),n.state==="absorbing"&&(n.state="flying",n.mass*=1-n.absorbed,n.absorbed=0,lt(n,t,s,!1));for(const n of[...k.keys()])n!==t&&Wt(n,t,s);J()},At=t=>{const p=t.target.closest("[data-gooey-index]");if(!p||!A.contains(p))return;const s=Number(p.dataset.gooeyIndex),n=F[s];n&&(h.alpha<.01&&(h.x=n.x+n.w/2,h.y=n.y+n.h/2,h.w=n.w,h.h=n.h),h.index=s,J())},Pt=()=>{h.index=-1,J()},ht=new ResizeObserver(()=>{it(),T.length?X():Q(E<0?ot.current:E)});return ht.observe(C),ht.observe(A),A.addEventListener("pointerover",At),A.addEventListener("pointerleave",Pt),it(),Q(ot.current),document.fonts?.ready.then(()=>{rt||(it(),T.length||Q(E))}),W.current={go:t=>Yt(t),refresh:()=>{X(),J()}},()=>{rt=!0,cancelAnimationFrame(Z),ht.disconnect(),A.removeEventListener("pointerover",At),A.removeEventListener("pointerleave",Pt),d&&B&&(d.deleteBuffer(B.buffer),d.deleteProgram(B.program)),W.current=null}},[a.length]),S.useEffect(()=>{W.current?.go(D)},[D]),S.useEffect(()=>{W.current?.refresh()},[at,U,pt,dt,et]);const Zt=Nt||he(Mt),Rt=C=>a.map((w,A)=>{const L=_.jsxs(_.Fragment,{children:[w.icon&&_.jsx("span",{className:"gooey-nav__icon",children:w.icon}),w.label&&_.jsx("span",{className:"gooey-nav__label",children:w.label})]});if(!C)return _.jsx("li",{className:"gooey-nav__item",children:_.jsx("span",{className:"gooey-nav__link",children:L})},A);const N={className:"gooey-nav__link","aria-current":A===D?"page":void 0,onClick:Y=>{(!w.href||w.href==="#")&&Y.preventDefault(),Gt(A)}};return _.jsx("li",{className:"gooey-nav__item","data-gooey-index":A,"data-active":A===D?"":void 0,children:w.href?_.jsx("a",{href:w.href,...N,children:L}):_.jsx("button",{type:"button",...N,children:L})},A)});return _.jsxs("nav",{className:`gooey-nav ${kt[dt]??kt.md}${et?" gooey-nav--framed":""} ${Ot}`.trim(),style:{...re[U],"--gn-pill":at,"--gn-active-ink":Zt,...qt},children:[et&&_.jsx("span",{className:"gooey-nav__rim"}),_.jsxs("div",{ref:gt,className:"gooey-nav__stage",children:[_.jsx("canvas",{ref:vt,className:"gooey-nav__canvas","aria-hidden":"true"}),_.jsx("span",{ref:yt,className:"gooey-nav__fallback","aria-hidden":"true"}),_.jsx("ul",{ref:xt,className:"gooey-nav__list",children:Rt(!0)}),_.jsx("ul",{ref:bt,className:"gooey-nav__list gooey-nav__list--active","aria-hidden":"true",children:Rt(!1)})]})]})};export{ge as default};
