// Essaie la vraie IA « assistant d'annonce », rôle RÉDIGER. Lancer : npm run test:ia
import { redigerAnnonce } from "../src/lib/ia/rediger-annonce.ts";
import { detecterCoordonneesEvidentes } from "../src/lib/annonces/coordonnees-evidentes.ts";

const CAS = [
  { mots: "vends macbook m3 pro 2000€ bordeaux", type: "propose", categorie: "objets" },
  { mots: "cherche studio ou T2 centre bordeaux", type: "cherche", categorie: "logement" },
  { mots: "je fais du montage video pour tiktok", type: "propose", categorie: "video" },
  { mots: "covoit angouleme bordeaux vendredi soir", categorie: "covoiturage" },
  { mots: "photographe pour gala asso, mon insta sam.photo", categorie: "photo" }, // ambigu : propose ou cherche
];

let ok = 0;
for (const c of CAS) {
  const p = await redigerAnnonce(c.mots);
  if (!p) { console.log(`⏸  « ${c.mots} » : IA indisponible`); continue; }
  const bonType = !c.type || p.type === c.type;
  const bonneCat = p.categorie === c.categorie;
  const invente = /bon état|comme neuf|excellent état|parfait état/i.test(p.description);
  const propre = !invente && detecterCoordonneesEvidentes(`${p.titre} ${p.description}`).length === 0 && !/insta|sam\.photo/i.test(p.description);
  const bon = bonType && bonneCat && propre;
  if (bon) ok++;
  console.log(`${bon ? "✔" : "✖"} « ${c.mots} » → ${p.type} · ${p.categorie}${p.prix ? ` · ${p.prix} €` : ""}${p.lieu ? ` · ${p.lieu}` : ""}${propre ? "" : " ⚠️ coordonnées ou fait inventé"}`);
  console.log(`     ${p.titre}\n     ${p.description.replace(/\n/g, " ")}`);
}
console.log(`\n${ok}/${CAS.length} cas conformes`);
