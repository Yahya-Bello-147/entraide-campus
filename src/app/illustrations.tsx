import type { ReactNode } from "react";
import type { Campus } from "@/lib/campus";

// Dessins du style « vagues » (maquette du 27 oct) : tout est dessiné ici, aucune image téléchargée.
// Purement décoratifs : aria-hidden, et pointer-events-none pour ne jamais gêner un clic.

function Etoile({ x, y, r, className }: { x: number; y: number; r: number; className: string }) {
  const p = r * 0.38;
  return (
    <path
      className={className}
      d={`M${x} ${y - r} L${x + p} ${y - p} L${x + r} ${y} L${x + p} ${y + p} L${x} ${y + r} L${x - p} ${y + p} L${x - r} ${y} L${x - p} ${y - p} Z`}
    />
  );
}

// Ordinateur avec du code, bulle de discussion et avion en papier (bandeau du tableau de bord).
function Ordinateur() {
  return (
    <>
      <ellipse cx="130" cy="170" rx="120" ry="12" className="fill-bleu" opacity="0.6" />
      <rect x="40" y="60" width="170" height="108" rx="12" fill="#2f3b6b" />
      <rect x="50" y="70" width="150" height="88" rx="6" fill="#7dd3e8" />
      <rect x="62" y="84" width="60" height="8" rx="4" fill="#ffffff" />
      <rect x="74" y="100" width="90" height="8" rx="4" className="fill-rose" />
      <rect x="62" y="116" width="110" height="8" rx="4" fill="#2f3b6b" opacity="0.5" />
      <rect x="74" y="132" width="50" height="8" rx="4" fill="#ffffff" />
      <path d="M20 168 H230 L218 186 H32 Z" fill="#4a5a96" />
      <rect x="150" y="10" width="96" height="54" rx="18" fill="#ffffff" />
      <path d="M170 60 L162 82 L190 62 Z" fill="#ffffff" />
      <circle cx="176" cy="37" r="6" className="fill-violet" />
      <circle cx="198" cy="37" r="6" className="fill-violet" />
      <circle cx="220" cy="37" r="6" className="fill-violet" />
      <path d="M0 30 L34 14 L16 52 L11 38 Z" className="fill-or" />
    </>
  );
}

// Vague, petits dessins et illustration à droite, dans un bandeau violet (tableau de bord, profil).
export function DecorBandeau({ avecIllustration = false }: { avecIllustration?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 976 210"
      preserveAspectRatio="xMaxYMax slice"
    >
      <path d="M0 170 C120 140 220 210 360 185 C480 164 540 120 660 150 C760 175 820 130 976 120 V210 H0 Z" className="fill-bleu" />
      <path d="M0 150 C130 120 230 190 370 165" fill="none" stroke="#c7aee0" strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      {/* Petits dessins : seulement sur grand écran, sinon ils passent sous les chiffres. */}
      <g className="hidden lg:inline">
        <Etoile x={620} y={50} r={18} className="fill-or" />
        <Etoile x={672} y={150} r={11} className="fill-white opacity-70" />
        <circle cx="690" cy="96" r="7" fill="none" className="stroke-rose" strokeWidth="3" />
        <path d="M612 196 c8 -10 18 -10 24 0 s18 10 24 0" fill="none" className="stroke-or" strokeWidth="3" strokeLinecap="round" />
      </g>
      {avecIllustration && (
        <g transform="translate(700 18)" className="hidden lg:inline">
          <Ordinateur />
        </g>
      )}
    </svg>
  );
}

// Vagues de la page d'accueil : en haut à droite (derrière le menu) et en bas à gauche.
export function VaguesAccueil() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1280 800"
      preserveAspectRatio="none"
    >
      <path d="M300 0 H1280 V200 C1190 240 1090 150 970 170 C860 188 760 150 660 120 C560 90 470 40 300 0 Z" className="fill-violet" />
      <path d="M0 590 C110 610 170 690 300 712 C430 734 520 700 640 750 C690 772 720 790 730 800 H0 Z" className="fill-violet" />
      <path d="M0 560 C120 585 180 660 310 685" fill="none" stroke="#c7aee0" strokeWidth="10" strokeLinecap="round" />
      <path d="M1280 640 C1210 660 1170 730 1150 800 H1280 Z" fill="#c7aee0" />
    </svg>
  );
}

// Grande illustration de l'accueil : ordinateur, appareil photo, livres, bulles, avion en papier.
export function IllustrationAccueil({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 600 560" className={`pointer-events-none ${className}`}>
      <ellipse cx="300" cy="500" rx="260" ry="26" fill="#c7aee0" opacity="0.7" />
      <g transform="rotate(-8 230 200)">
        <rect x="120" y="90" width="230" height="290" rx="10" fill="#fde2c8" />
        <rect x="150" y="125" width="150" height="10" rx="5" fill="#f4b98a" />
        <rect x="150" y="150" width="120" height="10" rx="5" fill="#f4b98a" />
      </g>
      <rect x="180" y="240" width="300" height="190" rx="16" fill="#2f3b6b" />
      <rect x="196" y="256" width="268" height="158" rx="8" fill="#7dd3e8" />
      <rect x="216" y="280" width="90" height="10" rx="5" fill="#ffffff" />
      <rect x="216" y="302" width="150" height="10" rx="5" fill="#2f3b6b" opacity="0.5" />
      <rect x="236" y="324" width="110" height="10" rx="5" className="fill-rose" />
      <rect x="236" y="346" width="160" height="10" rx="5" fill="#2f3b6b" opacity="0.5" />
      <rect x="216" y="368" width="70" height="10" rx="5" fill="#ffffff" />
      <path d="M150 430 H510 L490 462 H170 Z" fill="#4a5a96" />
      <rect x="300" y="430" width="60" height="8" rx="4" fill="#2f3b6b" />
      <rect x="390" y="370" width="150" height="100" rx="18" fill="#f28c38" />
      <rect x="415" y="355" width="50" height="22" rx="6" fill="#e0742a" />
      <circle cx="465" cy="420" r="34" fill="#2f3b6b" />
      <circle cx="465" cy="420" r="22" fill="#7dd3e8" />
      <circle cx="458" cy="412" r="7" fill="#ffffff" opacity="0.8" />
      <circle cx="520" cy="388" r="6" className="fill-or" />
      <rect x="60" y="440" width="150" height="26" rx="6" fill="#3fa77a" />
      <rect x="72" y="414" width="130" height="26" rx="6" className="fill-rose" />
      <rect x="66" y="388" width="140" height="26" rx="6" className="fill-indigo" />
      <rect x="66" y="397" width="140" height="5" fill="#ffffff" opacity="0.4" />
      <rect x="72" y="423" width="130" height="5" fill="#ffffff" opacity="0.4" />
      <rect x="400" y="120" width="140" height="80" rx="24" fill="#ffffff" />
      <path d="M430 196 L420 226 L456 198 Z" fill="#ffffff" />
      <circle cx="440" cy="160" r="8" className="fill-violet" />
      <circle cx="470" cy="160" r="8" className="fill-violet" />
      <circle cx="500" cy="160" r="8" className="fill-violet" />
      <rect x="60" y="210" width="110" height="64" rx="20" className="fill-rose" />
      <path d="M140 270 L156 294 L120 272 Z" className="fill-rose" />
      <path d="M92 242 l10 10 l20 -20" fill="none" stroke="#ffffff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M560 40 L600 22 L578 66 L572 50 Z" fill="#7dd3e8" />
      <path d="M572 50 L600 22" stroke="#4a9bb3" strokeWidth="2" />
      <path d="M560 46 C520 70 540 110 500 100" fill="none" className="stroke-indigo" strokeWidth="2.5" strokeDasharray="6 7" strokeLinecap="round" />
      <Etoile x={300} y={65} r={25} className="fill-indigo" />
      <Etoile x={30} y={137} r={17} className="fill-[#f28c38]" />
      <Etoile x={560} y={307} r={17} className="fill-or" />
      <circle cx="220" cy="60" r="9" fill="none" className="stroke-rose" strokeWidth="3" />
      <circle cx="40" cy="340" r="7" fill="none" className="stroke-indigo" strokeWidth="3" />
      <path d="M200 520 c10 -14 22 -14 30 0 s22 14 30 0" fill="none" stroke="#f28c38" strokeWidth="3" strokeLinecap="round" />
      <path d="M330 120 c12 -20 34 -6 24 8 c-8 10 -24 2 -14 -10" fill="none" stroke="#3fa77a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Décor du menu violet de gauche : une vague en bas et quelques petits dessins.
export function DecorMenu() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 248 800" preserveAspectRatio="xMidYMax slice">
      <path d="M0 640 C60 610 120 680 170 650 C210 626 230 600 248 610 V800 H0 Z" className="fill-bleu" />
      <Etoile x={204} y={84} r={14} className="fill-or" />
      <circle cx="30" cy="330" r="5" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.4" />
      <circle cx="220" cy="430" r="4" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}

// Un monument dessiné par campus de l'ESP (accueil, puis bandeau « Mon campus »).
const MONUMENTS: Record<Campus, { fond: string; vue: string; dessin: ReactNode }> = {
  // Tour Eiffel
  Paris: {
    fond: "#e6ecfb",
    vue: "0 0 160 130",
    dessin: (
      <>
        <ellipse cx="80" cy="122" rx="60" ry="6" fill="#c9d3f2" />
        <path d="M80 8 L86 50 L100 120 H88 L80 96 L72 120 H60 L74 50 Z" className="fill-indigo" />
        <rect x="68" y="48" width="24" height="6" rx="2" className="fill-indigo" />
        <rect x="62" y="82" width="36" height="6" rx="2" className="fill-indigo" />
        <path d="M74 96 Q80 86 86 96" fill="#e6ecfb" />
      </>
    ),
  },
  // Basilique de Fourvière
  Lyon: {
    fond: "#f3ebf9",
    vue: "0 0 170 130",
    dessin: (
      <>
        <ellipse cx="85" cy="122" rx="70" ry="6" fill="#dccbee" />
        <rect x="40" y="62" width="90" height="58" className="fill-violet" />
        <rect x="32" y="40" width="16" height="80" className="fill-bleu" />
        <rect x="122" y="40" width="16" height="80" className="fill-bleu" />
        <path d="M32 40 L40 30 L48 40 Z M122 40 L130 30 L138 40 Z" className="fill-bleu" />
        <path d="M70 62 Q85 36 100 62 Z" className="fill-bleu" />
        <rect x="77" y="88" width="16" height="32" rx="8" fill="#f3ebf9" />
        <rect x="52" y="74" width="10" height="16" rx="5" fill="#f3ebf9" />
        <rect x="108" y="74" width="10" height="16" rx="5" fill="#f3ebf9" />
      </>
    ),
  },
  // Place de la Bourse et miroir d'eau
  Bordeaux: {
    fond: "#e3f4fa",
    vue: "0 0 190 130",
    dessin: (
      <>
        <rect x="20" y="58" width="150" height="40" fill="#e8c9a0" />
        <path d="M75 58 L95 40 L115 58 Z" fill="#d9b585" />
        <g fill="#c9a476">
          {[30, 46, 62, 120, 136, 152].map((x) => (
            <rect key={x} x={x} y="66" width="8" height="24" />
          ))}
          <rect x="90" y="66" width="10" height="24" />
        </g>
        <rect x="10" y="98" width="170" height="26" rx="4" fill="#7dd3e8" />
        <rect x="20" y="104" width="150" height="3" rx="2" fill="#ffffff" opacity="0.7" />
        <rect x="40" y="113" width="110" height="3" rx="2" fill="#ffffff" opacity="0.5" />
      </>
    ),
  },
  // Grue jaune de l'île de Nantes
  Nantes: {
    fond: "#fff4d6",
    vue: "0 0 170 130",
    dessin: (
      <>
        <ellipse cx="85" cy="122" rx="65" ry="6" fill="#f2dfa8" />
        <rect x="70" y="40" width="14" height="82" fill="#f5b83d" />
        <path d="M70 50 L84 64 M84 50 L70 64 M70 74 L84 88 M84 74 L70 88 M70 98 L84 112 M84 98 L70 112" stroke="#d99a1e" strokeWidth="2" />
        <rect x="20" y="30" width="140" height="10" fill="#f5b83d" />
        <rect x="60" y="22" width="34" height="18" rx="3" fill="#e0a52c" />
        <line x1="140" y1="40" x2="140" y2="78" stroke="#3f3a4a" strokeWidth="2" />
        <rect x="133" y="78" width="14" height="10" fill="#3f3a4a" />
      </>
    ),
  },
  // Capitole, « la ville rose »
  Toulouse: {
    fond: "#fde2e8",
    vue: "0 0 190 130",
    dessin: (
      <>
        <ellipse cx="95" cy="122" rx="80" ry="6" fill="#f6c3cf" />
        <rect x="20" y="56" width="150" height="66" fill="#ef8fa0" />
        <rect x="16" y="48" width="158" height="10" fill="#e5788b" />
        <path d="M70 48 L95 30 L120 48 Z" fill="#e5788b" />
        <g fill="#fde2e8">
          {[32, 50, 68, 114, 132, 150].map((x) => (
            <rect key={x} x={x} y="68" width="8" height="40" />
          ))}
          <rect x="86" y="68" width="18" height="54" rx="9" />
        </g>
      </>
    ),
  },
  // Beffroi
  Lille: {
    fond: "#def4ec",
    vue: "0 0 160 130",
    dessin: (
      <>
        <ellipse cx="80" cy="122" rx="55" ry="6" fill="#bfe6d6" />
        <rect x="64" y="34" width="32" height="88" fill="#3fa77a" />
        <path d="M60 34 L80 4 L100 34 Z" fill="#2f8a63" />
        <circle cx="80" cy="54" r="9" fill="#ffffff" />
        <path d="M80 48 V54 H85" stroke="#2f8a63" strokeWidth="2" fill="none" strokeLinecap="round" />
        <rect x="40" y="80" width="24" height="42" fill="#5bbf94" />
        <rect x="96" y="80" width="24" height="42" fill="#5bbf94" />
        <rect x="74" y="96" width="12" height="26" rx="6" fill="#def4ec" />
      </>
    ),
  },
};

export function couleurCampus(campus: Campus) {
  return MONUMENTS[campus].fond;
}

export function MonumentCampus({ campus, className = "" }: { campus: Campus; className?: string }) {
  const m = MONUMENTS[campus];
  return (
    <svg aria-hidden="true" viewBox={m.vue} className={`pointer-events-none ${className}`}>
      {m.dessin}
    </svg>
  );
}
