// Run with: node scripts/seed-products.mjs
// Upserts the Deco Shop Plus home catalog and wires relatedProductIds.
// --force also removes leftover non-catalog products (except open-order SKUs).
import { Pool } from 'pg'
import { databaseHost, resolveDatabaseUrl } from './db-url.mjs'
import { loadEnv } from './load-env.mjs'

loadEnv()

const DATABASE_URL = resolveDatabaseUrl()
if (!DATABASE_URL) {
  console.error('DATABASE_URL not set in .env')
  process.exit(1)
}

console.log(
  `Seeding DATABASE_URL (${databaseHost(DATABASE_URL)})`,
)

const pool = new Pool({ connectionString: DATABASE_URL })

function slugify(value) {
  const slug = String(value ?? '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
  return slug
}

const CATEGORIES = [
  { name: 'Coussins', slug: 'coussins', bannerUrl: '/categories/coussins.webp' },
  { name: 'Rangement', slug: 'rangement', bannerUrl: '/categories/rangement.webp' },
]

const OLD_CATEGORY_SLUGS = ['femme', 'homme', 'parfums', 'maquillage', 'sacs', 'soins', 'unisex', 'tous', 'textiles', 'accessoires']

const IMG = {
  hc01: '/assets/hc01.webp',
  hc01Size: '/assets/hc01-size.webp',
  sr01: '/assets/sr01.webp',
  sr01Angle: '/assets/sr01-angle.webp',
  sr01Filled: '/assets/sr01-filled.webp',
  sr01Pack: '/assets/sr01-pack.webp',
  sr01Handle: '/assets/sr01-handle.webp',
  chairPad: '/assets/chair-pad-primary.webp',
  chairPadFloor: '/assets/chair-pad-floor.webp',
  chairPadLifestyle: '/assets/chair-pad-lifestyle.webp',
  chairPadRed: '/assets/chair-pad-red.webp',
  chairPadRound: '/assets/chair-pad-round.webp',
  chairPadBackrest: '/assets/chair-pad-backrest-primary.webp',
  chairPadBackrestGreen: '/assets/chair-pad-backrest-green.webp',
  chairPadBackrestOrange: '/assets/chair-pad-backrest-orange.webp',
  chairPadBackrestGrey: '/assets/chair-pad-backrest-grey.webp',
  chairPadBackrestFeatures: '/assets/chair-pad-backrest-features.webp',
  chairPadBackrestVelvet: '/assets/chair-pad-backrest-velvet.webp',
  chairPadPack4: '/assets/chair-pad-pack-4-primary.webp',
  chairPadPack4Colors: '/assets/chair-pad-pack-4-colors.webp',
  chairPadPack4Chair: '/assets/chair-pad-pack-4-chair.webp',
  chairPadPack4Swatches: '/assets/chair-pad-pack-4-swatches.webp',
  chairPadPack4Table: '/assets/chair-pad-pack-4-table.webp',
  readingPillow: '/assets/reading-pillow.webp',
  readingPillowGrey: '/assets/reading-pillow-grey.webp',
  readingPillowNavy: '/assets/reading-pillow-navy.webp',
  readingPillowColors: '/assets/reading-pillow-colors.webp',
  readingPillowHero: '/assets/reading-pillow-primary.webp',
  sofaCushion: '/assets/sofa-cushion.webp',
  sofaCushionColors: '/assets/sofa-cushion-colors.webp',
  sofaCushionHero: '/assets/sofa-cushion-primary.webp',
  sofaCushionShelf: '/assets/sofa-cushion-shelf.webp',
  sofaCushionPiping: '/assets/sofa-cushion-piping.webp',
  sofaCushionZip: '/assets/sofa-cushion-zip.webp',
  headboardCushion: '/assets/headboard-cushion.webp',
  headboardCushionColors: '/assets/headboard-cushion-colors.webp',
  headboardCushionHero: '/assets/headboard-cushion-primary.webp',
  headboardCushionBed: '/assets/headboard-cushion-bed.webp',
  headboardCushionSide: '/assets/headboard-cushion-side.webp',
  decorativeCushionHero: '/assets/decorative-cushion-primary.webp',
  decorativeCushionStack: '/assets/decorative-cushion-stack.webp',
  decorativeCushionRed: '/assets/decorative-cushion-red.webp',
  decorativeCushionGreen: '/assets/decorative-cushion-green.webp',
  decorativeCushionOrange: '/assets/decorative-cushion-orange.webp',
  decorativeCushionPurple: '/assets/decorative-cushion-purple.webp',
  decorativeCushionBlue: '/assets/decorative-cushion-blue.webp',
  bolsterCushionHero: '/assets/bolster-cushion-primary.webp',
  bolsterCushionColors: '/assets/bolster-cushion-coloris.webp',
  rugCoverHero: '/assets/rug-cover-housses-tapis-primary.webp',
  rugCoverSizes: '/assets/rug-cover-5-tailles.webp',
  rugCoverInterior: '/assets/rug-cover-interieur.webp',
  rugCoverFabric: '/assets/rug-cover-tissu-resistant.webp',
  rugCoverOrganized: '/assets/rug-cover-rangement-optimise.webp',
  superFiestaHero: '/assets/super-fiesta-primary.webp',
  superFiestaProduct: '/assets/super-fiesta-product.webp',
  superFiestaStack: '/assets/super-fiesta-stack.webp',
  superFiestaNuits: '/assets/super-fiesta-nuits.webp',
  superFiestaConfort: '/assets/super-fiesta-confort.webp',
  superFiestaZip: '/assets/super-fiesta-zip.webp',
  superFiestaSoft: '/assets/super-fiesta-soft.webp',
  storageBoxLot5Hero: '/assets/storage-box-lot5-primary.webp',
  storageBoxLot5Safe: '/assets/storage-box-lot5-safe.webp',
  storageBoxLot5Uses: '/assets/storage-box-lot5-uses.webp',
  storageBoxLot5Size: '/assets/storage-box-lot5-size.webp',
  storageBoxLot5Zip: '/assets/storage-box-lot5-zip.webp',
  storageBoxLot5Fabric: '/assets/storage-box-lot5-fabric.webp',
  storageBoxLot5Closet: '/assets/storage-box-lot5-closet.webp',
  storageCubeLot5Hero: '/assets/storage-cube-lot5-primary.webp',
  storageCubeLot5Size: '/assets/storage-cube-lot5-size.webp',
  storageCubeLot5Features: '/assets/storage-cube-lot5-features.webp',
  garmentCoverHero: '/assets/garment-cover-primary.webp',
  garmentCoverPack: '/assets/garment-cover-pack.webp',
  garmentCoverWater: '/assets/garment-cover-water.webp',
  garmentCoverHandles: '/assets/garment-cover-handles.webp',
  garmentCoverWindow: '/assets/garment-cover-window.webp',
  garmentCoverZip: '/assets/garment-cover-zip.webp',
  dressCover120Hero: '/assets/dress-cover-120-hero.webp',
  dressCover120Pack: '/assets/dress-cover-120-pack.webp',
  suitCover150Hero: '/assets/suit-cover-150-primary.webp',
  suitCover150Rod: '/assets/suit-cover-150-rod.webp',
  suitCover150Side: '/assets/suit-cover-150-side.webp',
  suitCover150Front: '/assets/suit-cover-150-front.webp',
  shoeCoverLot10Hero: '/assets/shoe-cover-lot10-hero.webp',
  shoeCoverLot10Beige: '/assets/shoe-cover-lot10-beige.webp',
  shoeCoverLot10Gray: '/assets/shoe-cover-lot10-gray.webp',
  shoeCoverLot10Black: '/assets/shoe-cover-lot10-black.webp',
  weddingDressCoverHero: '/assets/wedding-dress-cover-primary.webp',
}

/** @typedef {{
 *   key: string
 *   name: string
 *   brand: string
 *   description: string
 *   price: string
 *   compareAtPrice?: string | null
 *   category: 'coussins' | 'rangement'
 *   image: string
 *   images?: string[]
 *   sizes: string[]
 *   colors?: { name: string, hex: string }[]
 *   bundles?: { name: string, units: number, price: number, compareAtPrice?: number | null, popular?: boolean }[]
 *   promoEnabled?: boolean
 *   promoLabel?: string
 *   promoBgColor?: string
 *   promoTextColor?: string
 *   published?: boolean
 *   aliases?: string[]
 *   featured: boolean
 *   related: string[]
 * }} SeedProduct
 */

const CATALOG_COLORS = [
  { name: 'Rouge', hex: '#c81e1e' },
  { name: 'Jaune', hex: '#eab308' },
  { name: 'Vert', hex: '#166534' },
  { name: 'Gris', hex: '#9ca3af' },
  { name: 'Beige', hex: '#d6cbb8' },
  { name: 'Marine', hex: '#1e3a5f' },
  { name: 'Marron', hex: '#7c2d12' },
  { name: 'Bordeaux', hex: '#7f1d1d' },
  { name: 'Vert pistache', hex: '#93c572' },
]

const BOLSTER_COLORS = [
  { name: 'Fuchsia', hex: '#c2185b' },
  { name: 'Bleu électrique', hex: '#1565c0' },
  { name: 'Gris argent', hex: '#a8a8a8' },
  { name: 'Gris anthracite', hex: '#374151' },
]

const RUG_COVER_COLORS = [
  { name: 'Beige', hex: '#d6cbb8' },
  { name: 'Noire', hex: '#1f2937' },
  { name: 'Gris', hex: '#6b7280' },
]

/** @type {SeedProduct[]} */
const PRODUCTS = [
  {
    key: 'chairPad',
    name: 'Galette de chaise capitonnée',
    brand: 'Deco Shop Plus',
    description:
      'Galette de chaise capitonnée avec attaches aux coins pour la fixer au dossier. Matière de fabrication : velours anti-tache. Confortable pour cuisine, salle a manger ou bureau. Disponible en carre ou rond : Rouge, Jaune, Vert, Gris, Beige, Marine, Marron, Bordeaux et Vert pistache.',
    price: '10.000',
    compareAtPrice: '15.000',
    category: 'coussins',
    image: IMG.chairPad,
    images: [IMG.chairPad, IMG.chairPadFloor, IMG.chairPadLifestyle, IMG.chairPadRed, IMG.chairPadRound],
    sizes: ['Carré', 'Rond'],
    colors: CATALOG_COLORS,
    promoEnabled: true,
    promoLabel: 'Promotion',
    featured: true,
    related: [
      'chairPadBackrest',
      'chairPadPack4',
      'readingPillow',
      'sofaCushion',
      'decorativeCushion',
      'bolsterCushion',
    ],
  },
  {
    key: 'chairPadBackrest',
    name: 'Galette de chaise capitonnée dossier et assise',
    brand: 'Deco Shop Plus',
    description:
      'Galette de chaise capitonnée en deux parties : dossier et assise, reliees par un pli pour habiller toute la chaise. Matière de fabrication : velours anti-tache. Boutons capitonnes, attaches aux coins pour la fixer au dossier et a l assise, et anse de transport en haut. Confortable pour cuisine, salle a manger ou bureau. Disponible dans une large gamme de couleurs.',
    price: '24.000',
    compareAtPrice: '30.000',
    category: 'coussins',
    image: IMG.chairPadBackrest,
    images: [
      IMG.chairPadBackrest,
      IMG.chairPadBackrestGreen,
      IMG.chairPadBackrestOrange,
      IMG.chairPadBackrestGrey,
      IMG.chairPadBackrestFeatures,
      IMG.chairPadBackrestVelvet,
    ],
    sizes: ['Unique'],
    colors: CATALOG_COLORS,
    bundles: [
      { name: 'Une seule galette', units: 1, price: 24, compareAtPrice: 30, popular: false },
      { name: 'Pack 2 galettes', units: 2, price: 46, compareAtPrice: 60, popular: false },
      { name: 'Pack 3 galettes', units: 3, price: 68, compareAtPrice: 90, popular: true },
      { name: 'Pack 4 galettes', units: 4, price: 90, compareAtPrice: 120, popular: false },
    ],
    promoEnabled: true,
    promoLabel: 'Promotion',
    featured: true,
    related: [
      'chairPad',
      'chairPadPack4',
      'readingPillow',
      'sofaCushion',
      'decorativeCushion',
      'bolsterCushion',
    ],
  },
  {
    key: 'hc01',
    name: 'Pack de 3 Housses à Chaussures Imperméables HC01',
    aliases: [
      'Housse à Chaussures Imperméable HC01',
      'Housse a Chaussures Impermeable HC01',
    ],
    brand: 'Deco Shop Plus',
    description:
      'Pack de 3 housses impermeables et anti-poussiere pour ranger et proteger vos chaussures. Cordon de serrage et fenetre transparente pour voir le contenu. Ideales au quotidien et en deplacement. Dimensions: 28 x 38 cm.',
    price: '26.000',
    compareAtPrice: '30.000',
    category: 'rangement',
    image: IMG.hc01,
    images: [IMG.hc01, IMG.hc01Size],
    sizes: ['Unique'],
    colors: [
      { name: 'Gris', hex: '#6b7280' },
      { name: 'Noir', hex: '#1f2937' },
    ],
    promoEnabled: true,
    promoLabel: 'Promotion',
    published: false,
    featured: false,
    related: ['chairPad', 'chairPadBackrest', 'chairPadPack4', 'rugCoverStorage', 'storageBoxLot5', 'storageCubeLot5', 'garmentCover'],
  },
  {
    key: 'sr01',
    name: 'Sac de Rangement SR01 - Vêtements',
    brand: 'Deco Shop Plus',
    description:
      'Sac de rangement en toile impermeable pour vetements et linge. Grande capacite 50 x 35 x 30 cm, fenetre transparente a l avant et poignees renforcees. Se plie facilement une fois vide.',
    price: '33.000',
    compareAtPrice: '45.000',
    category: 'rangement',
    image: IMG.sr01,
    images: [IMG.sr01, IMG.sr01Angle, IMG.sr01Filled, IMG.sr01Pack, IMG.sr01Handle],
    sizes: ['Unique'],
    colors: [{ name: 'Gris', hex: '#4b5563' }],
    promoEnabled: true,
    promoLabel: 'Promotion',
    published: false,
    featured: false,
    related: ['chairPad', 'chairPadBackrest', 'chairPadPack4', 'rugCoverStorage', 'storageBoxLot5', 'storageCubeLot5', 'garmentCover'],
  },
  {
    key: 'rugCoverStorage',
    name: 'Housse de rangement pour tapis',
    aliases: ['Housse de rangement tapis', 'Housse tapis', 'Housses des tapis'],
    brand: 'Deco Shop Plus',
    description:
      'Housse de rangement pour tapis en tissu resistant : protege contre la poussiere et l humidite, facile a ranger et a transporter. Fermeture a cordon simple et pratique. Cinq tailles disponibles de 1 m a 3 m pour tous vos tapis. Couleurs : Beige, Noire et Gris.',
    price: '4.000',
    category: 'rangement',
    image: IMG.rugCoverHero,
    images: [
      IMG.rugCoverHero,
      IMG.rugCoverSizes,
      IMG.rugCoverInterior,
      IMG.rugCoverOrganized,
      IMG.rugCoverFabric,
    ],
    sizes: [
      { name: '1 m', price: 4 },
      { name: '1,5 m', price: 5 },
      { name: '2 m', price: 6 },
      { name: '2,5 m', price: 9 },
      { name: '3 m', price: 10 },
    ],
    colors: RUG_COVER_COLORS,
    featured: true,
    related: ['sr01', 'hc01', 'storageBoxLot5', 'storageCubeLot5', 'garmentCover'],
  },
  {
    key: 'chairPadPack4',
    name: 'Pack de 4 galettes de chaise rondes capitonnées',
    brand: 'Deco Shop Plus',
    description:
      'Pack de 4 galettes de chaise rondes capitonnées, avec attaches pour les fixer au dossier. Matière de fabrication : velours anti-tache. Confortable pour cuisine ou salle a manger. Choisissez vos 4 couleurs parmi la gamme. Livraison partout en Tunisie.',
    price: '38.000',
    compareAtPrice: '40.000',
    category: 'coussins',
    image: IMG.chairPadPack4,
    images: [IMG.chairPadPack4, IMG.chairPadPack4Table, IMG.chairPadPack4Swatches, IMG.chairPadPack4Chair, IMG.chairPadPack4Colors],
    sizes: ['Rond'],
    colors: CATALOG_COLORS,
    promoEnabled: true,
    promoLabel: 'Promotion',
    featured: true,
    related: ['chairPad', 'chairPadBackrest', 'readingPillow'],
  },
  {
    key: 'readingPillow',
    name: 'Coussin de lecture',
    brand: 'Deco Shop Plus',
    description:
      'Coussin de lecture ergonomique pour le lit ou le canape : dossier cale et rouleau de cou reglable. Boutons lateraux pour ajuster la hauteur de l appui-tete. Matière de fabrication : velours anti-tache. Confortable pour lire, regarder un ecran ou se reposer. Disponible en Rouge, Jaune, Vert, Gris, Beige, Marine, Marron, Bordeaux et Vert pistache.',
    price: '52.000',
    category: 'coussins',
    image: IMG.readingPillowHero,
    images: [IMG.readingPillowHero, IMG.readingPillowColors, IMG.readingPillow, IMG.readingPillowGrey, IMG.readingPillowNavy],
    sizes: ['Unique'],
    colors: CATALOG_COLORS,
    featured: true,
    related: [
      'chairPad',
      'chairPadBackrest',
      'sofaCushion',
      'headboardCushion',
      'decorativeCushion',
      'bolsterCushion',
    ],
  },
  {
    key: 'sofaCushion',
    name: 'Coussin de canapé',
    brand: 'Deco Shop Plus',
    description:
      'Coussin de canapé en velours anti-tache, forme rectangulaire 70 × 40 × 18 cm, finition passepoil et housse zippee amovible. Matière douce et dense pour le salon. Disponible en plusieurs couleurs pour habiller le canape ou le lit.',
    price: '38.000',
    category: 'coussins',
    image: IMG.sofaCushionHero,
    images: [IMG.sofaCushionHero, IMG.sofaCushionColors, IMG.sofaCushion, IMG.sofaCushionShelf, IMG.sofaCushionPiping, IMG.sofaCushionZip],
    sizes: ['70x40x18'],
    colors: CATALOG_COLORS,
    bundles: [
      { name: 'Un seul coussin', units: 1, price: 38, compareAtPrice: null, popular: false },
      { name: 'Pack 2 coussins', units: 2, price: 72, compareAtPrice: 76, popular: false },
      { name: 'Pack 3 coussins', units: 3, price: 104, compareAtPrice: 114, popular: true },
    ],
    featured: true,
    related: [
      'readingPillow',
      'chairPad',
      'headboardCushion',
      'decorativeCushion',
      'bolsterCushion',
    ],
  },
  {
    key: 'headboardCushion',
    name: 'Coussin de tête de lit',
    brand: 'Deco Shop Plus',
    description:
      'Coussin de tete de lit en forme de cale : dossier capitonne pour s installer confortablement dans le lit. Poche laterale pour telephone, lunettes ou telecommande. Matière de fabrication : velours anti-tache. Boutons recouverts. Ideal pour lire ou regarder un ecran. Dimensions : 90, 120, 140, 160 et 180 cm. Disponible en Rouge, Jaune, Vert, Gris, Beige, Marine, Marron, Bordeaux et Vert pistache.',
    price: '85.000',
    category: 'coussins',
    image: IMG.headboardCushionHero,
    images: [IMG.headboardCushionHero, IMG.headboardCushionColors, IMG.headboardCushion, IMG.headboardCushionBed, IMG.headboardCushionSide],
    sizes: [
      { name: '90 cm', price: 85 },
      { name: '120 cm', price: 105 },
      { name: '140 cm', price: 138 },
      { name: '160 cm', price: 158 },
      { name: '180 cm', price: 178 },
    ],
    colors: CATALOG_COLORS,
    featured: true,
    related: [
      'readingPillow',
      'sofaCushion',
      'chairPad',
      'decorativeCushion',
      'bolsterCushion',
    ],
  },
  {
    key: 'decorativeCushion',
    name: 'Coussin décoratif',
    aliases: ['Coussin decorative', 'Coussin décorative'],
    brand: 'Deco Shop Plus',
    description:
      'Coussin décoratif carré en satin luxe, pour le canapé, le fauteuil ou le lit. Matière de fabrication : velours anti-tache. Dimensions : 40 × 40 cm. Disponible dans la gamme atelier : Rouge, Jaune, Vert, Gris, Beige, Marine, Marron, Bordeaux et Vert pistache. Vendu à l unité ou en pack.',
    price: '10.000',
    compareAtPrice: '14.000',
    category: 'coussins',
    image: IMG.decorativeCushionHero,
    images: [
      IMG.decorativeCushionHero,
      IMG.decorativeCushionStack,
      IMG.decorativeCushionRed,
      IMG.decorativeCushionGreen,
      IMG.decorativeCushionOrange,
      IMG.decorativeCushionPurple,
      IMG.decorativeCushionBlue,
    ],
    sizes: ['40 × 40 cm'],
    colors: CATALOG_COLORS,
    bundles: [
      { name: 'Un seul coussin', units: 1, price: 10, compareAtPrice: 14, popular: false },
      { name: 'Pack 2 coussins', units: 2, price: 22, compareAtPrice: 28, popular: false },
      { name: 'Pack 3 coussins', units: 3, price: 30, compareAtPrice: 42, popular: false },
      { name: 'Pack 4 coussins', units: 4, price: 38, compareAtPrice: 56, popular: true },
    ],
    promoEnabled: true,
    promoLabel: 'Promotion',
    featured: true,
    related: ['sofaCushion', 'readingPillow', 'chairPad', 'headboardCushion', 'bolsterCushion'],
  },
  {
    key: 'bolsterCushion',
    name: 'Coussin traversin cylindrique en velours',
    aliases: ['Coussin traversin cylindrique', 'Traversin velours', 'الكعبة'],
    brand: 'Deco Shop Plus',
    description:
      'Coussin traversin cylindrique en velours anti-tache : une touche de confort pour le canapé, le fauteuil ou le lit. Forme cylindrique avec finition passepoil, doux au toucher et adaptable a tous les styles. Disponible en Fuchsia, Bleu électrique, Gris argent et Gris anthracite. Vendu à l unité ou en pack.',
    price: '28.000',
    compareAtPrice: '32.000',
    category: 'coussins',
    image: IMG.bolsterCushionHero,
    images: [
      IMG.bolsterCushionHero,
      IMG.bolsterCushionColors,
    ],
    sizes: ['Unique'],
    colors: BOLSTER_COLORS,
    bundles: [
      { name: 'Un seul coussin', units: 1, price: 28, compareAtPrice: 32, popular: false },
      { name: 'Pack 2 coussins', units: 2, price: 54, compareAtPrice: 64, popular: false },
      { name: 'Pack 3 coussins', units: 3, price: 79, compareAtPrice: 96, popular: false },
      { name: 'Pack 4 coussins', units: 4, price: 100, compareAtPrice: 128, popular: true },
    ],
    promoEnabled: true,
    promoLabel: 'Promotion',
    featured: true,
    related: ['sofaCushion', 'decorativeCushion', 'readingPillow', 'headboardCushion'],
  },
  {
    key: 'superFiestaPillow',
    name: 'Oreiller Orthopédique Super Fiesta – 65 × 45 cm',
    aliases: [
      'Oreiller Orthopédique Super Fiesta',
      'Oreiller Super Fiesta',
      'Super Fiesta 65x45',
    ],
    brand: 'Deco Shop Plus',
    description:
      'Offrez-vous des nuits plus confortables avec l oreiller orthopedique Super Fiesta. Concu pour offrir un excellent soutien tout en restant doux et confortable, il accompagne naturellement votre position de sommeil. Sa housse douce et respirante, dotee d une fermeture eclair, permet un entretien pratique. Son garnissage moelleux assure une sensation agreable et un confort durable. Dimensions : 65 x 45 cm. Design orthopedique, tissu respirant, housse avec fermeture eclair, qualite superieure.',
    price: '14.000',
    category: 'coussins',
    image: IMG.superFiestaHero,
    images: [
      IMG.superFiestaHero,
      IMG.superFiestaProduct,
      IMG.superFiestaStack,
      IMG.superFiestaNuits,
      IMG.superFiestaConfort,
      IMG.superFiestaZip,
      IMG.superFiestaSoft,
    ],
    sizes: ['65 × 45 cm'],
    colors: [{ name: 'Blanc', hex: '#f5f5f5' }],
    bundles: [
      { name: 'Un seul oreiller', units: 1, price: 14, popular: false },
      { name: 'Pack 5 oreillers', units: 5, price: 60, compareAtPrice: 70, popular: true },
    ],
    featured: true,
    related: ['readingPillow', 'headboardCushion', 'bolsterCushion', 'decorativeCushion'],
  },
  {
    key: 'storageBoxLot5',
    name: 'Lot de 5 Boîtes de Rangement Pliables – Grande Capacité 70 × 60 × 30 cm',
    aliases: [
      'Lot de 5 boites de rangement pliables',
      'Boites de rangement pliables 70x60x30',
      'Boite de rangement pliable lot 5',
    ],
    brand: 'Deco Shop Plus',
    description:
      'Lot de 5 boites de rangement pliables en tissu resistant. Grande capacite 70 x 60 x 30 cm par boite, fenetre transparente, fermeture eclair et poignees laterales. Protege contre la poussiere et l humidite. Ideal pour vetements, couvertures, couettes et linge.',
    price: '44.000',
    compareAtPrice: '50.000',
    category: 'rangement',
    image: IMG.storageBoxLot5Hero,
    images: [
      IMG.storageBoxLot5Hero,
      IMG.storageBoxLot5Safe,
      IMG.storageBoxLot5Uses,
      IMG.storageBoxLot5Size,
      IMG.storageBoxLot5Zip,
      IMG.storageBoxLot5Fabric,
      IMG.storageBoxLot5Closet,
    ],
    sizes: ['70 × 60 × 30 cm'],
    colors: [{ name: 'Gris', hex: '#6b7280' }],
    promoEnabled: true,
    promoLabel: 'Promotion',
    featured: true,
    related: ['rugCoverStorage', 'sr01', 'hc01', 'storageCubeLot5', 'garmentCover'],
  },
  {
    key: 'storageCubeLot5',
    name: 'Lot de 5 Cubes de Rangement Pliables – 50 × 40 × 40 cm',
    aliases: [
      'Pack de 5 cubes de rangement',
      'Cubes de rangement pliables 50x40x40',
      '5 cubes de rangement',
    ],
    brand: 'Deco Shop Plus',
    description:
      'Lot de 5 cubes de rangement pliables en tissu matelasse gris. Format 50 x 40 x 40 cm, fenetre transparente, fermeture eclair robuste et poignees renforcees. Protege contre la poussiere et l humidite, se plie facilement une fois vide. Ideal pour vetements, couvertures, couettes et oreillers.',
    price: '40.000',
    compareAtPrice: '46.000',
    category: 'rangement',
    image: IMG.storageCubeLot5Hero,
    images: [
      IMG.storageCubeLot5Hero,
      IMG.storageCubeLot5Size,
      IMG.storageCubeLot5Features,
    ],
    sizes: ['50 × 40 × 40 cm'],
    colors: [{ name: 'Gris', hex: '#6b7280' }],
    promoEnabled: true,
    promoLabel: 'Promotion',
    featured: true,
    related: ['storageBoxLot5', 'rugCoverStorage', 'sr01', 'hc01', 'garmentCover'],
  },
  {
    key: 'garmentCover',
    name: 'Housse de Vêtements – Protection & Rangement',
    aliases: [
      'Housse de vetements',
      'Housse vetements protection rangement',
      'Housse de rangement vetements',
    ],
    brand: 'Deco Shop Plus',
    description:
      'Protegez vos vetements de la poussiere, de l humidite et des mauvaises odeurs avec notre housse de rangement pratique, resistante et respirante. Fenetre transparente, fermeture eclair et poignees pour transporter facilement. Ideale pour organiser votre garde-robe et preserver vos habits.',
    price: '26.000',
    compareAtPrice: '30.000',
    category: 'rangement',
    image: IMG.garmentCoverHero,
    images: [
      IMG.garmentCoverHero,
      IMG.garmentCoverPack,
      IMG.garmentCoverWater,
      IMG.garmentCoverHandles,
      IMG.garmentCoverWindow,
      IMG.garmentCoverZip,
    ],
    sizes: ['Unique'],
    colors: [{ name: 'Noir', hex: '#1f2937' }],
    bundles: [
      { name: 'Pack 2 housses', units: 2, price: 26, compareAtPrice: 30, popular: false },
      { name: 'Pack 3 housses', units: 3, price: 36, compareAtPrice: 45, popular: true },
      { name: 'Pack 4 housses', units: 4, price: 44, compareAtPrice: 60, popular: false },
    ],
    promoEnabled: true,
    promoLabel: 'Promotion',
    featured: true,
    related: ['rugCoverStorage', 'storageBoxLot5', 'storageCubeLot5', 'sr01', 'hc01', 'dressCover120', 'suitCover150', 'weddingDressCover'],
  },
  {
    key: 'dressCover120',
    name: 'Housse de rangement 1.2 m pour Robes & Manteaux',
    aliases: [
      'Housse rangement 1.2m robes manteaux',
      'Housse robes et manteaux 1.2 m',
      'Pack 4 housses 1.2 m',
    ],
    brand: 'Deco Shop Plus',
    description:
      'Protegez vos robes, manteaux et vetements longs avec notre housse de rangement 1.2 m. Tissu resistant et durable, protection contre la poussiere, l humidite et les salissures. Fermeture eclair solide, ideale a la maison ou en voyage. Pack de 4 housses.',
    price: '22.000',
    category: 'rangement',
    image: IMG.dressCover120Hero,
    images: [IMG.dressCover120Hero, IMG.dressCover120Pack],
    sizes: ['1,2 m'],
    colors: [{ name: 'Noir', hex: '#1f2937' }],
    featured: true,
    related: ['suitCover150', 'garmentCover', 'weddingDressCover', 'rugCoverStorage', 'storageBoxLot5', 'storageCubeLot5'],
  },
  {
    key: 'suitCover150',
    name: 'Housse de rangement 1.5 m pour Costumes',
    aliases: [
      'Housse rangement 1.5m costumes',
      'Housse costumes 1.5 m',
      'Pack 4 housses costumes',
    ],
    brand: 'Deco Shop Plus',
    description:
      'Gardez vos costumes elegants, propres et parfaitement proteges avec notre housse de rangement 1.5 m. Grande longueur pour costumes, vestes et vetements longs. Tissu resistant, fermeture eclair solide, pratique au quotidien et en voyage. Pack de 4 housses.',
    price: '28.000',
    category: 'rangement',
    image: IMG.suitCover150Hero,
    images: [
      IMG.suitCover150Hero,
      IMG.suitCover150Rod,
      IMG.suitCover150Side,
      IMG.suitCover150Front,
    ],
    sizes: ['1,5 m'],
    colors: [{ name: 'Noir', hex: '#1f2937' }],
    featured: true,
    related: ['dressCover120', 'garmentCover', 'weddingDressCover', 'rugCoverStorage', 'storageBoxLot5', 'storageCubeLot5', 'shoeCoverLot10'],
  },
  {
    key: 'shoeCoverLot10',
    name: 'Pack de 10 Housses de Rangement pour Chaussures – Protection Anti-Poussière',
    aliases: [
      'Pack 10 housses chaussures',
      'Housses de rangement chaussures lot 10',
      'Housse chaussures anti-poussiere',
    ],
    brand: 'Deco Shop Plus',
    description:
      'Protegez et rangez facilement vos chaussures avec notre pack de 10 housses de rangement. Tissu resistant et fenetre transparente pour garder vos chaussures propres et les identifier rapidement. Fermeture pratique, format leger et conception peu encombrante. Ideales pour organiser votre dressing, votre placard ou vos valises.',
    price: '25.000',
    category: 'rangement',
    image: IMG.shoeCoverLot10Hero,
    images: [
      IMG.shoeCoverLot10Hero,
      IMG.shoeCoverLot10Beige,
      IMG.shoeCoverLot10Gray,
      IMG.shoeCoverLot10Black,
    ],
    sizes: ['28 × 38 cm'],
    colors: [
      { name: 'Blanc', hex: '#f5f5f5' },
      { name: 'Beige', hex: '#d6cbb8' },
      { name: 'Noir', hex: '#1f2937' },
      { name: 'Gris', hex: '#6b7280' },
    ],
    featured: true,
    related: ['dressCover120', 'garmentCover', 'weddingDressCover', 'rugCoverStorage', 'storageBoxLot5', 'storageCubeLot5'],
  },
  {
    key: 'weddingDressCover',
    name: 'Housse de Protection pour Robes de Mariée & Robes de Soirée – 1,80 m',
    aliases: [
      'Housse robes de mariee',
      'Housse robes de soiree 1.80 m',
      'Housse protection robe longue',
    ],
    brand: 'Deco Shop Plus',
    description:
      'Protegez vos robes longues, robes de mariee et robes de soiree avec une housse elegante et resistante de 1,80 m. Protection contre la poussiere et l humidite, facile a ranger et a transporter. Conception reutilisable pour garder vos robes propres et bien protegees. Couleurs : Blanc, Noir et Beige.',
    price: '25.000',
    category: 'rangement',
    image: IMG.weddingDressCoverHero,
    images: [IMG.weddingDressCoverHero],
    sizes: ['1,80 m'],
    colors: [
      { name: 'Blanc', hex: '#f5f5f5' },
      { name: 'Noir', hex: '#1f2937' },
      { name: 'Beige', hex: '#d6cbb8' },
    ],
    bundles: [
      { name: '1 housse', units: 1, price: 25, popular: false },
      { name: 'Pack de 2 housses', units: 2, price: 48, popular: true },
    ],
    featured: true,
    related: ['garmentCover', 'dressCover120', 'suitCover150', 'rugCoverStorage', 'storageBoxLot5'],
  },
]

async function ensureCategories() {
  for (const category of CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (name, slug, "bannerUrl", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name,
         "bannerUrl" = EXCLUDED."bannerUrl",
         "updatedAt" = NOW()`,
      [category.name, category.slug, category.bannerUrl],
    )
  }
}

async function ensureBoutique() {
  await pool.query(
    `INSERT INTO boutiques
      (slug, name, city, region, description, "imageUrl", "imageAlt", address, phone,
       rating, "reviewCount", "ratingSource", "directionsUrl", "pickupEnabled", published, "sortOrder",
       "createdAt", "updatedAt")
     VALUES
      ('cite-el-waha-bizerte', 'Deco Shop Plus', 'Bizerte', 'Cite El Waha',
       'Notre boutique a Cite El Waha, Bizerte. Coussins et galettes de chaise pour la maison.',
       '/assets/chair-pad-lifestyle.webp', 'Salon et coussins Deco Shop Plus a Bizerte',
       'Cite El Waha, Bizerte, Tunisie', '56 405 932', 4.9, NULL, 'Google Maps',
       'https://www.google.com/maps/dir/?api=1&destination=Cite+El+Waha%2C+Bizerte%2C+Tunisie',
       true, true, 0, NOW(), NOW())
     ON CONFLICT (slug) DO UPDATE SET
       name = EXCLUDED.name,
       city = EXCLUDED.city,
       region = EXCLUDED.region,
       description = EXCLUDED.description,
       "imageUrl" = EXCLUDED."imageUrl",
       "imageAlt" = EXCLUDED."imageAlt",
       address = EXCLUDED.address,
       phone = EXCLUDED.phone,
       "directionsUrl" = EXCLUDED."directionsUrl",
       "pickupEnabled" = true,
       published = true,
       "updatedAt" = NOW()`,
  )
  await pool.query(
    `UPDATE boutiques
     SET published = false, "pickupEnabled" = false, "updatedAt" = NOW()
     WHERE slug IN ('sahloul-sousse', 'moknine-monastir')`,
  )
}

async function ensureHero() {
  const slots = [
    [0, '/assets/chair-pad-lifestyle.webp', 'Galette de chaise Deco Shop Plus'],
    [1, '/assets/reading-pillow-colors.webp', 'Coussin de lecture Deco Shop Plus'],
    [2, '/assets/sofa-cushion-colors.webp', 'Coussin de canape Deco Shop Plus'],
    [3, '/assets/chair-pad-stack.webp', 'Galettes de chaise Deco Shop Plus'],
  ]
  for (const [slot, imageUrl, alt] of slots) {
    await pool.query(
      `INSERT INTO hero_images (slot, "imageUrl", alt, "updatedAt")
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (slot) DO UPDATE SET
         "imageUrl" = EXCLUDED."imageUrl",
         alt = EXCLUDED.alt,
         "updatedAt" = NOW()`,
      [slot, imageUrl, alt],
    )
  }
}

async function ensureHeroSlides() {
  const slides = [
    [
      '/assets/carousel-atelier.webp',
      'Atelier Deco Shop Plus a Cite El Waha, Bizerte',
      'Cité El Waha · Bizerte',
      'Un atelier. Des coussins.',
      'Nous concevons et cousons nos pièces à Bizerte, avec des matières choisies et du temps.',
      'Entrer dans la boutique',
      'products',
      '',
      0,
    ],
    [
      '/assets/carousel-details.webp',
      'Coussins et textiles maison Deco Shop Plus',
      'Des détails qui font la différence',
      'Coussins & Textiles Maison',
      'Plus de confort, plus de style ! Jusqu\'à -37% sur une sélection.',
      'Voir les promotions',
      'promotions',
      '',
      1,
    ],
    [
      '/assets/carousel-maison.webp',
      'Maison et lecture, univers Deco Shop Plus',
      'Maison',
      "S'installer. Lire. Rester.",
      'Des pièces pensées pour le quotidien, cousues ici, livrées partout en Tunisie.',
      'Les nouveautés',
      'nouveautes',
      '',
      2,
    ],
  ]

  const activeImageUrls = slides.map((slide) => slide[0])

  await pool.query(
    `DELETE FROM hero_slides
     WHERE "imageUrl" IN (
       '/assets/banner1.webp', '/assets/banner2.webp',
       '/assets/banner-galettes.webp', '/assets/banner-lecture.webp',
       '/assets/banner-canape.webp', '/assets/banner-tete-de-lit.webp',
       '/assets/hc01.webp', '/assets/hc01-size.webp',
       '/assets/sr01.webp', '/assets/sr01-angle.webp', '/assets/sr01-filled.webp',
       '/assets/sr01-pack.webp', '/assets/sr01-handle.webp',
       '/assets/chair-pad-pack-4.webp', '/assets/chair-pad-lifestyle.webp',
       '/assets/reading-pillow-colors.webp'
     )
     OR "imageUrl" LIKE '%/hc01%'
     OR "imageUrl" LIKE '%/sr01%'`,
  )

  for (const [imageUrl, alt, eyebrow, title, subtitle, ctaLabel, ctaTarget, ctaHref, sortOrder] of slides) {
    const existing = await pool.query(`SELECT id FROM hero_slides WHERE "imageUrl" = $1 LIMIT 1`, [imageUrl])
    if (existing.rows[0]) {
      await pool.query(
        `UPDATE hero_slides
         SET alt = $2, eyebrow = $3, title = $4, subtitle = $5,
             "ctaLabel" = $6, "ctaTarget" = $7, "ctaHref" = $8,
             published = true, "sortOrder" = $9, "updatedAt" = NOW()
         WHERE id = $1`,
        [existing.rows[0].id, alt, eyebrow, title, subtitle, ctaLabel, ctaTarget, ctaHref, sortOrder],
      )
    } else {
      await pool.query(
        `INSERT INTO hero_slides
          ("imageUrl", alt, eyebrow, title, subtitle, "ctaLabel", "ctaTarget", "ctaHref", published, "sortOrder", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9, NOW(), NOW())`,
        [imageUrl, alt, eyebrow, title, subtitle, ctaLabel, ctaTarget, ctaHref, sortOrder],
      )
    }
  }

  await pool.query(
    `UPDATE hero_slides
     SET published = false, "updatedAt" = NOW()
     WHERE published = true AND "imageUrl" <> ALL($1::text[])`,
    [activeImageUrls],
  )
}

async function ensureSiteBanner() {
  await pool.query(`UPDATE banners SET active = false, "updatedAt" = NOW() WHERE active = true`)
  const existing = await pool.query(
    `SELECT id FROM banners WHERE name = $1 LIMIT 1`,
    ['Atelier Cite El Waha'],
  )
  if (existing.rows[0]) {
    await pool.query(
      `UPDATE banners SET
        message = $1, variant = 'news',
        "backgroundColor" = '#0f5c64', "textColor" = '#f7fbfa', "fontSize" = 13,
        "linkLabel" = 'BOUTIQUE', "linkHref" = '/products',
        dismissible = true, active = true, "updatedAt" = NOW()
       WHERE id = $2`,
      ['Atelier Cité El Waha — coussins cousus à Bizerte', existing.rows[0].id],
    )
    return
  }
  await pool.query(
    `INSERT INTO banners
      (name, message, variant, "backgroundColor", "textColor", "fontSize",
       "linkLabel", "linkHref", dismissible, active, "createdAt", "updatedAt")
     VALUES
      ('Atelier Cite El Waha',
       'Atelier Cité El Waha — coussins cousus à Bizerte',
       'news', '#0f5c64', '#f7fbfa', 13, 'BOUTIQUE', '/products', true, true, NOW(), NOW())`,
  )
}

async function upsertProduct(product) {
  const imageList = product.images?.length ? product.images : [product.image]
  const images = JSON.stringify(imageList)
  const sizes = JSON.stringify(product.sizes)
  const colors = JSON.stringify(product.colors ?? [])
  const bundles = JSON.stringify(product.bundles ?? [])
  const names = [product.name, ...(product.aliases || [])]
  const existing = await pool.query(
    `SELECT id FROM products WHERE brand = $1 AND name = ANY($2::text[]) LIMIT 1`,
    [product.brand, names],
  )

  const promoEnabled = Boolean(product.promoEnabled)
  const promoLabel = product.promoLabel || 'Promotion'
  const promoBgColor = product.promoBgColor || '#c81e1e'
  const promoTextColor = product.promoTextColor || '#ffffff'
  const published = product.published !== false
  const featured = published && Boolean(product.featured)
  const slug = slugify(product.name) || `produit-${existing.rows[0]?.id ?? 'new'}`

  if (existing.rows[0]) {
    const id = existing.rows[0].id
    await pool.query(
      `UPDATE products SET
        name = $1,
        slug = $2,
        description = $3,
        price = $4,
        "compareAtPrice" = $5,
        category = $6,
        "imageUrl" = $7,
        images = $8,
        sizes = $9,
        colors = $10,
        bundles = $11,
        "inStock" = true,
        stock = 10,
        featured = $12,
        published = $13,
        "promoEnabled" = $14,
        "promoLabel" = $15,
        "promoBgColor" = $16,
        "promoTextColor" = $17,
        "updatedAt" = NOW()
       WHERE id = $18`,
      [
        product.name,
        slugify(product.name) || `produit-${id}`,
        product.description,
        product.price,
        product.compareAtPrice ?? null,
        product.category,
        product.image,
        images,
        sizes,
        colors,
        bundles,
        featured,
        published,
        promoEnabled,
        promoLabel,
        promoBgColor,
        promoTextColor,
        id,
      ],
    )
    return id
  }

  const inserted = await pool.query(
    `INSERT INTO products (
      name, slug, brand, description, price, "compareAtPrice", category,
      "imageUrl", images, sizes, colors, bundles, "relatedProductIds", "inStock", stock, featured, published,
      "promoEnabled", "promoLabel", "promoBgColor", "promoTextColor",
      "createdAt", "updatedAt"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, '[]', true, 10, $13, $14, $15, $16, $17, $18, NOW(), NOW())
    RETURNING id`,
    [
      product.name,
      slug,
      product.brand,
      product.description,
      product.price,
      product.compareAtPrice ?? null,
      product.category,
      product.image,
      images,
      sizes,
      colors,
      bundles,
      featured,
      published,
      promoEnabled,
      promoLabel,
      promoBgColor,
      promoTextColor,
    ],
  )
  return inserted.rows[0].id
}

async function seed() {
  await ensureCategories()
  await ensureBoutique()
  await ensureHero()
  await ensureHeroSlides()
  await ensureSiteBanner()

  const idsByKey = new Map()
  for (const product of PRODUCTS) {
    const id = await upsertProduct(product)
    idsByKey.set(product.key, id)
  }

  for (const product of PRODUCTS) {
    const id = idsByKey.get(product.key)
    const relatedIds = product.related
      .map((key) => idsByKey.get(key))
      .filter((relatedId) => Number.isInteger(relatedId) && relatedId !== id)
    await pool.query(
      `UPDATE products SET "relatedProductIds" = $1, "updatedAt" = NOW() WHERE id = $2`,
      [JSON.stringify(relatedIds), id],
    )
  }

  const catalogIds = [...idsByKey.values()]
  const leftover = await pool.query(
    `SELECT id, name, brand FROM products WHERE NOT (id = ANY($1::int[]))`,
    [catalogIds],
  )
  if (leftover.rows.length > 0) {
    const leftoverIds = leftover.rows.map((row) => row.id)
    const inOrders = await pool.query(
      `SELECT DISTINCT "productId" FROM order_items WHERE "productId" = ANY($1::int[])`,
      [leftoverIds],
    )
    const locked = new Set(inOrders.rows.map((row) => row.productId))
    const removable = leftoverIds.filter((id) => !locked.has(id))
    if (process.argv.includes('--force') && removable.length > 0) {
      await pool.query(`DELETE FROM products WHERE id = ANY($1::int[])`, [removable])
      console.log(`Removed ${removable.length} leftover product(s) not in the catalog.`)
    } else if (removable.length > 0) {
      await pool.query(
        `UPDATE products SET published = false, featured = false, "updatedAt" = NOW()
         WHERE id = ANY($1::int[])`,
        [removable],
      )
      console.log(`Unpublished ${removable.length} leftover product(s). Use --force to delete.`)
    }
    for (const row of leftover.rows.filter((item) => locked.has(item.id))) {
      await pool.query(
        `UPDATE products SET published = false, featured = false, "updatedAt" = NOW() WHERE id = $1`,
        [row.id],
      )
      console.log(`Kept unpublished "${row.name}" (${row.brand}) — referenced by an order.`)
    }
  }

  const removedCats = await pool.query(
    `DELETE FROM categories WHERE slug = ANY($1::text[]) RETURNING slug`,
    [OLD_CATEGORY_SLUGS],
  )
  if (removedCats.rowCount > 0) {
    console.log(`Removed old categories: ${removedCats.rows.map((row) => row.slug).join(', ')}`)
  }

  console.log(`Seeded ${PRODUCTS.length} home products with related items.`)
  const byCategory = await pool.query(
    `SELECT category, COUNT(*)::int AS count FROM products WHERE published = true GROUP BY category ORDER BY category`,
  )
  for (const row of byCategory.rows) {
    console.log(`  - ${row.category}: ${row.count}`)
  }
}

try {
  await seed()
} catch (err) {
  console.error('Seed failed:', err.message)
  process.exit(1)
} finally {
  await pool.end()
}
