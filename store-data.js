/* ============================================================================
   HOUSE OF PALAY — EASY EDIT FILE
   ============================================================================
   This is the main file you edit for everyday store changes.

   YOU CAN CHANGE HERE:
   - Product names
   - Product prices
   - Product image filenames
   - Sizes / perfume sizes / hair lengths
   - Free-delivery locations
   - Delivery fee
   - Optional service fee
   - FormSubmit email
   - Make.com webhook links
   - Social media links

   IMPORTANT PAYMENT SECURITY:
   Do NOT paste a PayFast passphrase or any private secret into this file.
   This file is public in the browser. Keep private PayFast credentials inside
   Make.com (or another server-side environment), not in front-end JavaScript.
   ============================================================================ */

window.HOP_CONFIG = {
  storeName: "House of Palay",
  orderPrefix: "HOP",
  currency: "ZAR",
  locale: "en-ZA",

  /* --------------------------------------------------------------------------
     DELIVERY SETTINGS
     --------------------------------------------------------------------------
     FREE DELIVERY AREAS:
     Add another free area by copying one object and changing id/label/aliases.
     Example:
       { id: "sandton", label: "Sandton", aliases: ["sandton"] },

     DELIVERY FEE:
     The R8 below is charged when the customer is outside all free areas.
     -------------------------------------------------------------------------- */
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

  /* OPTIONAL CHECKOUT SERVICE FEE
     Keep this at 0 if you do not want a service fee.
     Example: serviceFee: 5.00, */
  serviceFee: 15.00,

  /* --------------------------------------------------------------------------
     INTEGRATIONS — PASTE YOUR DETAILS HERE LATER
     -------------------------------------------------------------------------- */

  /* FORM SUBMIT
     This email receives a NEW ORDER notification after Make accepts/stores
     the order and before the customer is handed to PayFast. Payment status in
     that email is therefore Pending PayFast Payment. */
  formSubmitEmail: "houseofpalay26@gmail.com",

  /* MAKE.COM WEBHOOK 1 — CREATE ORDER / PREPARE PAYFAST
     Paste your Make Custom Webhook URL inside the quotes.
     The browser sends the checkout order here.
     Make should create/prepare the order and return PayFast payment data. */
  makeCreateOrderWebhook: "https://hook.eu1.make.com/866ou0yv06e6t1y3qasxrzfc94oro5g5",

  /* PAYFAST ITN / NOTIFY WEBHOOK
     This is normally a Make webhook URL used as PayFast's notify_url.
     PayFast calls this URL directly after a transaction. The browser should
     NOT decide whether a payment is approved. */
  /* Leave blank when your Make Webhook Response already sends notify_url
     directly to PayFast (your current setup). If you choose to map this value
     in Make later, paste the SECOND Make ITN webhook URL here — never the
     PayFast /eng/process payment URL. */
  payFastNotifyWebhook: "",

  /* Your live website base URL, e.g. https://houseofpalay.co.za
     Leave blank while testing locally; on a hosted site the browser can infer it. */
  siteUrl: "",

  /* DEVELOPMENT ONLY.
     false = checkout refuses to fake a payment when Make is not configured.
     true  = allows you to test the front-end flow without charging money.
     KEEP FALSE BEFORE LAUNCH. */
  demoMode: false,

  /* SOCIAL / CONTACT LINKS
     Paste your real links/numbers here when ready. The footer icons stay
     visible even while a link is blank, so the Connect section never looks empty. */
  contactEmail: "houseofpalay26@gmail.com",
  whatsappNumber: "27824885007", // PASTE WHATSAPP NUMBER HERE. Example: 27821234567 (country code, no + sign)
  socials: {
    instagram: "https://www.instagram.com/houseofpalayqueens?utm_source=qr", // PASTE FULL INSTAGRAM LINK HERE
    tiktok: "https://vt.tiktok.com/ZSVcteRco/",    // PASTE FULL TIKTOK LINK HERE
    facebook: "https://www.facebook.com/share/1CBQ8AmKNo/?mibextid=wwXIfr"   // PASTE FULL FACEBOOK LINK HERE
  }
};

/* ============================================================================
   PRODUCTS
   ============================================================================
   HOW TO CHANGE A PRODUCT IMAGE:
     image: "FOLDER/FILENAME.jpeg"

   HOW TO CHANGE A PRICE:
     price: 299.99

   HOW TO ADD CLOTHING SIZES:
     sizes: ["S", "M", "L", "XL"]

   HOW TO ADD COLOURS:
     colors: ["Black", "Blue", "Grey"]

   If a product has BOTH sizes and colours, the website will show two separate
   selectors. If it only has one colour, you can leave out the colors line.

   HOW TO ADD OTHER OPTIONS WITH DIFFERENT PRICES:
     options: [
       { label: "50 ml", price: 120 },
       { label: "100 ml", price: 220 }
     ]

   IMPORTANT: Every product needs a UNIQUE id.
   ============================================================================ */

window.HOP_PRODUCTS = [
  {
  id: "special-offer",
  name: "SPECIAL OFFER",
  category: "Special Offer",
  price: 365.00, // CHANGE THIS TO YOUR SPECIAL OFFER PRICE
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
    sizes: ["S", "M", "L", "XL"],
    
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
    sizes: ["S", "M", "L", "XL"],
    
  },
   {
    id: "gym-sweet-trimmer",
    name: "Waist Bandage Sweet Tummy Trimmer Wrap Belt",
    category: "Gym",
    price: 224.99,
    image: "GYM/Waist Bandage Sweet Tummy Trimmer Wrap Belt.jpeg",
    badge: "Popular",
    description: "continuous elastic bandage wrap waist trainer.",
    sizes: ["S", "M", "L", "XL"],
    
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
    id: "perf-Latarffa",
    name: "YARA Lattafa",
    category: "Perfumes",
    price: 120.00,
    image: "PERFUMES/YARA Lattafa.jpeg",
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
