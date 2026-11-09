/** Existing OurSpace Apps Script only. No direct Gemini keys, new backend or JSONP token leakage. */
export const DEFAULT_BACKEND_URL = 'https://script.google.com/macros/s/AKfycbwxviV1hERFKIivY5we5W1gVMqfsH6DNY0mNZkEs2SXcoa4gDM88c14tIyraytnSAyKvQ/exec';
const allowed = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/;
export class BackendError extends Error {
  constructor(message, details={}) { super(message); this.name='BackendError'; this.details=details; }
}
/** Normalize only documented-like reply shapes, without assuming provider identity from prose. */
export function parseBackendReply(result){
  if(!result || typeof result!=='object')throw new BackendError('Backend returned an invalid response envelope.');
  const nodes=[result,result.data,result.result,result.data?.result,result.data?.response,result.response]
    .filter(x=>x&&typeof x==='object'&&!Array.isArray(x));
  let text='';let body=result;
  for(const n of nodes){
    const val=[n.onyxReply,n.reply,n.response,n.text,n.output,n.message,n.content].find(x=>typeof x==='string'&&x.trim());
    if(val){text=val.trim();body=n;break;}
    if(Array.isArray(n.choices)){
      const candidate=n.choices[0]?.message?.content||n.choices[0]?.text;
      if(typeof candidate==='string'&&candidate.trim()){text=candidate.trim();body=n;break;}
    }
  }
  if(!text)throw new BackendError('The existing backend answered, but did not return a usable Onyx chat reply.',{backendKeys:Object.keys(result).slice(0,12)});
  if(/^\s*<(?:!doctype|html|script)\b/i.test(text))throw new BackendError('Backend returned HTML rather than a chat reply. Check deployment access.');
  const provider=String(body.provider||body.modelProvider||body.aiProvider||body.model||result.provider||result.modelProvider||result.aiProvider||result.model||'').toLowerCase();
  return {text,backendResponseId:String(body.responseId||result.responseId||''),backendLogged:body.backendLogged===true||result.backendLogged===true,
    rawMetadata:{aiBrain:body.aiBrain===true||result.aiBrain===true,provider:provider.includes('gemini')?'gemini':'unverified',mode:body.mode||result.mode||'chat',testerMode:body.testerMode===true||result.testerMode===true,readOnly:result.accountWritesEnabled===false}};
}
export class OnyxBackendClient {
  constructor({ url=DEFAULT_BACKEND_URL, fetchImpl=globalThis.fetch, timeoutMs=45000, jsonpImpl=null }={}) {
    if (!allowed.test(url)) throw new Error('Only the existing HTTPS Google Apps Script /exec endpoint is accepted.');
    this.url=url; this.fetchImpl=fetchImpl; this.timeoutMs=timeoutMs; this.jsonpImpl=jsonpImpl;
  }
  /**
   * The supplied backend explicitly exposes sanitized doGet JSONP, and its tester
   * token grants temporary READ-ONLY access. JSONP is the only response-readable
   * transport from file:// without a separate proxy or changing Apps Script.
   * SECURITY: token and message occur in the URL. Never use this for ordinary
   * OurSpace session tokens, passwords, purchases, or private writes.
   */
  async requestJSONP(action, data={}, {testerToken='', signal, timeoutMs=null}={}) {
    const actions=['onyx.tester.contract','onyx.tester.request','onyx.tester.verify','onyx.tester.status','onyx.tester.select','onyx.tester.exit','onyx.chat'];
    if(!actions.includes(action))throw new BackendError('The file-based tester transport does not permit that backend action.');
    if(action==='onyx.chat'&&!testerToken)throw new BackendError('Verify a tester email code before enabling live chat.');
    // The tester's chat route performs a synchronous AI Brain call inside Apps Script.
    // Verification is fast; a real model completion is not. Keep this distinction.
    const effectiveTimeout=Number(timeoutMs)||(action==='onyx.chat'?180000:this.timeoutMs);
    const payload={action,namespace:'ourspace.onyx',data:{...data}};
    if(testerToken)payload.data.testerToken=testerToken;
    const payloadText=JSON.stringify(payload);
    if(payloadText.length>4500)throw new BackendError('The tester request is too long for direct-file transport. Shorten the message (maximum about 3,500 characters).');
    let result;
    if(this.jsonpImpl)result=await this.jsonpImpl({url:this.url,action,payload,signal,timeoutMs:effectiveTimeout});
    else result=await new Promise((resolve,reject)=>{
      if(typeof document==='undefined')return reject(new BackendError('The tester HTML must be opened in a browser.'));
      const random=(globalThis.crypto?.randomUUID?.()||String(Date.now())+'_'+Math.random().toString(36).slice(2)).replace(/[^A-Za-z0-9_]/g,'');
      const callback='__onyxTesterJSONP_'+random;
      const url=new URL(this.url);url.searchParams.set('callback',callback);url.searchParams.set('payload',payloadText);
      if(url.href.length>8200)return reject(new BackendError('Tester request exceeds the safe URL size for Apps Script. Shorten your input.'));
      const script=document.createElement('script');let done=false;
      const cleanup=()=>{clearTimeout(timer);script.remove();delete globalThis[callback];signal?.removeEventListener('abort',cancel);};
      const finish=(err,value)=>{if(done)return;done=true;cleanup();err?reject(err):resolve(value);};
      const cancel=()=>finish(new BackendError('Tester request canceled.'));
      const timer=setTimeout(()=>finish(new BackendError(action==='onyx.chat'?'The AI Brain did not respond within three minutes. Verification can succeed even if the deployed AI Brain is slow, unavailable or unconfigured. Retry with one response; if this repeats, inspect the AI Brain configuration and Apps Script execution log.':'Apps Script did not return a tester response. Check the deployment, network, or JSONP support.',{code:'response-timeout',action,timeoutMs:effectiveTimeout})),effectiveTimeout);
      if(signal?.aborted){cancel();return;}
      globalThis[callback]=(value)=>finish(null,value);
      script.src=url.toString();script.async=true;script.referrerPolicy='no-referrer';
      script.onerror=()=>finish(new BackendError('Could not load the existing tester backend script. The deployment may not allow public web-app access.'));
      signal?.addEventListener('abort',cancel,{once:true});
      document.head.append(script);
    });
    if(!result||typeof result!=='object')throw new BackendError('Invalid tester response from Apps Script.');
    if(result.ok===false||result.error){const reason=String(result.error||result.message||'Tester request rejected.');
      if(action==='onyx.chat'&&/not configured|configure_v1|connector not configured/i.test(reason))throw new BackendError('Tester verification succeeded, but the shared AI Brain is not configured on the deployed backend. Configure its existing AI Brain client and redeploy that same Apps Script project; the browser cannot supply missing server credentials.',{code:'ai-brain-not-configured',backend:result});
      throw new BackendError(reason,{backend:result,code:'backend-rejected',action});
    }
    return result;
  }
  async request(action, data={}, {sessionToken='', testerToken='', signal}={}) {
    // Always use the backend's existing tester actions for direct-file access.
    if(testerToken || action.startsWith('onyx.tester.'))return this.requestJSONP(action,data,{testerToken,signal});
    const request = { action, namespace:'ourspace.onyx', sessionToken, data:{...data} };
    const abort = new AbortController();
    const onAbort=()=>abort.abort();
    if (signal) signal.addEventListener('abort',onAbort,{once:true});
    const timer=setTimeout(()=>abort.abort(),this.timeoutMs);
    try {
      const loc=globalThis.location;
      const localBridge=loc?.protocol==='http:'&&['127.0.0.1','localhost'].includes(loc.hostname);
      const destination=localBridge?loc.origin+'/api/onyx-chat':this.url;
      if (loc?.protocol==='file:') throw new BackendError('Normal account sessions cannot be used from a double-clicked file. Use Email tester code for read-only access.');
      const response=await this.fetchImpl(destination,{method:'POST',body:JSON.stringify(request),headers:{'Content-Type':'text/plain;charset=utf-8'},redirect:'follow',credentials:'omit',signal:abort.signal,referrerPolicy:'no-referrer',cache:'no-store'});
      const raw=await response.text();
      if(!response.ok) throw new BackendError(`HTTP ${response.status}`,{httpStatus:response.status});
      let parsed;
      try { parsed=JSON.parse(raw); }
      catch { throw new BackendError('Backend did not return readable JSON. Check deployment access and redirects.'); }
      if(!parsed || parsed.ok===false || parsed.error) throw new BackendError(String(parsed.error||parsed.message||'Backend rejected request'),{backend:parsed});
      return parsed;
    } catch(err) {
      if(err instanceof BackendError) throw err;
      if(err.name==='AbortError') throw new BackendError('Backend request timed out or was canceled.');
      if(err instanceof TypeError) throw new BackendError('Browser could not read Apps Script response (CORS/redirect or network). Use the email tester flow from a local HTML file.',{cause:String(err.message)});
      throw new BackendError(err.message||'Network error');
    } finally { clearTimeout(timer); if(signal)signal.removeEventListener('abort',onAbort); }
  }
  async testerRequest(email) {
    if(String(email||'').trim().toLowerCase()!=='williamsaville92@gmail.com')throw new BackendError('Enter the backend-registered tester email address.');
    // The backend chooses the mailbox; it ignores client-proposed destinations.
    return this.requestJSONP('onyx.tester.request',{});
  }
  async testerVerify(code) {
    if(!/^\d{6}$/.test(String(code||'')))throw new BackendError('Enter the six digits from the email.');
    return this.requestJSONP('onyx.tester.verify',{code:String(code)});
  }
  async testerStatus(testerToken){return this.requestJSONP('onyx.tester.status',{}, {testerToken});}
  async testerSelect(testerToken,profile){
    if(!['william','jasper'].includes(profile))throw new BackendError('Select William or Jasper.');
    return this.requestJSONP('onyx.tester.select',{profileKey:profile},{testerToken});
  }
  async testerExit(testerToken){return this.requestJSONP('onyx.tester.exit',{}, {testerToken});}
  async chat({profile,sessionToken='',testerToken='',message,mood='thinking',context={},threadId='',signal}={}) {
    if(!['william','jasper'].includes(profile))throw new Error('Profile must be William or Jasper.');
    if(testerToken){
      const result=await this.requestJSONP('onyx.chat',{message,profileKey:profile,webSearch:false},{testerToken,signal,timeoutMs:180000});
      if(result.testerMode!==true)throw new BackendError('Backend returned a non-tester response; refusing to present this as verified tester mode.');
      if(result.selectedProfile!==profile)throw new BackendError('Tester backend selected a different profile. Select the intended profile again.');
      return parseBackendReply(result);
    }
    if(!sessionToken) throw new BackendError('Live AI Brain access requires either a verified email tester code or a signed-in OurSpace session token.');
    const data={profileKey:profile,message,mood:`onyx_${mood}`,threadId:threadId||`onyx-response-generator-${profile}`,useBrain:true,
      webSearch:false,useDrive:false,autoRemember:false,allowWrites:false,allowAssetGeneration:false,allowExternalTools:false,
      allowGlobalDrive:false,maxOutputTokens:800,reasoningEffort:'medium',context};
    const result=await this.request('onyx.chat',data,{sessionToken,signal});
    return parseBackendReply(result);
  }

}
