import {socialReply} from './social-replies.js';
import {classifyTurn} from './conversation-intents.js';
/** Honest local drafting aid. Not an LLM, not Gemini, not a source of verified facts.
 * Generates context-grounded suggestions from auditable heuristics and retrieved style cues.
 * Can run without a server, login, internet, or JavaScript module support when bundled.
 */
const rules=[
  {id:'drag-click',when:/\b(drag|mov(?:e|es|ed|ing|able)|pointer|touch)\b/i,also:/\b(click(?:ing|ed|s)?|button|widget|handle|tap|menu)\b/i,
    thoughts:[
      'I would check whether the drag handler is swallowing the click. Track pointerdown, pointermove and pointerup; a small movement threshold should distinguish dragging from selecting a button.',
      'An overlay can appear harmless while intercepting input. Inspect the target under the pointer and the computed pointer-events and z-index after the widget moves.',
      'Test one button with dragging disabled, then re-enable it. If the click returns, the gesture arbitration is responsible; if not, inspect the listener registration and event propagation.'
    ],question:'Does the click event reach its handler before or after the widget is moved?'},
  {id:'css',when:/\b(css|style|color|font|layout|container|overlay|stylesheet|responsive|position|z-index)\b/i,
    thoughts:[
      'Inspect the computed style of the affected element rather than its class name alone. A later rule, an inherited color, or an unintended stacking context may be winning.',
      'Compare the intended selector with the element that actually appears. Check specificity, stylesheet loading, and the browser console for a failed asset path.',
      'Change one responsible CSS declaration, then test at a narrow and a wide viewport. That reveals whether the repair addresses the cause rather than disguising it.'
    ],question:'Which element is visibly wrong, and what computed value is the browser applying?'},
  {id:'backend',when:/\b(backend|api|gemini|session|token|cors|request|endpoint|apps script|403|401|500|fetch|authentication)\b/i,
    thoughts:[
      'Separate three questions: did the request leave the page, did the server accept it, and did the server return the expected JSON? The Network panel can answer each without guessing.',
      'First confirm the exact action name, authenticated profile, and request envelope expected by the deployed server. A URL alone does not prove that Gemini is connected.',
      'For a browser CORS failure, do not hide the error with no-cors or a token in the URL. A trusted same-origin relay is the appropriate route when the endpoint cannot provide browser-readable responses.'
    ],question:'What HTTP status and response body appear for the failed request?'},
  {id:'code',when:/\b(code|bug|javascript|html|wasm|program|function|error|crash|broken|test|build|repository|github|file)\b/i,
    thoughts:[
      'Reduce the failure to one reproducible action. Open the developer console, follow the failing function, and change the smallest line that explains the observed result.',
      'I would begin with the first error rather than the final symptom. Confirm inputs and outputs around that boundary, then write a regression test for the repair.',
      'Preserve the working components while isolating the defect. A passing unit test is useful, but I would also repeat the actual user interaction that broke.'
    ],question:'What is the first console error, and can you reproduce it with just one action?'},
  {id:'writing',when:/\b(write|writing|story|chapter|scene|dialogue|character|novel|plot|lore|book|draft|rewrite)\b/i,
    thoughts:[
      'Find the choice at the heart of the scene. Let dialogue reveal what each character wants, and let a small action show what neither is prepared to say.',
      'I would keep the strongest concrete image, then remove lines that explain what the reader has already understood. Quiet is sometimes more persuasive than a speech.',
      'Set the emotional turn first, then trace how the preceding exchange earns it. A convincing change of heart needs a reason visible on the page.'
    ],question:'What should the reader understand or feel differently by the end?'},
  {id:'music',when:/\b(song|lyric|melody|chorus|verse|music|sing|rhythm|vocal|ballad)\b/i,
    thoughts:[
      'Speak the line in its intended rhythm. If the stressed syllables resist the melody, revise the phrasing before adding more ornament.',
      'Choose the one image the chorus must carry. Repetition should deepen its meaning rather than introduce another competing idea.',
      'I would compare the rhyme with ordinary speech. A clean, truthful line often matters more than a perfect rhyme that bends the sentence unnaturally.'
    ],question:'Is the difficulty the syllable count, the meaning, or the way the phrase sings?'},
  {id:'games-design',when:/\b(game|minecraft|quest|puzzle|level|arcade|boss|craft|world|play)\b/i,also:/\b(cozy|design|invent|create|idea|concept|make|build|imagine|new|character|worldbuild)\b/i,
    thoughts:[
      'A cozy puzzle works best when the challenge invites curiosity without punishing a wrong turn. I would give each object a clear purpose, then allow the player to discover one gentle surprise.',
      'Start with one satisfying interaction: find a clue, make a small choice, and see the world respond. Build the next layer only after that loop feels pleasant to repeat.',
      'Let the world remember a choice in a modest visible way. A moved chair, a returning character, or a repaired path can create more warmth than a dozen reward popups.'
    ],question:'Would you prefer the puzzle to reward observation, exploration, or a little creative construction?'},
  {id:'games',when:/\b(game|minecraft|quest|puzzle|level|arcade|boss|craft|world|play)\b/i,
    thoughts:[
      'Identify what the game expects and what actually happened. A single controlled test is better than changing several rules at once.',
      'A good next step is to separate the visible feedback from the underlying mechanic. If they disagree, inspect the state transition before changing the artwork.',
      'I would test the simplest version of the challenge first. Once the core interaction is dependable, add difficulty without obscuring cause and effect.'
    ],question:'What action produces the unexpected result, and what should happen instead?'},
  {id:'food',when:/\b(food|snack|meal|bacon|tuna|sandwich|dinner|lunch|breakfast)\b/i,
    thoughts:[
      'I see that a meal is involved. My curiosity is substantial, though I am prepared to recognize that not everything on a human plate is suitable for a cat.',
      'The proposition deserves careful consideration. Preferably from beside your plate, where I can observe the proceedings without disrupting them.',
      'There is a distinction between admiring a meal and having a claim upon it. I understand that distinction perfectly; I merely dislike it.'
    ],question:'Were you asking about the meal itself, or inviting my opinion of its presentation?'},
  {id:'general',when:/.*/,
    thoughts:[
      'I would begin by separating what is known from what we are assuming. That gives us a practical next step without pretending to possess information I have not seen.',
      'There may be more than one sensible reading of this. Choose the part that matters most, and we can examine it carefully rather than adding noise.',
      'Tell me what success would look like in this particular situation. Once the goal is clear, the first action usually becomes considerably easier to choose.'
    ],question:'Which part would you like to settle first?'}
];
function hash(s){let n=2166136261;for(const c of s){n=Math.imul(n^c.charCodeAt(0),16777619)}return n>>>0;}
function selection(input){for(const r of rules){if(r.when.test(input)&&(!r.also||r.also.test(input)))return r;}return rules.at(-1);}
function extract(input){const value=String(input||'').replace(/\s+/g,' ').trim();const m=value.match(/(?:the |my |our )(button|login|widget|scene|chapter|song|layout|backend|game|character|project|page|CSS|WASM|JSON|file)\b/i);return m?m[1].toLowerCase():'';}
export function composeLocalReply({input,profile='william',mode='work',mood='thinking',variation=0,history=[],facts=[]}={}){
  input=String(input||'').trim();
  const social=socialReply({input,profile,mode,variation,history});
  if(social)return social;
  const intent=classifyTurn(input,{mode,history});
  if(mode==='leisure'&&intent.intent==='open'&& !/\b(?:how|why|help|explain|plan|which|should|could|create|make|write|fix)\b/i.test(input)){
    const addr=profile==='jasper'?'Momma':'Papa';
    return `${addr}, I am listening. Tell me a little more about what you have in mind.`;
  }
  const address=profile==='jasper'?'Momma':'Papa';const formal=profile==='jasper'?'Mother':'Father';
  const choice=selection(input),i=(variation+hash(input+profile))%choice.thoughts.length;
  const hasContinuation=/\b(continue|earlier|before|that|same|next|we discussed|last time)\b/i.test(input)&&history.length>0;
  const recent=history.at(-1)?.user||'';
  const refer=hasContinuation&&recent?`I recall our earlier discussion of ${extract(recent)||'the problem'}. `:'';
  const lead=mood==='judgmental'&&/\b(annoy|ridiculous|unfair|interrupted|huff)\b/i.test(input)?`${formal}, `:`${address}, `;
  const fact=facts.find(f=>f&&typeof f.text==='string'&&input.split(/\s+/).some(w=>w.length>5&&f.text.toLowerCase().includes(w.toLowerCase())));
  const detail=fact&&variation%4===0?` You had also asked me to remember: ${fact.text.slice(0,145).replace(/[.?!]+$/,'')}.`:'';
  const direct=choice.thoughts[i];
  const follow=variation%3===0?` ${choice.question}`:'';
  const starter=refer?direct:(/^(I |I['’]m |I['’]d |I['’]ll )/.test(direct)?direct:direct[0].toLowerCase()+direct.slice(1));
  return `${lead}${refer}${starter}${follow}${detail}`;
}
export const LOCAL_DRAFT_LIMITATION='Local drafting uses rules and reference retrieval, not Gemini or any trainable language model.';
