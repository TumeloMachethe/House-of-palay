/* ============================================================================
   HOUSE OF PALAY — EASY EDIT FILE
   ============================================================================
   Edit product names, prices, images, sizes, delivery, fees and links here.

   IMPORTANT PAYMENT SECURITY:
   Do NOT paste a PayFast passphrase or any private secret into this file.
   This file is public in the browser. Keep private PayFast credentials inside
   Make.com (or another server-side environment).
   ============================================================================ */

window.HOP_CONFIG = {
  storeName: "House of Palay",
  orderPrefix: "HOP",
  currency: "ZAR",
  locale: "en-ZA",

  /* DELIVERY: the fee below is charged outside all free areas. */
  deliveryFee: 60.00,
  freeDeliveryAreas: [
    {
      id: "joburg-cbd",
      label: "Johannesburg CBD",
      aliases: ["johannesburg cbd", "joburg cbd", "jhb cbd", "johannesburg central"]
    },
    {
      id: "port-elizabeth",
      label: "Port Elizabeth / Gqeberha",
      aliases: ["port elizabeth", "gqeberha", "pe", "port elizabeth eastern cape"]
    }
  ],

  /* OPTIONAL CHECKOUT SERVICE FEE (0 = none) */
  serviceFee: 15.00,

  /* FormSubmit: receives a NEW ORDER notification (status: Pending PayFast Payment). */
  formSubmitEmail: "houseofpalay26@gmail.com",

  /* Make.com webhook 1 — create order / prepare PayFast. */
  makeCreateOrderWebhook: "https://hook.eu1.make.com/866ou0yv06e6t1y3qasxrzfc94oro5g5",

  /* Leave blank when Make already sends notify_url directly to PayFast. */
  payFastNotifyWebhook: "",

  /* Live website base URL. Leave blank to infer it in the browser. */
  siteUrl: "",

  /* DEVELOPMENT ONLY. KEEP FALSE BEFORE LAUNCH. */
  demoMode: false,

  contactEmail: "houseofpalay@gmail.com",
  whatsappNumber: "27824885007",
  socials: {
    instagram: "https://www.instagram.com/houseofpalayqueens?utm_source=qr",
    tiktok: "https://vt.tiktok.com/ZSVcteRco/",
    facebook: "https://www.facebook.com/share/1CBQ8AmKNo/?mibextid=wwXIfr"
  }
};

/* ============================================================================
   PRODUCTS — every product needs a UNIQUE id.
   Use sizes / colors / options as before.
   hiddenFromShop: true hides a product from the shop pages.
   ============================================================================ */

window.HOP_PRODUCTS = [
  {
  id: "special-offer",
  name: "SPECIAL OFFER",
  category: "Special Offer",
  price: 365.00,
  image: "sale.jpeg",
  badge: "SPECIAL",
  description: "House of Palay special offer.",
  hiddenFromShop: true
},
  /* ============================== EYELASHES ============================== */
  {
    id: "lash-band-natural",
    name: "Natural Muse Band Lashes",
    category: "Eyelashes",
    price: 84.99,
    image: "EYELASHES/band.jpeg",
    badge: "Natural",
    description: "Soft everyday band lashes for a clean feminine finish."
  },
  {
    id: "lash-band-glam",
    name: "Wispy Queen Band Lashes",
    category: "Eyelashes",
    price: 84.99,
    image: "EYELASHES/Bandlashes.jpeg",
    badge: "Popular",
    description: "Lightweight wispy lashes with elegant length and definition."
  },
  {
    id: "lash-diy-extension",
    name: "DIY Lash Extension Kit",
    category: "Eyelashes",
    price: 119.99,
    image: "EYELASHES/DIYLASHEXTENSIONKIT (2).jpeg",
    badge: "Kit",
    description: "An easy at-home lash extension kit for a fuller lash look."
  },
  {
    id: "lash-2-in-1-set",
    name: "DIY Lash 2-in-1 design",
    category: "Eyelashes",
    price: 19.99,
    image: "EYELASHES/DIYSET.jpeg",
    badge: "New",
    description: "A complete DIY lash set made for convenient glam at home."
  },

  /* ================================= GYM ================================= */
  {
    id: "gym-aurora",
    name: "Aurora High Waisted Seamless Leggings",
    category: "Gym",
    price: 149.99,
    image: "GYM/Aurora High waitsted seamless leggings.jpeg",
    badge: "New",
    description: "High-waisted seamless activewear designed to move comfortably with you.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Blue", "Grey"]
  },
  {
    id: "gym-ladies-zipper",
    name: "Ladies Zipper Active Set",
    category: "Gym",
    price: 299.99,
    image: "GYM/Ladies Zipper Active Set.jpeg",
    badge: "Popular",
    description: "A sleek zip-front active set for gym sessions and everyday athleisure.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "gym-pink-flare",
    name: "Pink Zip Up Flare Activewear Set",
    category: "Gym",
    price: 299.99,
    image: "GYM/Pink Zip Up Flare activewear set.jpeg",
    badge: "Statement",
    description: "A feminine zip-up flare activewear set with a confident silhouette.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "gym-purple-yoga",
    name: "Purple Zip Up Yoga Activewear",
    category: "Gym",
    price: 299.99,
    image: "GYM/Purple Zip up Yoga active wear.jpeg",
    badge: "Easy Move",
    description: "Comfortable yoga-inspired activewear with a fitted zip-up finish.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "gym-sculptfit",
    name: "SculptFit High Waisted Leggings",
    category: "Gym",
    price: 149.99,
    image: "GYM/SculptFit High Waisted Leggings.jpeg",
    badge: "Sculpt",
    description: "Supportive high-waisted leggings designed for a sculpted fit.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Orange", "White"]
  },
  {
    id: "gym-Woo-Corset",
    name: "Woo Waist Trainer Corset",
    category: "Gym",
    price: 249.99,
    image: "GYM/Woo Waist Trainer Corset.jpeg",
    badge: "Popular",
    description: "dual-strap sweat waist trainer designed for fitness, core support, and temporary abdominal contouring.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "gym-sweet-trimmer",
    name: "Waist Bandage Sweet Tummy Trimmer Wrap Belt",
    category: "Gym",
    price: 224.99,
    image: "GYM/Waist Bandage Sweet Tummy Trimmer Wrap Belt.jpeg",
    badge: "Popular",
    description: "continuous elastic bandage wrap waist trainer.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "gym-Waist-slimming",
    name: "Waist Trainer belly slimming belt",
    category: "Gym",
    price: 299.99,
    image: "GYM/Waist Trainer belly slimming belt.jpeg",
    badge: "Easy Move",
    description: "a heavy-duty underbust garment engineered for intense midsection compression and posture support.",
    sizes: ["S", "M", "L", "XL"]
  },

  /* ================================= HAIR ================================ */
  /* Hair is now LIVE: hiddenFromShop has been removed from these products. */
  {
    id: "hair-bone-straight",
    name: "Bone Straight Frontal Hair",
    category: "Hair",
    price: 1000.00,
    image: "HAIR/Bone Straight frontal hair.jpeg",
    badge: "Signature",
    description: "Silky bone-straight frontal hair with a polished finish.",
    options: [
      { label: "12 inch", price: 1000 },
      { label: "14 inch", price: 1200 },
      { label: "16 inch", price: 1400 },
      { label: "20 inch", price: 1600 }
    ]
  },
  {
    id: "hair-chocolate-bob",
    name: "Chocolate Brown Middle Part Bob Wig",
    category: "Hair",
    price: 1000.00,
    image: "HAIR/Chocolate Brown Straight Middle Part bob Wig.jpeg",
    badge: "Popular",
    description: "A sleek chocolate-brown middle-part bob with an elegant finish.",
    options: [
      { label: "12 inch", price: 1000 },
      { label: "14 inch", price: 1200 },
      { label: "16 inch", price: 1400 },
      { label: "20 inch", price: 1600 }
    ]
  },
  {
    id: "hair-curly-bob",
    name: "Curly Bob Cut Wig",
    category: "Hair",
    price: 1000.00,
    image: "HAIR/Curly Bob Cut Wig.jpeg",
    badge: "New",
    description: "A defined curly bob for a soft, full and confident look.",
    options: [
      { label: "12 inch", price: 1000 },
      { label: "14 inch", price: 1200 },
      { label: "16 inch", price: 1400 },
      { label: "20 inch", price: 1600 }
    ]
  },

  /* =============================== PERFUMES ============================== */
  {
    id: "perf-amethyst",
    name: "AMETHYST",
    category: "Perfumes",
    price: 120.00,
    image: "PERFUMES/amethyst.jpeg",
    badge: "New",
    description: "A warm feminine fragrance with an elegant signature finish.",
    options: [
      { label: "50 ml", price: 120.00 },
      { label: "100 ml", price: 220.00 }
    ]
  },
  {
    id: "perf-EAU",
    name: "EAU DE PARFUM",
    category: "Perfumes",
    price: 120.00,
    image: "PERFUMES/EAU DE PARFUM.jpeg",
    badge: "New",
    description: "Natural Spray.",
    options: [
      { label: "50 ml", price: 120.00 },
      { label: "100 ml", price: 220.00 }
    ]
  },
  {
    id: "perf-HAYAATI",
    name: "HAYAATI Rose",
    category: "Perfumes",
    price: 120.00,
    image: "PERFUMES/HAYAATI Rose.jpeg",
    badge: "New",
    description: "Natural Spray.",
    options: [
      { label: "50 ml", price: 120.00 },
      { label: "100 ml", price: 220.00 }
    ]
  },
  {
    id: "perf-Latarffa",
    name: "Yara Latarffa",
    category: "Perfumes",
    price: 120.00,
    image: "PERFUMES/Yara Latarffa.jpeg",
    badge: "New",
    description: "Spray with pride.",
    options: [
      { label: "50 ml", price: 120.00 },
      { label: "100 ml", price: 220.00 }
    ]
  },
  {
    id: "perf-Latarffa-pink",
    name: "YARA Lattafa pink",
    category: "Perfumes",
    price: 120.00,
    image: "PERFUMES/YARA Lattafa pink.jpeg",
    badge: "New",
    description: "Smell like a Queen.",
    options: [
      { label: "50 ml", price: 120.00 },
      { label: "100 ml", price: 220.00 }
    ]
  },
  {
    id: "perf-yara",
    name: "YARA",
    category: "Perfumes",
    price: 120.00,
    image: "PERFUMES/yara.jpeg",
    badge: "New",
    description: "A feminine fragrance with a soft and glamorous signature.",
    options: [
      { label: "50 ml", price: 120.00 },
      { label: "100 ml", price: 220.00 }
    ]
  },
  {
    id: "perf-noble-blush",
    name: "Noble Blush",
    category: "Perfumes",
    price: 120.00,
    image: "PERFUMES/noble.jpeg",
    badge: "New",
    description: "A polished feminine fragrance with a delicate, elegant finish.",
    options: [
      { label: "50 ml", price: 120.00 },
      { label: "100 ml", price: 220.00 }
    ]
  },
  {
    id: "perf-wicked",
    name: "WICKED",
    category: "Perfumes",
    price: 135.00,
    image: "PERFUMES/wicked.jpeg",
    badge: "New",
    description: "Smell like a queen.",
    options: ["80 ml"]
  },
  {
    id: "perf-arya",
    name: "ARYA",
    category: "Perfumes",
    price: 135.00,
    image: "PERFUMES/ARYA.jpeg",
    badge: "Elegant",
    description: "A soft and elegant fragrance with a warm feminine finish.",
    options: ["80 ml"]
  },
  {
    id: "perf-berry",
    name: "Berry",
    category: "Perfumes",
    price: 135.00,
    image: "PERFUMES/Berry.jpeg",
    badge: "Sweet",
    description: "A playful fruity fragrance with sweet berry-inspired notes.",
    options: ["80 ml"]
  },
  {
    id: "perf-candle",
    name: "Candle",
    category: "Perfumes",
    price: 135.00,
    image: "PERFUMES/candle.jpeg",
    badge: "Warm",
    description: "A warm and comforting scent with a smooth, sophisticated character.",
    options: ["80 ml"]
  },
  {
    id: "perf-flawless",
    name: "Flawless",
    category: "Perfumes",
    price: 135.00,
    image: "PERFUMES/flawless.jpeg",
    badge: "Popular",
    description: "A confident feminine fragrance for an effortlessly polished impression.",
    options: ["80 ml"]
  },
  {
    id: "perf-gorgeous",
    name: "Gorgeous",
    category: "Perfumes",
    price: 135.00,
    image: "PERFUMES/gorgeous.jpeg",
    badge: "Queen Pick",
    description: "A charming feminine fragrance made for confident everyday wear.",
    options: ["80 ml"]
  },
  {
    id: "perf-on-my-way",
    name: "On My Way",
    category: "Perfumes",
    price: 135.00,
    image: "PERFUMES/onmyway.jpeg",
    badge: "Fresh",
    description: "A fresh and uplifting fragrance made for everyday confidence.",
    options: ["80 ml"]
  },
  {
    id: "perf-sugar",
    name: "Sugar",
    category: "Perfumes",
    price: 135.00,
    image: "PERFUMES/sugar.jpeg",
    badge: "Sweet",
    description: "A sweet fragrance with a soft and playful feminine touch.",
    options: ["80 ml"]
  },
  {
    id: "perf-sweet",
    name: "Sweet",
    category: "Perfumes",
    price: 135.00,
    image: "PERFUMES/sweet.jpeg",
    badge: "Charming",
    description: "A delicate, inviting fragrance with a sweet finish.",
    options: ["80 ml"]
  },

  /* ================================= PJs ================================= */
  {
    id: "pj-black-white",
    name: "Black & White Lounge Set",
    category: "PJ",
    price: 249.99,
    image: "PJ/BW.jpeg",
    badge: "Classic",
    description: "A comfortable black-and-white lounge set with a clean finish.",
    options: ["S", "M", "L", "XL"],
    colors: ["Black", "White"]
  },
  {
    id: "pj-blue",
    name: "Royal Blue Satin Set",
    category: "PJ",
    price: 299.99,
    image: "PJ/Pblue.jpeg",
    badge: "Royal",
    description: "A rich blue satin set for soft luxury at home.",
    options: ["S", "M", "L", "XL"]
  },
  {
    id: "pj-pink",
    name: "Blush Pink Satin Set",
    category: "PJ",
    price: 299.99,
    image: "PJ/Ppink.jpeg",
    badge: "Soft Luxury",
    description: "A feminine blush-pink satin set with elegant detailing.",
    options: ["S", "M", "L", "XL"]
  },
  {
    id: "pj-red",
    name: "Ruby Red Satin Set",
    category: "PJ",
    price: 299.99,
    image: "PJ/Pred.jpeg",
    badge: "Statement",
    description: "A bold ruby-red satin set made for confident nights in.",
    options: ["S", "M", "L", "XL"]
  },

  /* ================================= NAILS ================================ */
  {
    id: "nails-acrylic-1",
    name: "BlingGirl Acrylic Powder 01",
    category: "Nails",
    price: 59.99,
    image: "NAILS/b1.jpeg",
    badge: "Everyday",
    description: "BlingGirl acrylic powder for creating polished nail sets."
  },
  {
    id: "nails-acrylic-3",
    name: "BlingGirl Rose Gold Acrylic Powder",
    category: "Nails",
    price: 59.99,
    image: "NAILS/b3.jpeg",
    badge: "Everyday",
    description: "BlingGirl acrylic powder for creating polished nail sets."
  },
  {
    id: "nails-acrylic-2",
    name: "BlingGirl Acrylic Powder 02",
    category: "Nails",
    price: 59.99,
    image: "NAILS/b2.jpeg",
    badge: "Classic",
    description: "A second BlingGirl acrylic powder shade for your nail collection."
  },
  {
    id: "nails-top-soak",
    name: "BlingGirl Top Soak for Each",
    category: "Nails",
    price: 54.99,
    image: "NAILS/Bling.jpeg",
    badge: "Finish",
    description: "A glossy finishing product for a polished manicure look.",
    colors: ["Stucture top", "Flawless", "Sticky", "Strong Base", "Stay Shiny"]
  },
  {
    id: "nails-top-polis",
    name: "BlingGirl Gel polish for Each",
    category: "Nails",
    price: 44.99,
    image: "NAILS/blinggirl.jpeg",
    badge: "Finish",
    description: "A glossy finishing product for a polished manicure look.",
    colors: ["Dusty Rose", "Coral Pink", "Classic Red", "Fuchsia", "Dark Berry"]
  },
  {
    id: "nails-beginner-kit",
    name: "Beginner Nail Kit",
    category: "Nails",
    price: 549.99,
    image: "NAILS/Beginnersnailkit.jpeg",
    badge: "Kit",
    description: "A beginner-friendly nail kit with essentials to get started."
  }
];
