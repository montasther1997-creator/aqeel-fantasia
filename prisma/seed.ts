import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PRODUCTS = [
  ['SHADOW DROP_01', 'قطرة الظل ٠١', 'Built for the nights that never end', 'مصنوع لليالي التي لا تنتهي', 175000, 130, 'hoodies'],
  ['VOID HOODIE', 'هودي الفراغ', 'Disappear into the noise', 'اختفِ في الضوضاء', 195000, 145, 'hoodies'],
  ['CHROME TEE_002', 'تيشيرت كروم ٢', 'Reflect what they fear', 'اعكس ما يخافون منه', 85000, 65, 'tees'],
  ['BLOOD MOON CREW', 'كرو القمر الدامي', 'Howl at the lights', 'عواء تحت الأضواء', 145000, 110, 'sweaters'],
  ['ELECTRIC PHANTOM', 'الشبح الكهربائي', 'Static in the spine', 'كهرباء في العمود', 165000, 125, 'jackets'],
  ['MIDNIGHT CARGO', 'كارغو منتصف الليل', 'Pockets full of secrets', 'جيوب مليئة بالأسرار', 185000, 140, 'pants'],
  ['FANTASIA CAP_BLK', 'قبعة فانتازيا أسود', 'Crown of the underworld', 'تاج العالم السفلي', 55000, 40, 'accessories'],
  ['FROST OVERCOAT', 'معطف الصقيع', 'Cold doesn\'t apologize', 'البرد لا يعتذر', 320000, 240, 'jackets'],
  ['NEON HALO TEE', 'تيشيرت الهالة النيون', 'Light bends around you', 'الضوء ينحني حولك', 95000, 72, 'tees'],
  ['ECHO HOODIE_X', 'هودي الصدى إكس', 'Repeat the legend', 'كرر الأسطورة', 205000, 155, 'hoodies'],
  ['INFERNO ZIP', 'زيب الجحيم', 'Burn quiet, burn long', 'احترق بهدوء، احترق طويلاً', 215000, 160, 'jackets'],
  ['SILVER WIRE PANT', 'بنطلون السلك الفضي', 'Threaded with intent', 'منسوج بنية', 175000, 130, 'pants'],
  ['PHANTOM BAG', 'حقيبة الشبح', 'Carry the silence', 'احمل الصمت', 145000, 110, 'accessories'],
  ['BLACKOUT MASK', 'قناع الإطفاء', 'Identity is a choice', 'الهوية اختيار', 65000, 48, 'accessories'],
  ['VELVET KNIGHT', 'فارس المخمل', 'Soft on the outside', 'ناعم من الخارج', 245000, 185, 'sweaters'],
  ['DUSK PARKA', 'باركا الغسق', 'Wear the hour', 'ارتدِ الساعة', 295000, 220, 'jackets'],
  ['CRIMSON SCARF', 'وشاح القرمز', 'A line in the smoke', 'خط في الدخان', 75000, 55, 'accessories'],
  ['GHOST GLOVES', 'قفازات الشبح', 'Touch nothing, change everything', 'لا تلمس شيئاً، غيّر كل شيء', 85000, 64, 'accessories'],
  ['STORM BOOTS', 'بوت العاصفة', 'Walk through the world', 'امشِ عبر العالم', 385000, 290, 'footwear'],
  ['GLITCH TEE', 'تيشيرت الخلل', 'A bug became a feature', 'خطأ أصبح ميزة', 95000, 72, 'tees'],
  ['MIRAGE SHORTS', 'شورت السراب', 'Almost real', 'تقريباً حقيقي', 115000, 87, 'pants'],
  ['OBSIDIAN BELT', 'حزام السبج', 'Hold the world together', 'امسك العالم سوياً', 95000, 72, 'accessories'],
  ['LUNA HOODIE', 'هودي لونا', 'Whisper to the moon', 'همس للقمر', 185000, 138, 'hoodies'],
  ['VOIDLINE PANT', 'بنطلون خط الفراغ', 'Walk the edge', 'امشِ على الحافة', 165000, 124, 'pants'],
  ['ZERO TEE_BLK', 'تيشيرت الصفر أسود', 'Start from nothing', 'ابدأ من العدم', 75000, 58, 'tees'],
];

const CATEGORIES = [
  { slug: 'hoodies', nameAr: 'هوديز', nameEn: 'Hoodies' },
  { slug: 'tees', nameAr: 'تيشيرتات', nameEn: 'Tees' },
  { slug: 'sweaters', nameAr: 'سوترات', nameEn: 'Sweaters' },
  { slug: 'jackets', nameAr: 'جواكت', nameEn: 'Jackets' },
  { slug: 'pants', nameAr: 'بناطيل', nameEn: 'Pants' },
  { slug: 'footwear', nameAr: 'أحذية', nameEn: 'Footwear' },
  { slug: 'accessories', nameAr: 'إكسسوارات', nameEn: 'Accessories' },
];

const COLLECTIONS = [
  { slug: 'shadow-drop-01', nameAr: 'قطرة الظل ٠١', nameEn: 'SHADOW DROP_01', featured: true },
  { slug: 'phantom-archive', nameAr: 'أرشيف الشبح', nameEn: 'PHANTOM ARCHIVE', featured: true },
  { slug: 'midnight-edition', nameAr: 'إصدار منتصف الليل', nameEn: 'MIDNIGHT EDITION', featured: false },
];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80',
  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80',
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80',
  'https://images.unsplash.com/photo-1564859228273-274232fdb516?w=1200&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80',
  'https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=1200&q=80',
  'https://images.unsplash.com/photo-1542219550-37153d387c27?w=1200&q=80',
  'https://images.unsplash.com/photo-1551803091-e20673f15770?w=1200&q=80',
];

const ARCHIVE = [
  { titleAr: 'حملة الظل', titleEn: 'SHADOW CAMPAIGN', type: 'campaign' },
  { titleAr: 'ليلة الإطلاق', titleEn: 'LAUNCH NIGHT', type: 'reel' },
  { titleAr: 'تحت المدينة', titleEn: 'BENEATH THE CITY', type: 'edit' },
  { titleAr: 'عيون نيون', titleEn: 'NEON EYES', type: 'photo' },
  { titleAr: 'صدى', titleEn: 'ECHO', type: 'reel' },
  { titleAr: 'الفصل الأول', titleEn: 'CHAPTER ONE', type: 'campaign' },
  { titleAr: 'مرايا متشظية', titleEn: 'BROKEN MIRRORS', type: 'photo' },
  { titleAr: 'تردد', titleEn: 'FREQUENCY', type: 'edit' },
  { titleAr: 'الفجر الأسود', titleEn: 'BLACK DAWN', type: 'reel' },
];

const CULT_TIERS = [
  {
    slug: 'bronze', nameAr: 'برونز', nameEn: 'BRONZE', priceIQD: 50000, priceUSD: 38, color: '#CD7F32', order: 1,
    perks: JSON.stringify(['Early access 24h', 'Members-only newsletter', '5% off all drops']),
    descAr: 'الدخول الأول للدائرة', descEn: 'First step into the circle',
  },
  {
    slug: 'silver', nameAr: 'فضي', nameEn: 'SILVER', priceIQD: 130000, priceUSD: 99, color: '#C0C0C8', order: 2,
    perks: JSON.stringify(['Early access 48h', 'Exclusive drops', '10% off', 'Free shipping in Iraq']),
    descAr: 'منعكسات النخبة', descEn: 'Reflections of the elite',
  },
  {
    slug: 'gold', nameAr: 'ذهبي', nameEn: 'GOLD', priceIQD: 320000, priceUSD: 245, color: '#D4AF37', order: 3,
    perks: JSON.stringify(['Early access 7 days', 'Private drops', '15% off', 'Free worldwide shipping', 'Birthday gift']),
    descAr: 'فقط للمختارين', descEn: 'Only for the chosen',
  },
  {
    slug: 'black', nameAr: 'أسود', nameEn: 'BLACK', priceIQD: 950000, priceUSD: 720, color: '#0A0A0A', order: 4,
    perks: JSON.stringify(['Lifetime priority', 'Custom pieces', '25% off', 'Private events', 'Direct line to Aqeel', 'Numbered editions']),
    descAr: 'الطبقة المخفية. لا تُرى. لا تُنسى.', descEn: 'The hidden tier. Unseen. Unforgettable.',
  },
];

const SHIPPING_ZONES = [
  { nameAr: 'بغداد', nameEn: 'Baghdad', governorates: JSON.stringify(['Baghdad','بغداد']), priceIQD: 5000, priceUSD: 4, etaDays: '1-2' },
  { nameAr: 'المحافظات الجنوبية', nameEn: 'Southern Governorates', governorates: JSON.stringify(['Basra','Najaf','Karbala','Dhi Qar','Maysan','Muthanna','Al-Qadisiyyah','البصرة','النجف','كربلاء','ذي قار','ميسان','المثنى','القادسية']), priceIQD: 8000, priceUSD: 6, etaDays: '2-4' },
  { nameAr: 'المحافظات الشمالية', nameEn: 'Northern Governorates', governorates: JSON.stringify(['Erbil','Sulaymaniyah','Dohuk','Kirkuk','Nineveh','أربيل','السليمانية','دهوك','كركوك','نينوى']), priceIQD: 10000, priceUSD: 8, etaDays: '3-5' },
  { nameAr: 'المحافظات الوسطى', nameEn: 'Central Governorates', governorates: JSON.stringify(['Babylon','Wasit','Saladin','Diyala','Anbar','بابل','واسط','صلاح الدين','ديالى','الأنبار']), priceIQD: 7000, priceUSD: 5.5, etaDays: '2-3' },
];

const SETTINGS = [
  { key: 'site.name', value: 'AQEEL FANTASIA', group: 'general' },
  { key: 'site.tagline_ar', value: 'العالم الذي تختاره', group: 'general' },
  { key: 'site.tagline_en', value: 'The world you choose', group: 'general' },
  { key: 'site.email', value: 'contact@aqeelfantasia.com', group: 'general' },
  { key: 'site.phone', value: '+964 770 000 0000', group: 'general' },
  { key: 'site.instagram', value: 'aqeelfantasia', group: 'social' },
  { key: 'site.tiktok', value: 'aqeelfantasia', group: 'social' },
  { key: 'site.youtube', value: 'aqeelfantasia', group: 'social' },
  { key: 'currency.default', value: 'IQD', group: 'currency' },
  { key: 'currency.usd_rate', value: '1310', group: 'currency' },
  { key: 'features.sound_enabled', value: 'true', group: 'features' },
  { key: 'features.3d_enabled', value: 'true', group: 'features' },
];

const SITE_CONTENT = [
  { key: 'gate.kicker', valueAr: 'مرحباً في العالم', valueEn: 'Welcome to the world', group: 'gate' },
  { key: 'gate.title1', valueAr: 'هذه ليست', valueEn: 'THIS IS NOT', group: 'gate' },
  { key: 'gate.title2', valueAr: 'علامة تجارية', valueEn: 'A BRAND', group: 'gate' },
  { key: 'gate.title3', valueAr: 'هذا عالم', valueEn: 'THIS IS A WORLD', group: 'gate' },
  { key: 'gate.cta', valueAr: 'ادخل فانتازيا', valueEn: 'ENTER FANTASIA', group: 'gate' },
  { key: 'gate.video', valueAr: '/videos/hero.mp4', valueEn: '/videos/hero.mp4', type: 'video', group: 'gate' },
  { key: 'identity.quote', valueAr: 'الفنتازيا ليست هروباً. إنها قوة.', valueEn: "Fantasy is not escape. It's power.", group: 'identity' },
  { key: 'identity.philosophy', valueAr: 'نحن نصنع للذين يعيشون بين الظل والضوء. للذين لا يطلبون الإذن.', valueEn: "Built for those who live between shadow and light. Those who don't ask for permission.", group: 'identity' },
  { key: 'identity.subhead', valueAr: 'ولدنا في الظلام. تعلمنا الجمال من الندبات.', valueEn: 'Born in the dark. Learned beauty from the scars.', group: 'identity' },
  { key: 'archive.subtitle', valueAr: 'خزانة الذكريات والصور المتحركة', valueEn: 'A vault of memory and motion', group: 'archive' },
  { key: 'cult.headline', valueAr: 'انضم إلى الدائرة', valueEn: 'JOIN THE CIRCLE', group: 'cult' },
  { key: 'signal.headline', valueAr: 'بث تحت الأرض', valueEn: 'UNDERGROUND TRANSMISSIONS', group: 'signal' },
];

async function main() {
  console.log('🌑 Seeding AQEEL FANTASIA...');

  // Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@aqeelfantasia.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Fantasia@2026';
  const adminHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail.toLowerCase() },
    create: { email: adminEmail.toLowerCase(), password: adminHash, name: 'AQEEL', role: 'superadmin' },
    update: { password: adminHash },
  });
  console.log(`✓ Admin seeded: ${adminEmail} (password from $ADMIN_PASSWORD)`);

  // Settings
  for (const s of SETTINGS) {
    await prisma.setting.upsert({ where: { key: s.key }, create: s, update: { value: s.value } });
  }
  console.log(`✓ ${SETTINGS.length} settings`);

  // Site content
  for (const c of SITE_CONTENT) {
    await prisma.siteContent.upsert({
      where: { key: c.key },
      create: { ...c, type: c.type ?? 'text' } as any,
      update: { valueAr: c.valueAr, valueEn: c.valueEn },
    });
  }
  console.log(`✓ ${SITE_CONTENT.length} content keys`);

  // Categories
  await prisma.category.deleteMany({});
  for (let i = 0; i < CATEGORIES.length; i++) {
    await prisma.category.create({ data: { ...CATEGORIES[i], order: i } });
  }
  console.log(`✓ ${CATEGORIES.length} categories`);

  // Collections
  await prisma.collection.deleteMany({});
  for (let i = 0; i < COLLECTIONS.length; i++) {
    await prisma.collection.create({ data: { ...COLLECTIONS[i], order: i } });
  }
  console.log(`✓ ${COLLECTIONS.length} collections`);

  // Cult tiers
  await prisma.cultTier.deleteMany({});
  for (const t of CULT_TIERS) await prisma.cultTier.create({ data: t });
  console.log(`✓ ${CULT_TIERS.length} cult tiers`);

  // Shipping
  await prisma.shippingZone.deleteMany({});
  for (let i = 0; i < SHIPPING_ZONES.length; i++) {
    await prisma.shippingZone.create({ data: { ...SHIPPING_ZONES[i], order: i } });
  }
  console.log(`✓ ${SHIPPING_ZONES.length} shipping zones`);

  // Products
  await prisma.product.deleteMany({});
  const cats = await prisma.category.findMany();
  const cols = await prisma.collection.findMany();

  for (let i = 0; i < PRODUCTS.length; i++) {
    const [nameEn, nameAr, taglineEn, taglineAr, priceIQD, priceUSD, catSlug] = PRODUCTS[i];
    const cat = cats.find((c) => c.slug === catSlug);
    const col = cols[i % cols.length];
    const slug = (nameEn as string).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const product = await prisma.product.create({
      data: {
        slug, sku: `FNT-${1000 + i}`,
        nameAr: nameAr as string, nameEn: nameEn as string,
        taglineAr: taglineAr as string, taglineEn: taglineEn as string,
        descAr: `${taglineAr}. قطعة محدودة من عالم AQEEL FANTASIA. صناعة فاخرة، تفاصيل خفية، وروح ليلية لا تهدأ.`,
        descEn: `${taglineEn}. A limited piece from the AQEEL FANTASIA world. Premium construction, subtle detailing, and a restless nocturnal spirit.`,
        priceIQD: priceIQD as number, priceUSD: priceUSD as number,
        compareIQD: Math.round((priceIQD as number) * 1.3), compareUSD: Math.round((priceUSD as number) * 1.3),
        stock: 25 + Math.floor(Math.random() * 50),
        featured: i < 6, isNew: i < 8, isLimited: i % 4 === 0,
        categoryId: cat?.id, collectionId: col?.id,
        order: i,
        images: {
          create: [
            { url: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length], order: 0 },
            { url: PLACEHOLDER_IMAGES[(i + 3) % PLACEHOLDER_IMAGES.length], order: 1 },
            { url: PLACEHOLDER_IMAGES[(i + 7) % PLACEHOLDER_IMAGES.length], order: 2 },
          ],
        },
        variants: {
          create: ['S', 'M', 'L', 'XL'].map((size) => ({
            size, stock: 5 + Math.floor(Math.random() * 15),
          })),
        },
      },
    });
  }
  console.log(`✓ ${PRODUCTS.length} products with images & variants`);

  // Archive
  await prisma.archiveItem.deleteMany({});
  for (let i = 0; i < ARCHIVE.length; i++) {
    await prisma.archiveItem.create({
      data: {
        ...ARCHIVE[i],
        cover: PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length],
        order: i,
      },
    });
  }
  console.log(`✓ ${ARCHIVE.length} archive items`);

  console.log('✨ Seed complete.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
