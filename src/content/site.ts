import type { SiteConfig } from "./types";

// Configuración de ejemplo: "Mallow & Crumb", pastelería de marca FICTICIA.
// Datos, dirección, teléfono y reseñas son de muestra.
export const site: SiteConfig = {
  brand: {
    name: "Mallow & Crumb",
    type: "bakery",
    tagline: "Postres hechos bajo pedido",
    colors: { primary: "#3b2a24", accent: "#c26a4a" },
  },
  seo: {
    title: "Mallow & Crumb | Pastelería y postres bajo pedido",
    description:
      "Pasteles personalizados, postres de vitrina y mesas de postres para tus eventos. Pide por WhatsApp o cotiza en línea.",
  },
  nav: { menuLabel: "Pastelería" },
  cateringIntro: {
    eyebrow: "Eventos y mesas",
    title: "Tu celebración, endulzada",
    titleEmphasis: "endulzada",
    subtitle:
      "Paquetes por persona para reuniones, bodas y festejos. Cotizamos según tu fecha y el número de invitados.",
  },
  menuIntro: {
    eyebrow: "Nuestra carta",
    title: "Hecho a mano, cada día",
    titleEmphasis: "a mano",
    subtitle:
      "Pasteles por encargo, postres de vitrina y panadería. También armamos pedidos grandes de postres para tus eventos.",
  },
  sections: {
    featured: true,
    customizer: true,
    catering: true,
    gallery: true,
    testimonials: true,
    faq: true,
  },
  hero: {
    title: "Postres que se quedan en la memoria",
    titleEmphasis: "se quedan",
    subtitle:
      "Pasteles personalizados y postres artesanales, hechos bajo pedido para tus celebraciones.",
    image: {
      src: "/images/hero-1080.webp",
      srcSet:
        "/images/hero-720.webp 720w, /images/hero-1080.webp 1080w, /images/hero-1440.webp 1440w, /images/hero-1920.webp 1920w",
      sizes: "100vw",
      width: 1080,
      height: 1493,
      alt: "Tarta de frutos rojos con fresas, moras y arándanos sobre un plato blanco",
    },
    ctaLabel: "Pedir por WhatsApp",
  },
  menu: [
    {
      id: "pasteles",
      name: "Pasteles y tartas por encargo",
      items: [
        {
          id: "pastel-vainilla-frutos-rojos",
          name: "Pastel de vainilla y frutos rojos",
          description:
            "Bizcocho de vainilla, crema ligera y mermelada de frutos rojos.",
          image: {
            src: "/images/menu/pastel-vainilla-frutos-rojos-480.webp",
            srcSet:
              "/images/menu/pastel-vainilla-frutos-rojos-240.webp 240w, /images/menu/pastel-vainilla-frutos-rojos-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Tarta de frutos rojos con fresas, moras y arándanos sobre un plato blanco",
          },
          price: 480,
          priceFrom: true,
        },
        {
          id: "pastel-chocolate-ganache",
          name: "Pastel de chocolate con ganache",
          description:
            "Bizcocho húmedo de chocolate cubierto de ganache semiamargo.",
          image: {
            src: "/images/menu/pastel-chocolate-ganache-480.webp",
            srcSet:
              "/images/menu/pastel-chocolate-ganache-240.webp 240w, /images/menu/pastel-chocolate-ganache-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Pastel de mousse de chocolate con cobertura de ganache y trufas espolvoreadas de cacao",
          },
          price: 520,
          priceFrom: true,
        },
        {
          id: "pastel-red-velvet",
          name: "Red velvet con queso crema",
          description:
            "Clásico red velvet con betún de queso crema y vainilla.",
          image: {
            src: "/images/menu/pastel-red-velvet-480.webp",
            srcSet:
              "/images/menu/pastel-red-velvet-240.webp 240w, /images/menu/pastel-red-velvet-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Pastel de bizcocho rojo con betún blanco, decorado con fresas, frambuesas y grosellas",
          },
          price: 540,
          priceFrom: true,
        },
      ],
    },
    {
      id: "vitrina",
      name: "Postres de vitrina",
      items: [
        {
          id: "mallow-tostado",
          name: "Mallow tostado con crumb",
          description:
            "Malvavisco casero tostado sobre base de galleta crujiente y chocolate.",
          image: {
            src: "/images/menu/mallow-tostado-480.webp",
            srcSet:
              "/images/menu/mallow-tostado-240.webp 240w, /images/menu/mallow-tostado-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Postres individuales coronados con merengue tostado en tazas de cerámica",
          },
          price: 85,
        },
        {
          id: "tarta-limon",
          name: "Tarta de limón con merengue",
          description: "Masa sablée, crema de limón y merengue flameado.",
          image: {
            src: "/images/menu/tarta-limon-480.webp",
            srcSet:
              "/images/menu/tarta-limon-240.webp 240w, /images/menu/tarta-limon-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Tarta amarilla de limón decorada con rodajas de limón, arándanos y menta",
          },
          price: 95,
        },
        {
          id: "brownie-amargo",
          name: "Brownie de chocolate amargo",
          description: "Húmedo, intenso y con nuez tostada.",
          image: {
            src: "/images/menu/brownie-amargo-480.webp",
            srcSet:
              "/images/menu/brownie-amargo-240.webp 240w, /images/menu/brownie-amargo-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Dos brownies de chocolate con nueces junto a arándanos azules",
          },
          price: 75,
          tags: ["contiene-nueces"],
        },
        {
          id: "cheesecake-frutos-rojos",
          name: "Cheesecake de frutos rojos",
          description:
            "Cremoso, sobre base de galleta y salsa de frutos rojos.",
          image: {
            src: "/images/menu/cheesecake-frutos-rojos-480.webp",
            srcSet:
              "/images/menu/cheesecake-frutos-rojos-240.webp 240w, /images/menu/cheesecake-frutos-rojos-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Cheesecake con salsa de frutos rojos, zarzamoras, frambuesas y menta",
          },
          price: 110,
        },
        {
          id: "flan-vainilla",
          name: "Flan de vainilla",
          description: "Receta clásica con caramelo oscuro.",
          image: {
            src: "/images/menu/flan-vainilla-480.webp",
            srcSet:
              "/images/menu/flan-vainilla-240.webp 240w, /images/menu/flan-vainilla-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Flan de vainilla con caramelo, al que le falta una rebanada",
          },
          price: 70,
          tags: ["sin-gluten"],
        },
      ],
    },
    {
      id: "panaderia",
      name: "Galletas y panes dulces",
      items: [
        {
          id: "croissant-almendra",
          name: "Croissant de almendra",
          description: "Hojaldre mantequilloso con crema de almendra.",
          image: {
            src: "/images/menu/croissant-almendra-480.webp",
            srcSet:
              "/images/menu/croissant-almendra-240.webp 240w, /images/menu/croissant-almendra-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Croissant con almendra laminada y azúcar glass",
          },
          price: 65,
          tags: ["contiene-nueces"],
        },
        {
          id: "concha-crema",
          name: "Concha rellena de crema",
          description: "Concha de vainilla con crema pastelera.",
          price: 55,
        },
        {
          id: "galleta-vegana",
          name: "Galleta vegana de chocolate",
          description: "Con chispas de chocolate y sal de mar.",
          image: {
            src: "/images/menu/galleta-vegana-480.webp",
            srcSet:
              "/images/menu/galleta-vegana-240.webp 240w, /images/menu/galleta-vegana-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Pila de galletas de chocolate con la superficie craquelada",
          },
          price: 50,
          tags: ["vegano", "sin-lactosa"],
        },
      ],
    },
  ],
  featured: {
    eyebrow: "Lo más pedido",
    title: "Favoritos de la casa",
    titleEmphasis: "de la casa",
    subtitle: "Tres antojos que no pueden faltar en tu mesa.",
    itemIds: [
      "mallow-tostado",
      "cheesecake-frutos-rojos",
      "croissant-almendra",
    ],
  },
  customizer: {
    title: "Arma tu pastel",
    sizes: [
      { id: "mini", label: "Mini (6 porciones)", servings: 6, price: 480 },
      {
        id: "mediano",
        label: "Mediano (12 porciones)",
        servings: 12,
        price: 780,
      },
      {
        id: "grande",
        label: "Grande (20 porciones)",
        servings: 20,
        price: 1150,
      },
    ],
    flavors: [
      { id: "vainilla", label: "Vainilla" },
      { id: "chocolate", label: "Chocolate" },
      { id: "red-velvet", label: "Red velvet", extraPrice: 60 },
      { id: "zanahoria", label: "Zanahoria con nuez", extraPrice: 40 },
    ],
    fillings: [
      { id: "crema-vainilla", label: "Crema de vainilla" },
      { id: "frutos-rojos", label: "Mermelada de frutos rojos" },
      { id: "ganache", label: "Ganache de chocolate", extraPrice: 40 },
      { id: "dulce-leche", label: "Dulce de leche", extraPrice: 50 },
    ],
    decorations: [
      {
        id: "minimalista",
        label: "Minimalista",
        description: "Acabado liso con detalles sutiles.",
        palettes: [
          { id: "crema", label: "Crema", colors: ["#f5ecdc", "#e8d5b5"] },
          {
            id: "rosa-pastel",
            label: "Rosa pastel",
            colors: ["#f6d5d9", "#fbeaec"],
          },
          {
            id: "verde-salvia",
            label: "Verde salvia",
            colors: ["#b9c8b0", "#e4ecde"],
          },
        ],
      },
      {
        id: "floral",
        label: "Floral",
        description: "Flores de crema o comestibles sobre la superficie.",
        extraPrice: 120,
        palettes: [
          {
            id: "primavera",
            label: "Primavera",
            colors: ["#f4b6c2", "#fff1c9", "#b9d7a5"],
          },
          {
            id: "lavanda",
            label: "Lavanda",
            colors: ["#cdbbe8", "#efe6fa", "#ffffff"],
          },
        ],
      },
      {
        id: "drip",
        label: "Drip de chocolate",
        description: "Cobertura que escurre por los lados, con toppings.",
        extraPrice: 90,
        palettes: [
          {
            id: "chocolate",
            label: "Chocolate",
            colors: ["#4a2c20", "#f5ecdc"],
          },
          { id: "caramelo", label: "Caramelo", colors: ["#c7843d", "#fff1d6"] },
        ],
      },
      {
        id: "tematico",
        label: "Temático",
        description: "Diseño a tu medida a partir de un tema que elijas.",
        extraPrice: 150,
        palettes: [
          {
            id: "cumple-infantil",
            label: "Cumpleaños infantil",
            colors: ["#ffd166", "#ef476f", "#06d6a0"],
          },
          { id: "elegante", label: "Elegante", colors: ["#1f1b1a", "#d4af37"] },
        ],
      },
    ],
    dedication: { maxChars: 40 },
  },
  packages: [
    {
      id: "mesa-postres",
      name: "Mesa de postres",
      description: "Selección de postres individuales para tu evento.",
      minPeople: 20,
      pricePerPerson: 95,
      includes: [
        "3 postres por persona",
        "Montaje en mesa",
        "Letrero personalizado",
      ],
    },
    {
      id: "coffee-break",
      name: "Coffee break",
      description: "Café, panes dulces y galletas para reuniones.",
      minPeople: 10,
      pricePerPerson: 120,
      includes: ["Café y té", "Panes dulces", "Galletas artesanales"],
    },
    {
      id: "brunch",
      name: "Brunch completo",
      description: "Brunch dulce y salado para celebraciones.",
      minPeople: 15,
      pricePerPerson: 220,
      includes: [
        "Bebidas",
        "Panes y croissants",
        "Postre individual",
        "Fruta de temporada",
      ],
    },
  ],
  beverages: {
    id: "bebidas",
    name: "Bebidas para tu evento · precio por servicio",
    items: [
      {
        id: "americano",
        name: "Café americano",
        description: "Café de especialidad, tostado medio.",
        price: 45,
        tags: ["vegano", "sin-gluten"],
      },
      {
        id: "latte",
        name: "Latte",
        description: "Espresso doble con leche texturizada.",
        price: 60,
      },
      {
        id: "chocolate-caliente",
        name: "Chocolate caliente",
        description: "Chocolate semiamargo con un toque de canela.",
        price: 65,
      },
      {
        id: "limonada-lavanda",
        name: "Limonada de lavanda",
        description: "Fría, con lavanda y menta.",
        price: 55,
        tags: ["vegano", "sin-gluten", "sin-lactosa"],
      },
    ],
  },
  howToOrder: {
    eyebrow: "Paso a paso",
    title: "Pedir es muy sencillo",
    titleEmphasis: "sencillo",
    subtitle: "De tu idea a tu mesa en cuatro pasos.",
    steps: [
      {
        title: "Elige",
        description: "Revisa el menú o arma tu pastel con el personalizador.",
      },
      {
        title: "Cotiza",
        description: "Envíanos tu solicitud por el formulario o por WhatsApp.",
      },
      {
        title: "Confirma con anticipo",
        description: "Reservas tu fecha con el 50 % de anticipo.",
      },
      {
        title: "Recibe",
        description: "Recoge tu pedido o te lo entregamos el día acordado.",
      },
    ],
  },
  gallery: {
    eyebrow: "Galería",
    title: "Un vistazo a la vitrina",
    titleEmphasis: "vitrina",
    subtitle: "Algunas de las piezas que salen de nuestro horno.",
    images: [
      {
        src: "/images/gallery/pastel-red-velvet-960.webp",
        srcSet:
          "/images/gallery/pastel-red-velvet-480.webp 480w, /images/gallery/pastel-red-velvet-960.webp 960w",
        width: 960,
        height: 1200,
        alt: "Pastel de bizcocho rojo con betún blanco, decorado con fresas, frambuesas y grosellas",
      },
      {
        src: "/images/gallery/pastel-chocolate-960.webp",
        srcSet:
          "/images/gallery/pastel-chocolate-480.webp 480w, /images/gallery/pastel-chocolate-960.webp 960w",
        width: 960,
        height: 1200,
        alt: "Pastel de mousse de chocolate con ganache y trufas espolvoreadas de cacao",
      },
      {
        src: "/images/gallery/tarta-limon-960.webp",
        srcSet:
          "/images/gallery/tarta-limon-480.webp 480w, /images/gallery/tarta-limon-960.webp 960w",
        width: 960,
        height: 1200,
        alt: "Tarta de limón vista desde arriba, con rodajas de limón, arándanos y menta",
      },
      {
        src: "/images/gallery/flan-960.webp",
        srcSet:
          "/images/gallery/flan-480.webp 480w, /images/gallery/flan-960.webp 960w",
        width: 960,
        height: 1200,
        alt: "Flan de vainilla con caramelo y una ciruela, al que le falta una rebanada",
      },
      {
        src: "/images/gallery/brownies-960.webp",
        srcSet:
          "/images/gallery/brownies-480.webp 480w, /images/gallery/brownies-960.webp 960w",
        width: 960,
        height: 1200,
        alt: "Dos brownies de chocolate con nueces junto a arándanos azules",
      },
      {
        src: "/images/gallery/merengue-960.webp",
        srcSet:
          "/images/gallery/merengue-480.webp 480w, /images/gallery/merengue-960.webp 960w",
        width: 960,
        height: 1200,
        alt: "Postres individuales coronados con merengue tostado",
      },
    ],
  },
  testimonials: {
    eyebrow: "Reseñas",
    title: "Lo que dicen nuestros clientes",
    titleEmphasis: "dicen",
    subtitle: "Reseñas de ejemplo para esta plantilla.",
    items: [
      {
        name: "Ana M.",
        text: "El pastel quedó idéntico a lo que imaginaba y estaba delicioso.",
        isSample: true,
      },
      {
        name: "Carlos R.",
        text: "La mesa de postres fue el éxito de la fiesta.",
        isSample: true,
      },
      {
        name: "Lucía P.",
        text: "Pedir por WhatsApp fue muy fácil y entregaron a tiempo.",
        isSample: true,
      },
    ],
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        question: "¿Con cuánta anticipación debo hacer mi pedido?",
        answer:
          "Pasteles personalizados con mínimo 2 días de anticipación. Para eventos y catering, mientras antes mejor.",
      },
      {
        question: "¿Cómo funciona el anticipo?",
        answer:
          "Para reservar tu fecha se requiere el 50 % del total. El resto se paga al recibir tu pedido. Los datos de pago se envían por WhatsApp al confirmar.",
      },
      {
        question: "¿Puedo cambiar el diseño después de confirmar?",
        answer:
          "Sí, hasta 48 horas antes de la entrega, sujeto a disponibilidad.",
      },
      {
        question: "¿Manejan opciones para alergias?",
        answer:
          "Contamos con opciones sin gluten, veganas y sin lactosa. Cuéntanos tus alergias al cotizar; no garantizamos ausencia de trazas de nueces.",
      },
      {
        question: "¿Hacen entregas?",
        answer:
          "Sí, con costo según la zona. También puedes recoger tu pedido en el local.",
      },
    ],
  },
  hours: {
    timeZone: "America/Mexico_City",
    schedule: {
      mon: null,
      tue: { open: "09:00", close: "19:00" },
      wed: { open: "09:00", close: "19:00" },
      thu: { open: "09:00", close: "19:00" },
      fri: { open: "09:00", close: "20:00" },
      sat: { open: "10:00", close: "20:00" },
      sun: { open: "10:00", close: "15:00" },
    },
  },
  orders: {
    whatsapp: "525500000000",
    defaultMessage: "Hola, me gustaría hacer un pedido.",
    minLeadDays: 2,
    depositPercent: 50,
    paymentNote:
      "Te enviamos los datos de pago por WhatsApp al confirmar tu pedido.",
  },
  contact: {
    email: "hola@mallowandcrumb.example",
    address: "Calle Ejemplo 123, Col. Centro, Ciudad de México",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Calle+Ejemplo+123+Ciudad+de+Mexico",
    formProvider: "web3forms",
    formKey: "REEMPLAZA-CON-TU-LLAVE-PUBLICA",
  },
};
