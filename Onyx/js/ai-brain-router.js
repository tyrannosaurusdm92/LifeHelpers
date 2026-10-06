const clean = s => String(s || "").normalize("NFKC").toLocaleLowerCase().replace(/[^\p{L}\p{N}+_#&/-]+/gu, " ").replace(/\s+/g, " ").trim();
const RULES = [
  ["ttrpg", /\b(ttrpg|tabletop|roleplaying|role playing|campaign|dungeon|encounter|character sheet|spell|initiative|npc|worldbuilding|world building)\b/i],
  ["worldbuilding", /\b(worldbuilding|world building|pantheon|deity|cosmology|ancestry|setting design)\b/i],
  ["creative-writing", /\b(write|writing|story|fiction|narrative|dialogue|poetry|lyrics|prose|plot|character voice)\b/i],
  ["language", /\b(language|phonology|phoneme|script|glyph|translation|grammar|linguistic|pronunciation)\b/i],
  ["art-design", /\b(art|design|color|palette|brush|image|3d|mesh|geometry|modeling)\b/i],
  ["software", /\b(code|software|javascript|typescript|html|css|api|database|programming)\b/i],
  ["adhd", /\b(adhd|executive function|time blindness)\b/i],
  ["autism", /\b(autis|sensory|meltdown|shutdown|masking|aac|nonspeaking)\b/i],
  ["dbt", /\b(dbt|wise mind|tipp|dear man|distress tolerance)\b/i],
  ["cbt", /\b(cbt|thought record|cognitive distortion|behavioral activation)\b/i],
  ["disability-access-caregiving", /\b(disability|caregiver|caregiving|accessibility|wheelchair|communication support)\b/i],
  ["clinical-scenarios", /\b(clinical|diagnosis|therapy|symptom|medical|medication|health)\b/i]
];
const unique = xs => [...new Set(xs.filter(Boolean))];
export async function routeIntent(text) {
  const query = String(text || "").slice(0, 2000);
  const q = clean(query);
  const matches = RULES.filter(([, rx]) => rx.test(query)).map(([domain]) => domain);
  const domains = unique(matches.length ? matches : ["worldbuilding"]);
  const tags = unique(q.split(/\s+/).filter(x => x.length > 1));
  return { query, domains, capabilities: domains, tags, matches: [] };
}
if (typeof globalThis !== "undefined") globalThis.AIBrainRouter = { routeIntent };
