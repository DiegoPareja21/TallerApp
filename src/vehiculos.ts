// Marcas y modelos habituales en España, tal y como suelen aparecer escritos en la parte trasera.
// Para añadir un modelo basta con ponerlo en la lista de su marca.

export const MARCAS: { marca: string; alias: string[]; modelos: string[] }[] = [
  {
    marca: 'Volkswagen',
    alias: ['VOLKSWAGEN', 'VW'],
    modelos: ['Golf', 'Polo', 'Passat', 'Tiguan', 'T-Roc', 'T-Cross', 'Touran', 'Touareg', 'Arteon', 'Up', 'Taigo', 'Sharan', 'Caddy', 'Transporter', 'Multivan', 'Scirocco', 'Jetta', 'Beetle', 'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID. Buzz', 'Amarok', 'Crafter', 'Tiguan Allspace'],
  },
  { marca: 'Seat', alias: ['SEAT'], modelos: ['Ibiza', 'León', 'Arona', 'Ateca', 'Tarraco', 'Alhambra', 'Altea', 'Toledo', 'Mii', 'Exeo', 'Córdoba', 'Altea XL'] },
  { marca: 'Cupra', alias: ['CUPRA'], modelos: ['Formentor', 'Born', 'Tavascan', 'Terramar'] },
  {
    marca: 'Skoda',
    alias: ['SKODA', 'ŠKODA'],
    modelos: ['Octavia', 'Fabia', 'Superb', 'Kodiaq', 'Karoq', 'Kamiq', 'Scala', 'Enyaq', 'Rapid', 'Yeti', 'Citigo', 'Elroq', 'Roomster'],
  },
  {
    marca: 'Audi',
    alias: ['AUDI'],
    modelos: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q4', 'Q5', 'Q7', 'Q8', 'TT', 'e-tron', 'Q4 e-tron', 'RS3', 'S3'],
  },
  {
    marca: 'BMW',
    alias: ['BMW'],
    modelos: ['X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'i3', 'i4', 'iX', 'iX1', 'iX3', 'Z4', 'M3', 'M4'],
  },
  {
    marca: 'Mercedes-Benz',
    alias: ['MERCEDES', 'MERCEDES-BENZ', 'BENZ'],
    modelos: ['CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'Vito', 'Sprinter', 'Citan', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'AMG GT'],
  },
  {
    marca: 'Opel',
    alias: ['OPEL'],
    modelos: ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Crossland', 'Grandland', 'Zafira', 'Meriva', 'Adam', 'Combo', 'Vectra', 'Frontera', 'Antara', 'Vivaro'],
  },
  {
    marca: 'Peugeot',
    alias: ['PEUGEOT'],
    modelos: ['108', '206', '207', '208', '307', '308', '407', '408', '508', '2008', '3008', '5008', 'Partner', 'Rifter', 'Expert', 'Traveller', 'Boxer'],
  },
  {
    marca: 'Citroën',
    alias: ['CITROEN', 'CITROËN'],
    modelos: ['C1', 'C3', 'C4', 'C5', 'C3 Aircross', 'C5 Aircross', 'C4 Picasso', 'C4 X', 'Berlingo', 'Xsara', 'Xsara Picasso', 'Saxo', 'C-Elysée', 'Ami', 'Jumpy', 'SpaceTourer', 'Jumper', 'C5 X'],
  },
  { marca: 'DS', alias: ['DS AUTOMOBILES'], modelos: ['DS 3', 'DS 4', 'DS 7', 'DS 9'] },
  {
    marca: 'Renault',
    alias: ['RENAULT'],
    modelos: ['Clio', 'Mégane', 'Captur', 'Kadjar', 'Austral', 'Arkana', 'Scénic', 'Twingo', 'Zoe', 'Kangoo', 'Laguna', 'Talisman', 'Koleos', 'Espace', 'Trafic', 'Master', 'Rafale', 'Symbioz', 'Megane E-Tech', 'Grand Scénic'],
  },
  { marca: 'Dacia', alias: ['DACIA'], modelos: ['Sandero', 'Sandero Stepway', 'Duster', 'Logan', 'Jogger', 'Spring', 'Lodgy', 'Dokker', 'Bigster'] },
  {
    marca: 'Ford',
    alias: ['FORD'],
    modelos: ['Fiesta', 'Focus', 'Kuga', 'Puma', 'Mondeo', 'C-Max', 'S-Max', 'Galaxy', 'EcoSport', 'Ka', 'Ranger', 'Transit', 'Transit Custom', 'Tourneo', 'Mustang', 'Mustang Mach-E', 'Explorer'],
  },
  {
    marca: 'Toyota',
    alias: ['TOYOTA'],
    modelos: ['Yaris', 'Yaris Cross', 'Corolla', 'Auris', 'C-HR', 'RAV4', 'Aygo', 'Aygo X', 'Prius', 'Land Cruiser', 'Hilux', 'Camry', 'Proace', 'bZ4X', 'Verso', 'GR86', 'Supra'],
  },
  { marca: 'Lexus', alias: ['LEXUS'], modelos: ['CT', 'NX', 'UX', 'RX', 'ES', 'LBX', 'IS'] },
  {
    marca: 'Nissan',
    alias: ['NISSAN'],
    modelos: ['Qashqai', 'Juke', 'Micra', 'X-Trail', 'Leaf', 'Note', 'Navara', 'Pulsar', 'Ariya', 'Almera', 'Terrano', 'Patrol', 'Townstar'],
  },
  { marca: 'Honda', alias: ['HONDA'], modelos: ['Civic', 'Jazz', 'CR-V', 'HR-V', 'ZR-V', 'Accord', 'e:Ny1'] },
  { marca: 'Mazda', alias: ['MAZDA'], modelos: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-80', 'MX-5', 'MX-30'] },
  { marca: 'Mitsubishi', alias: ['MITSUBISHI'], modelos: ['ASX', 'Outlander', 'Space Star', 'Eclipse Cross', 'L200', 'Montero', 'Colt'] },
  { marca: 'Suzuki', alias: ['SUZUKI'], modelos: ['Swift', 'Vitara', 'S-Cross', 'Ignis', 'Jimny', 'Across', 'Swace', 'Baleno', 'SX4'] },
  { marca: 'Subaru', alias: ['SUBARU'], modelos: ['Forester', 'Outback', 'XV', 'Impreza', 'Crosstrek'] },
  {
    marca: 'Hyundai',
    alias: ['HYUNDAI'],
    modelos: ['i10', 'i20', 'i30', 'i40', 'Tucson', 'Kona', 'Santa Fe', 'Ioniq', 'Ioniq 5', 'Ioniq 6', 'Bayon', 'ix35', 'ix20', 'Getz', 'Accent'],
  },
  {
    marca: 'Kia',
    alias: ['KIA'],
    modelos: ['Picanto', 'Rio', 'Ceed', 'Sportage', 'Niro', 'Stonic', 'XCeed', 'Sorento', 'ProCeed', 'EV3', 'EV6', 'EV9', 'Soul', 'Carens', 'Venga'],
  },
  { marca: 'Fiat', alias: ['FIAT'], modelos: ['500', '500X', '500L', '500e', '600', 'Panda', 'Grande Panda', 'Tipo', 'Punto', 'Doblò', 'Ducato', 'Bravo', 'Qubo'] },
  { marca: 'Alfa Romeo', alias: ['ALFA ROMEO', 'ALFA'], modelos: ['Giulia', 'Giulietta', 'Stelvio', 'Tonale', 'MiTo', 'Junior'] },
  { marca: 'Jeep', alias: ['JEEP'], modelos: ['Renegade', 'Compass', 'Wrangler', 'Cherokee', 'Grand Cherokee', 'Avenger'] },
  { marca: 'Volvo', alias: ['VOLVO'], modelos: ['XC40', 'XC60', 'XC90', 'V40', 'V60', 'V90', 'S60', 'S90', 'EX30', 'EX40', 'C40'] },
  { marca: 'Mini', alias: ['MINI'], modelos: ['Cooper', 'Countryman', 'Clubman', 'Aceman'] },
  { marca: 'Tesla', alias: ['TESLA'], modelos: ['Model 3', 'Model Y', 'Model S', 'Model X'] },
  { marca: 'MG', alias: ['MG MOTOR'], modelos: ['ZS', 'HS', 'MG4', 'MG3', 'MG5', 'Marvel R', 'EHS'] },
  { marca: 'BYD', alias: ['BYD'], modelos: ['Atto 3', 'Atto 2', 'Dolphin', 'Seal', 'Seal U', 'Sealion 7'] },
  { marca: 'Land Rover', alias: ['LAND ROVER'], modelos: ['Range Rover', 'Evoque', 'Discovery', 'Discovery Sport', 'Defender', 'Velar', 'Freelander'] },
  { marca: 'Jaguar', alias: ['JAGUAR'], modelos: ['XE', 'XF', 'F-Pace', 'E-Pace', 'I-Pace'] },
  { marca: 'Porsche', alias: ['PORSCHE'], modelos: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan'] },
  { marca: 'Smart', alias: ['SMART'], modelos: ['Fortwo', 'Forfour', '#1', '#3'] },
  { marca: 'Lancia', alias: ['LANCIA'], modelos: ['Ypsilon', 'Delta', 'Musa'] },
  { marca: 'Chevrolet', alias: ['CHEVROLET'], modelos: ['Aveo', 'Cruze', 'Captiva', 'Spark'] },
  { marca: 'SsangYong', alias: ['SSANGYONG', 'KGM'], modelos: ['Tivoli', 'Korando', 'Rexton', 'Torres'] },
  { marca: 'Omoda', alias: ['OMODA'], modelos: ['Omoda 5', 'Omoda 7'] },
  { marca: 'Jaecoo', alias: ['JAECOO'], modelos: ['Jaecoo 7'] },
];

/** Mayúsculas, sin tildes y sin espacios ni guiones: "Mégane" -> "MEGANE", "C-HR" -> "CHR". */
export const compactar = (t: string) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9#]/g, '');

type Candidato = { marca: string; modelo?: string; clave: string };

const MODELOS: Candidato[] = MARCAS.flatMap((m) => m.modelos.map((modelo) => ({ marca: m.marca, modelo, clave: compactar(modelo) })));
const ALIAS: Candidato[] = MARCAS.flatMap((m) => m.alias.map((a) => ({ marca: m.marca, clave: compactar(a) })));

// Las claves cortas ("A3", "UP", "500") solo cuentan si son una palabra entera, para evitar falsos positivos
const coincideEn = (clave: string, palabras: Set<string>, lineas: string[]) =>
  palabras.has(clave) || (clave.length >= 5 && lineas.some((l) => l.includes(clave)));

/**
 * Busca marca y modelo en los textos leídos de la foto.
 * Prioriza el modelo más largo ("Yaris Cross" antes que "Yaris") y, si la marca aparece escrita,
 * solo acepta modelos de esa marca.
 */
export function detectarMarcaModelo(textos: string[]): { marca?: string; modelo?: string } {
  const lineas = textos.map(compactar).filter(Boolean);
  // Palabras sueltas y también parejas de palabras seguidas ("SANTA" + "FE", "CX" + "5")
  const palabras = new Set<string>();
  for (const t of textos) {
    const ws = t.split(/[\s.]+/).map(compactar).filter(Boolean);
    ws.forEach((w, i) => {
      palabras.add(w);
      if (ws[i + 1]) palabras.add(w + ws[i + 1]);
    });
  }

  const marca = ALIAS.filter((a) => coincideEn(a.clave, palabras, lineas)).sort((a, b) => b.clave.length - a.clave.length)[0]?.marca;

  // Modelos de 2 letras sin cifras ("ES", "UP", "KA") son palabras demasiado comunes: solo valen si se ha leído la marca
  const ambiguo = (clave: string) => clave.length <= 2 && !/\d/.test(clave);
  const modelo = MODELOS.filter(
    (m) => (marca ? m.marca === marca : !ambiguo(m.clave)) && coincideEn(m.clave, palabras, lineas)
  ).sort(
    (a, b) => b.clave.length - a.clave.length
  )[0];

  if (modelo) return { marca: modelo.marca, modelo: modelo.modelo };

  // BMW escribe la versión: "118d", "320i", "520e" -> Serie 1, 3, 5…
  if (!marca || marca === 'BMW') {
    const bmw = [...palabras].find((w) => /^[1-8]\d{2}[DIE]$/.test(w));
    if (bmw) return { marca: 'BMW', modelo: `Serie ${bmw[0]}` };
  }
  // Mercedes: "A 180", "C220d" -> Clase A, Clase C…
  if (!marca || marca === 'Mercedes-Benz') {
    const mb = [...palabras].find((w) => /^[ABCEGSV]\d{3}[DE]?$/.test(w));
    if (mb && (marca === 'Mercedes-Benz' || mb.length >= 5)) return { marca: 'Mercedes-Benz', modelo: `Clase ${mb[0]}` };
  }
  return { marca };
}
