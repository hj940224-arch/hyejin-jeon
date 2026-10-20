/* Animate the existing ocean photograph; typography stays on separate HTML layers. */
(()=>{
 const host=document.querySelector('.hero-visual'),image=host?.querySelector('.design-image');
 if(!host||!image)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canvas=document.createElement('canvas');canvas.className='ocean-motion';canvas.setAttribute('aria-hidden','true');
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});if(!gl)return;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
 let program;
 try{
 program=gl.createProgram();
 gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}'));
 gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
 precision mediump float;
 varying vec2 uv;uniform sampler2D photo;uniform float time;uniform vec2 cover;
 void main(){
  vec2 q=uv;float t=time;
  float broad=sin(q.y*15.0-q.x*4.0-t*.58);
  float swell=sin(q.y*24.0+q.x*7.0-t*.82);
  float ripple=sin(q.x*38.0+q.y*31.0+t*.95);
  vec2 drift=vec2(broad*.007+swell*.0035,ripple*.0018+broad*.004);
  vec2 sampleUV=(q-.5)*cover+.5;
  sampleUV=.5+(sampleUV-.5)*.975+drift;
  vec3 color=texture2D(photo,vec2(sampleUV.x,1.-sampleUV.y)).rgb;
  float light=sin(q.y*28.0-q.x*13.0-t*.72)*sin(q.y*19.0+q.x*9.0-t*.46);
  color*=1.+light*.025;
  gl_FragColor=vec4(color,1.);
 }`));
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
 }catch{return;}
 gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
 const pos=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 const clock=gl.getUniformLocation(program,'time'),cover=gl.getUniformLocation(program,'cover');
 let ready=false,visible=true,frame=0,last=0,elapsed=0;
 function resize(){const r=host.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.max(1,Math.round(r.width*ratio));canvas.height=Math.max(1,Math.round(r.height*ratio));gl.viewport(0,0,canvas.width,canvas.height);const a=r.width/r.height,b=image.naturalWidth/image.naturalHeight;gl.uniform2f(cover,a>b?1:a/b,a>b?b/a:1);}
 function stop(){cancelAnimationFrame(frame);frame=0;last=0;}
 function draw(now){frame=0;if(!ready||!visible||document.hidden||reduced.matches)return;if(last)elapsed+=Math.min(now-last,80)/1000;last=now;gl.uniform1f(clock,elapsed);gl.drawArrays(gl.TRIANGLES,0,6);frame=requestAnimationFrame(draw);}
 function resume(){stop();canvas.hidden=reduced.matches;if(ready&&visible&&!document.hidden&&!reduced.matches)frame=requestAnimationFrame(draw);}
 async function init(){try{await image.decode();gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);host.insertBefore(canvas,image.nextSibling);ready=true;resize();resume();host.dataset.oceanMotion='ready';}catch{canvas.remove();}}
 new ResizeObserver(()=>{if(ready)resize();}).observe(host);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();},{rootMargin:'100px'}).observe(host);
 document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stop();canvas.hidden=true;});
 init();
})();
