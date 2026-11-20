import{r as L,j as me}from"./index-DvQgW6NY.js";const de=8,X=4,He=2.2,qe=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ue=`#version 300 es
precision highp float;
precision highp int;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uGloss;
uniform float uDepth;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uStarGlow;
uniform float uFlareGain;
uniform float uSquash;
uniform float uSaturation;
uniform float uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationAngle;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform int uLayers;
uniform vec3 uColors[${X}];
uniform int uColorCount;
uniform float uWarp;
uniform float uReveal;
uniform float uMode;
uniform vec3 uBackground;
uniform float uOpacity;
out vec4 outColor;

#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare, vec2 radial, float invReach) {
#ifdef WARP
  float along = dot(uv, radial);
  float d = sqrt(max(dot(uv, uv) - uSquash * along * along, 0.0));
#else
  float d = length(uv);
#endif
  float m = uStarGlow / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uFlareGain;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uFlareGain;
  m *= smoothstep(1.0, 0.2, d * invReach);
#ifdef WARP
  m *= mix(1.0, smoothstep(1.0, 0.55, length(uv) * invReach), min(uWarp * 4.0, 1.0));
#endif
  return m;
}

vec3 StarLayer(vec2 uv, vec2 radial, vec2 repelAt, float pushCells, float spread) {
  vec3 col = vec3(0.0);
  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + offset;
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uGloss / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

#ifdef PALETTE
      float pick = Hash21(si + 7.0) * float(uColorCount);
      vec3 base = uColors[int(min(floor(pick), float(uColorCount - 1)))];
#else
      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));
#endif

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;
      vec2 shift = vec2(0.0);
      float invReach = 1.0;
#ifdef REPEL
      vec2 away = si + 0.5 + pad - repelAt;
      float dist = length(away);
      float q = dist * spread;
      float cells = pushCells * exp(-q * q);
      float moved = cells * inversesqrt(1.0 + cells * cells * 2.78);
      shift = away * (moved / max(dist, 0.0001));
      invReach = 1.0 / (1.0 - moved);
#endif
      float star = Star(gv - offset - pad - shift, flareSize, radial, invReach);
      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      col += star * twinkle * size * base;
    }
  }
  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution;
  vec2 uv = (gl_FragCoord.xy - focalPx) / uResolution.y;
  vec2 mouseNorm = uMouse - vec2(0.5);

  vec2 repelAt = vec2(0.0);
  float strength = 0.0;
  float push = 0.0;
  if (uAutoCenterRepulsion > 0.0) {
    strength = uAutoCenterRepulsion;
    push = strength * 0.05;
  } else if (uMouseRepulsion > 0.5) {
    repelAt = (uMouse * uResolution - focalPx) / uResolution.y;
    strength = max(uRepulsionStrength, 0.0);
    push = strength * 0.05 * uMouseActiveFactor;
  } else {
    uv += mouseNorm * 0.1 * uMouseActiveFactor;
  }
  float radius = 0.16 + 0.04 * strength;

  vec2 radial = length(uv) > 0.0001 ? normalize(uv) : vec2(1.0, 0.0);
  float angle = uRotationAngle;
  uv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * uv;
  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;
  radial = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * radial;
  radial = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * radial;
  repelAt = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * repelAt;
  repelAt = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * repelAt;

  vec3 col = vec3(0.0);
  float layers = float(uLayers);
  for (int k = 0; k < ${de}; k++) {
    if (k >= uLayers) break;
    float i = float(k) / layers;
    float depth = fract(i + uDepth);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    vec2 offset = vec2(i * 453.32);
    col += StarLayer(uv * scale + offset, radial, repelAt * scale + offset, push * scale, 1.0 / (scale * radius)) * fade;
  }
  col *= uReveal;

  if (uMode > 1.5) {
    vec3 lit = col * smoothstep(0.0, 0.3, length(col));
    float energy = max(max(lit.r, lit.g), lit.b);
    vec3 tint = lit / max(energy, 0.0001);
    vec3 ink = tint * (0.16 / max(dot(tint, vec3(0.2126, 0.7152, 0.0722)), 0.16));
    float coverage = pow(min(energy * 1.3, 1.0), 1.3) * 0.92 * uOpacity;
    outColor = uMode > 2.5 ? vec4(ink * coverage, coverage) : vec4(mix(uBackground, ink, coverage), 1.0);
  } else if (uMode > 0.5) {
    float alpha = min(smoothstep(0.0, 0.3, length(col)), 1.0) * uOpacity;
    outColor = vec4(col * alpha, alpha);
  } else {
    outColor = vec4(mix(uBackground, col, uOpacity), 1.0);
  }
}`,z=(a,u,d)=>Math.min(d,Math.max(u,a)),We=(a,u,d)=>(a?4:0)+(u?2:0)+(d?1:0),Ne=(a,u,d,k)=>{const R=`${u?`#define PALETTE
`:""}${d?`#define REPEL
`:""}${k?`#define WARP
`:""}`,f=a.createProgram(),x=a.createShader(a.VERTEX_SHADER),y=a.createShader(a.FRAGMENT_SHADER);return!f||!x||!y?null:(a.shaderSource(x,qe),a.shaderSource(y,Ue.replace(`
`,`
${R}`)),a.compileShader(x),a.compileShader(y),a.attachShader(f,x),a.attachShader(f,y),a.bindAttribLocation(f,0,"aPosition"),a.linkProgram(f),a.deleteShader(x),a.deleteShader(y),f)},Ve=(a,u)=>{if(!a.getProgramParameter(u,a.LINK_STATUS))return null;const d={},k=a.getProgramParameter(u,a.ACTIVE_UNIFORMS);for(let R=0;R<k;R++){const f=a.getActiveUniform(u,R);f&&(d[f.name.replace("[0]","")]=a.getUniformLocation(u,f.name))}return{program:u,uniforms:d}},$e=({focal:a=[.5,.5],rotation:u=[1,0],starSpeed:d=.5,density:k=1,hueShift:R=140,disableAnimation:f=!1,speed:x=1,mouseInteraction:y=!0,glowIntensity:ve=.3,saturation:he=0,mouseRepulsion:pe=!0,repulsionStrength:ge=2,twinkleIntensity:Re=.3,rotationSpeed:xe=.1,autoCenterRepulsion:ye=0,transparent:Ae=!0,lightMode:be=!1,starColors:j,starSize:we=1,flareIntensity:Se=1,layers:Me=4,direction:Ee="forward",clickWarp:Ce=!0,intro:Te=!0,backgroundColor:Le,opacity:ke=1,dpr:Fe,pixelBudget:Pe,frameRate:Oe,className:Y="",style:_e,...Ie})=>{const J=L.useRef(null),Q=L.useRef(null),H=L.useRef(null),De=Array.isArray(j)?j.filter(Boolean).slice(0,X):[],Z={focal:Array.isArray(a)?a:[.5,.5],rotation:Array.isArray(u)?u:[1,0],starSpeed:d,density:Math.max(.01,k),hueShift:R,disableAnimation:f,speed:x,mouseInteraction:y,glowIntensity:Math.max(0,ve),saturation:Math.max(0,he),mouseRepulsion:pe,repulsionStrength:ge,twinkleIntensity:z(Re,0,1),rotationSpeed:xe,autoCenterRepulsion:Math.max(0,ye),transparent:Ae,lightMode:be,palette:De,starSize:Math.max(0,we),flareIntensity:Math.max(0,Se),layers:z(Math.round(Me),2,de),reverse:Ee==="backward",clickWarp:Ce,intro:Te,backgroundColor:Le,opacity:z(ke,0,1),dpr:Fe,pixelBudget:Pe,frameRate:Oe},p=L.useRef(Z);return p.current=Z,L.useEffect(()=>{const S=J.current,c=Q.current,t=c?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!S||!c||!t)return;const ee=t.getExtension("KHR_parallel_shader_compile"),O=new Map,_=(e,n,l)=>{const s=We(e,n,l);let i=O.get(s);return i||(i={program:Ne(t,e,n,l),linked:null,done:!1},O.set(s,i)),i},q=(e,n,l,s)=>{const i=_(e,n,l);if(!i.done&&i.program){if(!s&&ee&&!t.getProgramParameter(i.program,ee.COMPLETION_STATUS_KHR))return null;i.linked=Ve(t,i.program),i.done=!0}return i.linked},h=p.current;if(!q(h.palette.length>0,!1,!1,!0)){O.forEach(e=>e.program&&t.deleteProgram(e.program));return}const te=t.createBuffer(),U=t.createVertexArray();t.bindVertexArray(U),t.bindBuffer(t.ARRAY_BUFFER,te),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0);const M=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),E=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,W=new Map,oe=(e,n)=>{if(!e)return n;const l=String(e);if(W.has(l))return W.get(l);let s=n;if(M){M.clearRect(0,0,1,1),M.fillStyle="#000000",M.fillStyle=l,M.fillRect(0,0,1,1);const[i,v,m]=M.getImageData(0,0,1,1).data;s=[i/255,v/255,m/255]}return W.set(l,s),s},ne=new Float32Array(X*3),g={x:.5,y:.5,inside:!1},o={time:0,gloss:0,depth:0,angle:0,mx:.5,my:.5,active:0,boost:0,reveal:p.current.intro&&!E?0:1};let A=0,C=0,T=0,F=null,I=!0;const Be=()=>{const e=p.current;e.palette.forEach((Ge,ze)=>ne.set(oe(Ge,[1,1,1]),ze*3));const n=e.lightMode?e.transparent?3:2:e.transparent?1:0,l=oe(e.backgroundColor,e.lightMode?[1,1,1]:[0,0,0]),s=o.reveal,i=e.palette.length>0,v=e.autoCenterRepulsion>0||e.mouseRepulsion&&e.repulsionStrength>0&&o.active>0,m=o.boost>0,P=q(i,!1,!1,!0);if(!P)return;const w=(v||m?q(i,v,m,!1):null)??P,r=w.uniforms;t.viewport(0,0,c.width,c.height),t.useProgram(w.program),t.bindVertexArray(U),t.uniform1f(r.uTime,o.time),t.uniform2f(r.uResolution,c.width,c.height),t.uniform2f(r.uFocal,e.focal[0],e.focal[1]),t.uniform2f(r.uRotation,e.rotation[0],e.rotation[1]),t.uniform1f(r.uGloss,o.gloss),t.uniform1f(r.uDepth,o.depth),t.uniform1f(r.uDensity,e.density),t.uniform1f(r.uHueShift,e.hueShift),t.uniform1f(r.uSpeed,e.speed),t.uniform2f(r.uMouse,o.mx,o.my);const K=1+o.boost*5;t.uniform1f(r.uStarGlow,.05*e.glowIntensity*e.starSize/Math.pow(K,.6)),t.uniform1f(r.uFlareGain,e.glowIntensity*e.flareIntensity),t.uniform1f(r.uSquash,1-1/(K*K)),t.uniform1f(r.uSaturation,e.saturation),t.uniform1f(r.uMouseRepulsion,e.mouseRepulsion?1:0),t.uniform1f(r.uTwinkleIntensity,e.twinkleIntensity),t.uniform1f(r.uRotationAngle,o.angle),t.uniform1f(r.uRepulsionStrength,e.repulsionStrength),t.uniform1f(r.uMouseActiveFactor,o.active),t.uniform1f(r.uAutoCenterRepulsion,e.autoCenterRepulsion),t.uniform1i(r.uLayers,e.layers),t.uniform3fv(r.uColors,ne),t.uniform1i(r.uColorCount,e.palette.length),t.uniform1f(r.uWarp,o.boost);const $=Math.min(1,s/.35);t.uniform1f(r.uReveal,$*$*(3-2*$)),t.uniform1f(r.uMode,n),t.uniform3fv(r.uBackground,l),t.uniform1f(r.uOpacity,e.opacity),t.drawArrays(t.TRIANGLES,0,3)},ae=e=>{if(A=0,!I||document.hidden)return;const n=p.current,l=n.frameRate>0?1e3/n.frameRate:0;if(l&&e+.75<T){b();return}T=l?Math.max(T+l,e+l/2):0,F&&(re(F),F=null);const s=C?z((e-C)/1e3,5e-4,.1):1/60;C=e;const i=n.disableAnimation||E?0:1;n.intro&&!E&&o.reveal<1?(o.reveal=Math.min(1,o.reveal+s/He),o.boost=Math.max(o.boost,Math.pow(1-o.reveal,2)*1.4)):(!n.intro||E)&&(o.reveal=1);const v=n.starSpeed/10*(n.reverse?-1:1);o.time+=s*i,o.gloss+=s*v*i,o.depth+=s*v*n.speed*i*(1+o.boost*14),o.angle+=s*n.rotationSpeed*i,o.boost*=Math.exp(-s*1.3),o.boost<.001&&(o.boost=0);const m=1-Math.exp(-s/.325),P=n.mouseInteraction&&g.inside&&!E;P&&(o.mx+=(g.x-o.mx)*m,o.my+=(g.y-o.my)*m);const w=P?1:0;o.active+=(w-o.active)*m,Math.abs(w-o.active)<.001&&(o.active=w),Be(),i>0||o.boost>0||o.active!==w||o.reveal<1?A=requestAnimationFrame(ae):C=0},b=()=>{!A&&I&&!document.hidden&&(A=requestAnimationFrame(ae))},N=()=>{const e=p.current,n=Math.max(1,S.clientWidth),l=Math.max(1,S.clientHeight),s=e.pixelBudget>0?Math.sqrt(e.pixelBudget/(n*l)):2,i=Math.min(e.dpr||window.devicePixelRatio||1,2,s),v=Math.max(1,Math.floor(n*i)),m=Math.max(1,Math.floor(l*i));(c.width!==v||!c.hasAttribute("width"))&&(c.width=v),(c.height!==m||!c.hasAttribute("height"))&&(c.height=m),b()},re=e=>{const n=S.getBoundingClientRect(),l=e.clientX-n.left,s=e.clientY-n.top;g.inside=l>=0&&s>=0&&l<=n.width&&s<=n.height,g.x=l/Math.max(1,n.width),g.y=1-s/Math.max(1,n.height)},ie=e=>{e.pointerType!=="touch"&&(F=e,b())},se=e=>{const n=p.current;re(e),!(!g.inside||!n.clickWarp||E)&&(o.boost=Math.min(1.6,o.boost+1),b())},D=e=>{e.pointerType!=="mouse"&&B()},B=()=>{F=null,g.inside=!1},le=()=>{if(C=0,T=0,document.hidden){cancelAnimationFrame(A),A=0,B();return}b()},ue=new ResizeObserver(N);ue.observe(S);const ce=new IntersectionObserver(e=>{I=e.some(n=>n.isIntersecting),I&&(C=0,T=0,b())});ce.observe(S),window.addEventListener("pointermove",ie,{passive:!0}),window.addEventListener("pointerdown",se,{passive:!0}),window.addEventListener("pointerup",D,{passive:!0}),window.addEventListener("pointercancel",D,{passive:!0}),document.documentElement.addEventListener("pointerleave",B),document.addEventListener("visibilitychange",le),N();const fe=h.autoCenterRepulsion>0||h.mouseInteraction&&h.mouseRepulsion,V=h.palette.length>0;(h.clickWarp||h.intro)&&_(V,!1,!0),fe&&_(V,!0,!1),fe&&h.clickWarp&&_(V,!0,!0);let G=h;return H.current=()=>{const e=p.current,n=e.dpr!==G.dpr||e.pixelBudget!==G.pixelBudget;if(e.frameRate!==G.frameRate&&(T=0),G=e,n){N();return}b()},()=>{cancelAnimationFrame(A),H.current=null,ue.disconnect(),ce.disconnect(),window.removeEventListener("pointermove",ie),window.removeEventListener("pointerdown",se),window.removeEventListener("pointerup",D),window.removeEventListener("pointercancel",D),document.documentElement.removeEventListener("pointerleave",B),document.removeEventListener("visibilitychange",le),O.forEach(e=>e.program&&t.deleteProgram(e.program)),t.deleteBuffer(te),t.deleteVertexArray(U),c.isConnected||t.getExtension("WEBGL_lose_context")?.loseContext()}},[]),L.useEffect(()=>{H.current?.()}),me.jsx("div",{ref:J,className:`galaxy-container${Y?` ${Y}`:""}`,style:_e,...Ie,children:me.jsx("canvas",{ref:Q,className:"galaxy-canvas","aria-hidden":"true"})})};export{$e as default};
