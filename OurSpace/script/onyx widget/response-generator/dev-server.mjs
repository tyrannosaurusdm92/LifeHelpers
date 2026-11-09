/** Zero-dependency local-only static server + scoped relay to the user's EXISTING OurSpace backend. */
import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const port=Number(process.env.PORT||8765);
const backend='https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec';
const type={'.html':'text/html;charset=utf-8','.css':'text/css;charset=utf-8','.js':'text/javascript;charset=utf-8','.mjs':'text/javascript;charset=utf-8','.json':'application/json;charset=utf-8','.wasm':'application/wasm','.md':'text/markdown;charset=utf-8','.txt':'text/plain;charset=utf-8'};
function json(res,code,obj){res.writeHead(code,{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj));}
const server=http.createServer(async(req,res)=>{
 try {
   const url=new URL(req.url,'http://127.0.0.1'),isRelay=url.pathname==='/api/onyx-chat';
   // Loopback only, and no wildcard CORS. Reject cross-site JS / CSRF attempts.
   const origin=req.headers.origin;
   if(origin&&origin!==`http://127.0.0.1:${port}`&&origin!==`http://localhost:${port}`)return json(res,403,{ok:false,error:'Cross-origin request rejected.'});
   if(isRelay){
     if(req.method!=='POST')return json(res,405,{ok:false,error:'POST required.'});
     if(Number(req.headers['content-length']||0)>26000)return json(res,413,{ok:false,error:'Request too large.'});
     let body='';for await(const chunk of req){body+=chunk;if(body.length>26000)return json(res,413,{ok:false,error:'Request too large.'});}
     let payload;try{payload=JSON.parse(body);}catch{return json(res,400,{ok:false,error:'Expected JSON body.'});}
     if(payload?.action!=='onyx.chat'||payload?.namespace!=='ourspace.onyx'||!['william','jasper'].includes(payload?.data?.profileKey)||typeof payload?.sessionToken!=='string'||payload.sessionToken.length>512)return json(res,400,{ok:false,error:'Invalid authenticated Onyx chat envelope.'});
     const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),50000);
     try{
       // Do not log, store, rewrite, or share the session token. Only this one action is relayed.
       const upstream=await fetch(backend,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:ctrl.signal,redirect:'follow'});
       const upstreamText=await upstream.text();if(upstreamText.length>1000000)return json(res,502,{ok:false,error:'Oversized backend response.'});
       try{const parsed=JSON.parse(upstreamText);return json(res,upstream.ok?200:502,parsed);}catch{return json(res,502,{ok:false,error:'Backend returned non-JSON content.'});}
     }catch(e){return json(res,502,{ok:false,error:'Existing backend is not reachable from the local relay: '+e.message});}finally{clearTimeout(timer);}
   }
   if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
   const name=decodeURIComponent(url.pathname==='/'?'/assets/code/onyx_widget.html':url.pathname);
   const resolved=path.resolve(root,'.'+name);if(resolved!==root&&!resolved.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
   const data=await fs.readFile(resolved);res.writeHead(200,{'Content-Type':type[path.extname(resolved)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});if(req.method==='HEAD')res.end();else res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});server.listen(port,'127.0.0.1',()=>console.log(`Onyx workshop: http://127.0.0.1:${port}/ (local relay to existing OurSpace backend)`));
