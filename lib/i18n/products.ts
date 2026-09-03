import type { Locale } from '@/lib/i18n/config'

type ProductArCopy = {
  name: string
  description: string
}

const PRODUCT_AR: Record<string, ProductArCopy> = {
  'coussin-velours-sage': {
    name: 'وسادة قطيفة ساج',
    description:
      'وسادة قطيفة ناعمة، تزيّن الكنبة. الغلاف يتنحّى، ومتوفّرة بعدّة مقاسات.',
  },
  'pack-de-3-housses-a-chaussures-impermeables-hc01': {
    name: 'باك 3 أغلفة سبابط ضدّ الماء HC01',
    description:
      'باك فيه 3 أغلفة ضدّ الماء والغبرة باش ترتّبوا وتحموا سبابطيكم. فيهم حبل تسكير ونافذة شفّافة باش تشوفوا المحتوى. صالحين لليومي وللسفرة. المقاس: 28 × 38 صم.',
  },
  'sac-de-rangement-sr01-vetements': {
    name: 'كيس ترتيب SR01 – الحوايج',
    description:
      'كيس ترتيب من قماش ضدّ الماء للحوايج والكتّان. سعة كبيرة 50 × 35 × 30 صم، نافذة شفّافة من قدّام وقباض مقوّية. يتنوى بالسهل كي يفرغ.',
  },
  'galette-de-chaise-capitonnee': {
    name: 'Galette de chaise capitonnée',
    description:
      'Galette de chaise capitonnée وفيها ربطات في الزوايا باش تتثبّت في الكرسي. مادّة التصنيع: مخمل مقاوم للبقع. مريحة للكوزينة، قاعة الأكل ولا البيورو. متوفّرة مربّعة ولا مدوّرة: أحمر، أصفر، أخضر، رمادي، بيج، كحلي، مرون، بوردو وفستقي.',
  },
  'galette-de-chaise-capitonnee-dossier-et-assise': {
    name: 'Galette de chaise capitonnée – dossier et assise',
    description:
      'Galette de chaise capitonnée من جزئين: dossier et assise، مربوطين بثنية باش يلبّسوا الكرسي الكل. مادّة التصنيع: مخمل مقاوم للبقع. أزرار capitonnés، ربطات في الزوايا ومسكة نقل من فوق. مريحة للكوزينة، قاعة الأكل ولا البيورو. متوفّرة في برشا ألوان.',
  },
  'pack-de-4-galettes-de-chaise-rondes-capitonnees': {
    name: 'Pack de 4 galettes de chaise rondes capitonnées',
    description:
      'باك فيه 4 galettes de chaise rondes capitonnées، وفيهم ربطات باش تتثبّتوا في الكرسي. مادّة التصنيع: مخمل مقاوم للبقع. مريحة للكوزينة ولا قاعة الأكل. اختاروا 4 ألوان من المجموعة. التوصيل في كامل تونس.',
  },
  'coussin-de-lecture': {
    name: 'وسادة قراءة',
    description:
      'وسادة قراءة مريحة للفرش ولا الكنبة: ظهر يتسند وروولو رقبة يتنظّم. أزرار على الجنب باش تعدّلوا علوّ مسند الراس. مادّة التصنيع: مخمل مقاوم للبقع. مريحة للقراءة، للتلفزة ولا للراحة. متوفّرة أحمر، أصفر، أخضر، رمادي، بيج، كحلي، مرون، بوردو وفستقي.',
  },
  'coussin-de-canape': {
    name: 'وسادة الكنبة',
    description:
      'وسادة كنبة من مخمل مقاوم للبقع، شكل مستطيل 70 × 40 × 18 صم، حافة باسبوا وغلاف بسحّاب يتنحّى. مادّة ناعمة وكثيفة للصالون. متوفّرة بعدّة ألوان باش تلبّسوا الكنبة ولا الفرش.',
  },
  'coussin-de-tete-de-lit': {
    name: 'وسادة راس السرير',
    description:
      'وسادة راس السرير شكل وتد: ظهر مقبّب باش تقعدوا مريحين في الفرش. جيب على الجنب للتلفون، النظّارات ولا التيلي كوموند. مادّة التصنيع: مخمل مقاوم للبقع. أزرار مغطّاة. مناسبة للقراءة ولا للتلفزة. المقاسات: 90، 120، 140، 160 و 180 صم. متوفّرة أحمر، أصفر، أخضر، رمادي، بيج، كحلي، مرون، بوردو وفستقي.',
  },
  'coussin-decoratif': {
    name: 'وسادة ديكور',
    description:
      'وسادة ديكور مربّعة من ساتان فاخر، للكنبة، للكرسي ولا للفرش. مادّة التصنيع: مخمل مقاوم للبقع. المقاس: 40 × 40 صم. ألوان الورشة: أحمر، أصفر، أخضر، رمادي، بيج، كحلي، مرون، بوردو وفستقي. تُباع بالقطعة ولا بالباك.',
  },
  'coussin-traversin-cylindrique-en-velours': {
    name: 'وسادة أسطوانية من القطيفة',
    description:
      'وسادة أسطوانية من مخمل مقاوم للبقع: لمسة راحة للكنية، للكرسي ولا للفرش. شكل أسطواني بحافة باسبوا، ناعمة وتتماشى مع كل الستيلات. متوفّرة فوشيا، أزرق كهربائي، رمادي فضّي ورمادي غامق. تُباع بالقطعة ولا بالباك.',
  },
  'housse-de-rangement-pour-tapis': {
    name: 'غلاف ترتيب للزربية',
    description:
      'غلاف ترتيب للزربية من قماش متين: يحمي من الغبرة والرطوبة، سهل للترتيب والنقل. تسكيرة بحبل بسيطة وعملية. خمسة مقاسات من 1 م إلى 3 م لكل الزرابي. الألوان: بيج، أسود ورمادي.',
  },
  'oreiller-orthopedique-super-fiesta-65-45-cm': {
    name: 'Oreiller orthopédique Super Fiesta – 65 × 45 صم',
    description:
      'عطاو روحكم ليالي أريح مع الـ Oreiller orthopédique Super Fiesta. يعطي سند قوي ويبقى ناعم ومريح، ويتبع وضعية نومكم بالطبيعي. غلافه ناعم ويتنفّس، فيه سحّاب باش تغسلوه بالسهل. الحشو ليّن ويعطي راحة تدوم. المقاس: 65 × 45 صم. تصميم orthopédique، قماش يتنفّس، غلاف بسحّاب، جودة عالية.',
  },
  'lot-de-5-boites-de-rangement-pliables-grande-capacite-70-60-30-cm': {
    name: '5 Boîtes ترتيب pliables – سعة كبيرة 70 × 60 × 30 صم',
    description:
      'Lot de 5 Boîtes ترتيب pliables من قماش متين. سعة كبيرة 70 × 60 × 30 صم للصندوق، نافذة شفّافة، سحّاب وقباض على الجنب. تحمي من الغبرة والرطوبة. مناسبة للحوايج، الأغطية، اللحاف والكتّان.',
  },
  'lot-de-5-cubes-de-rangement-pliables-50-40-40-cm': {
    name: '5 Cubes ترتيب pliables – 50 × 40 × 40 صم',
    description:
      'Lot de 5 Cubes ترتيب pliables من قماش مبطّن رمادي. المقاس 50 × 40 × 40 صم، نافذة شفّافة، سحّاب قوي وقباض مقوّية. تحمي من الغبرة والرطوبة، وسهلة الطي كي تفرغ. مناسبة للحوايج، الأغطية، اللحاف والمخاد.',
  },
  'housse-de-vetements-protection-rangement': {
    name: 'غلاف الحوايج – حماية وترتيب',
    description:
      'احموا حوايجكم من الغبرة والرطوبة والروايح بالغلاف العملي، المتين واللي يتنفّس. نافذة شفّافة، سحّاب وقباض باش تنقلوه بالسهل. مناسب لتنظيم الخزانة والحفاظ على حوايجكم.',
  },
  'housse-de-rangement-1-2-m-pour-robes-manteaux': {
    name: 'غلاف ترتيب 1.2 م للفساتين والمعاطف',
    description:
      'احموا فساتينكم، معاطفكم والحوايج الطويلة بغلاف ترتيب 1.2 م. قماش متين يدوم، حماية من الغبرة والرطوبة والوسخ. سحّاب قوي، مناسب في الدار وفي السفرة. باك فيه 4 أغلفة.',
  },
  'housse-de-rangement-1-5-m-pour-costumes': {
    name: 'غلاف ترتيب 1.5 م للكوستيمات',
    description:
      'خلّوا كوستيماتكم نقيّة ومحمية بالغلاف 1.5 م. طول كبير للكوستيم، الفستا والحوايج الطويلة. قماش متين، سحّاب قوي، عملي في اليومي وفي السفرة. باك فيه 4 أغلفة.',
  },
  'pack-de-10-housses-de-rangement-pour-chaussures-protection-anti-poussiere': {
    name: 'باك 10 أغلفة سبابط – حماية من الغبرة',
    description:
      'احموا ورتّبوا سبابطيكم بسهولة بباك فيه 10 أغلفة ترتيب. قماش متين ونافذة شفّافة باش تبقوا سبابطكم نقيّة وتعرفوهم بسرعة. تسكيرة عملية، خفيف وما ياخذش بلاصة برشا. مناسبين للدرسينغ، البلاكار ولا الفاليز.',
  },
  'housse-de-protection-pour-robes-de-mariee-robes-de-soiree-1-80-m': {
    name: 'غلاف حماية لفساتين العرس والسهرة – 1.80 م',
    description:
      'احموا فساتينكم الطويلة، فستان العرس وفساتين السهرة بغلاف أنيق ومتين 1.80 م. حماية من الغبرة والرطوبة، سهل للترتيب والنقل. يتستعمل مرّات برشا باش تبقوا فساتينكم نقيّة ومحمية. الألوان: أبيض، أسود وبيج.',
  },
  'organiseur-de-armoire': {
    name: 'منظّم الخزانة',
    description:
      'منظّم خزانة من قماش باش ترتّبوا حوايجكم واقفين: قسم، قطعة. ترتيب أوفر وبلاصة أكبر في الدرسينغ ولا الدرج. مناسب للجين، التيشيرت والحوايج المطويّة. لون رمادي. يُباع بالقطعة ولا بالباك.',
  },
  'rangement-pour-les-sacs-a-main': {
    name: 'ترتيب لساكات اليد',
    description:
      'منظّم معلّق لساكات اليد: رتّبوا ساكاتكم واقفين في الدرسينغ. جيوب شفّافة ومتينة باش تشوفوا وتحموا الساكات. كروشي حديد للخزانة. متوفّر رمادي وأسود. ساكاتكم مرتّبين وفي متناول اليد.',
  },
  'boudin-de-porte': {
    name: 'Boudin de porte',
    description:
      'Boudin de porte وجهين باش يوقف هوا البرّا، الغبرة وينقّص الصوت. سفنج كثيف، غلاف قماش يتغسل، سهل يتحطّ تحت الباب ويتقصّ على الطول اللي تحبوه. المقاسات 82 صم و 92 صم. الألوان: أسود، رمادي غامق، رمادي فاتح، مرون وبيج. بالقطعة ولا باك 3.',
  },
  'protege-matelas-tnt-polypropylene-fermeture-eclair': {
    name: 'Protège-matelas TNT – سحّاب',
    description:
      'احموا الـ Matelas ومتخلّوش على الراحة. Protège-matelas TNT polypropylène يلفّ الـ Matelas الكل بـ fermeture éclair من حول، باش يثبت مليح ويحمي في اليومي. TNT جودة، تثبيت بلا لاستيك، خفيف، متين وسهل للتنظيف. المقاسات: 90×190، 120×190، 140×190، 160×200 و 180×200 صم.',
  },
}

const PRODUCT_AR_BY_NAME: Record<string, ProductArCopy> = Object.fromEntries(
  Object.entries(PRODUCT_AR).map(([, copy]) => {
    return [copy.name, copy]
  }),
)

const PRODUCT_AR_BY_FRENCH_NAME: Record<string, ProductArCopy> = {
  'Coussin velours sage': PRODUCT_AR['coussin-velours-sage'],
  'Pack de 3 Housses à Chaussures Imperméables HC01':
    PRODUCT_AR['pack-de-3-housses-a-chaussures-impermeables-hc01'],
  'Sac de Rangement SR01 - Vêtements': PRODUCT_AR['sac-de-rangement-sr01-vetements'],
  'Galette de chaise capitonnée': PRODUCT_AR['galette-de-chaise-capitonnee'],
  'Galette de chaise capitonnée dossier et assise':
    PRODUCT_AR['galette-de-chaise-capitonnee-dossier-et-assise'],
  'Pack de 4 galettes de chaise rondes capitonnées':
    PRODUCT_AR['pack-de-4-galettes-de-chaise-rondes-capitonnees'],
  'Coussin de lecture': PRODUCT_AR['coussin-de-lecture'],
  'Coussin de canapé': PRODUCT_AR['coussin-de-canape'],
  'Coussin de tête de lit': PRODUCT_AR['coussin-de-tete-de-lit'],
  'Coussin décoratif': PRODUCT_AR['coussin-decoratif'],
  'Coussin traversin cylindrique en velours':
    PRODUCT_AR['coussin-traversin-cylindrique-en-velours'],
  'Housse de rangement pour tapis': PRODUCT_AR['housse-de-rangement-pour-tapis'],
  'Oreiller Orthopédique Super Fiesta – 65 × 45 cm':
    PRODUCT_AR['oreiller-orthopedique-super-fiesta-65-45-cm'],
  'Lot de 5 Boîtes de Rangement Pliables – Grande Capacité 70 × 60 × 30 cm':
    PRODUCT_AR['lot-de-5-boites-de-rangement-pliables-grande-capacite-70-60-30-cm'],
  'Lot de 5 Cubes de Rangement Pliables – 50 × 40 × 40 cm':
    PRODUCT_AR['lot-de-5-cubes-de-rangement-pliables-50-40-40-cm'],
  'Housse de Vêtements – Protection & Rangement':
    PRODUCT_AR['housse-de-vetements-protection-rangement'],
  'Housse de rangement 1.2 m pour Robes & Manteaux':
    PRODUCT_AR['housse-de-rangement-1-2-m-pour-robes-manteaux'],
  'Housse de rangement 1.5 m pour Costumes':
    PRODUCT_AR['housse-de-rangement-1-5-m-pour-costumes'],
  'Pack de 10 Housses de Rangement pour Chaussures – Protection Anti-Poussière':
    PRODUCT_AR['pack-de-10-housses-de-rangement-pour-chaussures-protection-anti-poussiere'],
  'Housse de Protection pour Robes de Mariée & Robes de Soirée – 1,80 m':
    PRODUCT_AR['housse-de-protection-pour-robes-de-mariee-robes-de-soiree-1-80-m'],
  'Organiseur de armoire': PRODUCT_AR['organiseur-de-armoire'],
  'Rangement pour les sacs à main': PRODUCT_AR['rangement-pour-les-sacs-a-main'],
  'Boudin de porte': PRODUCT_AR['boudin-de-porte'],
  'Protège-Matelas TNT Polypropylène – Fermeture Éclair':
    PRODUCT_AR['protege-matelas-tnt-polypropylene-fermeture-eclair'],
}

function copyFor(slug?: string | null, name?: string | null): ProductArCopy | undefined {
  if (slug && PRODUCT_AR[slug]) return PRODUCT_AR[slug]
  if (name && PRODUCT_AR_BY_FRENCH_NAME[name]) return PRODUCT_AR_BY_FRENCH_NAME[name]
  if (name && PRODUCT_AR_BY_NAME[name]) return PRODUCT_AR_BY_NAME[name]
  return undefined
}

export function localizeProductName(name: string, locale: Locale, slug?: string | null) {
  if (locale !== 'ar') return name
  return copyFor(slug, name)?.name ?? name
}

export function localizeProduct<T extends { name: string; slug?: string | null; description?: string | null }>(
  product: T,
  locale: Locale,
): T {
  if (locale !== 'ar') return product
  const copy = copyFor(product.slug, product.name)
  if (!copy) return product
  return {
    ...product,
    name: copy.name,
    description: copy.description,
  }
}

export function localizeProducts<T extends { name: string; slug?: string | null; description?: string | null }>(
  products: T[],
  locale: Locale,
) {
  if (locale !== 'ar') return products
  return products.map((product) => localizeProduct(product, locale))
}
