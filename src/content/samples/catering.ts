import type { SiteConfig } from "../types.ts";

// Segunda configuración de ejemplo: "Nerita Catering", negocio de catering de
// marca FICTICIA (mariscos y pescados gourmet para eventos). Demuestra AC-04: la
// misma plantilla produce un sitio distinto cambiando solo la configuración.
// Datos, dirección, teléfono, precios y reseñas son de muestra.
//
// Para verla: npm run dev:catering (o npm run build:catering).
export const cateringSite: SiteConfig = {
  brand: {
    name: "Nerita Catering",
    type: "catering",
    tagline: "Mariscos y pescados gourmet",
    // Paleta inspirada en una marca de mariscos gourmet: azul noche (primario,
    // fondos de marca y títulos; es el tono del fondo de la foto del hero) y
    // naranja quemado (acento, botones). El crema y el gris cálido de esa
    // paleta ya los aportan los neutros de la plantilla.
    colors: { primary: "#0b0f1a", accent: "#b24718" },
  },
  seo: {
    title: "Nerita Catering | Barras de mariscos para eventos en CDMX",
    description:
      "Barras de mariscos y pescados gourmet para eventos familiares y corporativos en la Ciudad de México. Cotiza por WhatsApp o en línea.",
    ogImage: "/images/nerita/og-image.jpg",
    siteUrl: "https://neritacatering.example",
    locale: "es_MX",
    address: {
      street: "Av. Ejemplo 456, Col. Roma Norte",
      locality: "Ciudad de México",
      region: "CDMX",
      postalCode: "06700",
      country: "MX",
    },
    priceRange: "$$$",
  },
  nav: { menuLabel: "Carta" },
  cateringIntro: {
    eyebrow: "Eventos familiares y corporativos",
    title: "Barras listas para tu evento",
    titleEmphasis: "tu evento",
    subtitle:
      "Paquetes por persona con montaje y personal de servicio. Cotizamos según tu fecha, el lugar y el número de invitados.",
  },
  contactIntro: {
    eyebrow: "Cotiza",
    title: "Cuéntanos de tu evento",
    titleEmphasis: "tu evento",
    subtitle:
      "Escríbenos por WhatsApp o déjanos tu solicitud: te respondemos con una propuesta a tu medida.",
  },
  contactForm: {
    title: "Pide tu cotización",
    intro:
      "Cuéntanos la fecha, el lugar y cuántas personas serán. Te respondemos por WhatsApp con una propuesta y el precio final.",
    submitLabel: "Enviar solicitud",
    sendingLabel: "Enviando…",
    successTitle: "¡Recibimos tu solicitud!",
    successBody:
      "Te escribiremos por WhatsApp para confirmar los detalles y enviarte la propuesta. Si es urgente, puedes adelantar el mensaje ahora.",
    errorTitle: "No pudimos registrar tu solicitud",
    whatsappLabel: "Continuar por WhatsApp",
    resetLabel: "Enviar otra solicitud",
    orderHint:
      "Es el pedido que armaste. Puedes editarlo; el precio es un estimado y lo confirmamos por WhatsApp.",
    removeOrderLabel: "Quitar este pedido de la solicitud",
    privacyNote:
      "Usamos tus datos solo para responder tu solicitud; no los compartimos.",
    typeLabels: {
      pastel: "Charolas o platillos por encargo",
      catering: "Evento con barra de mariscos",
      otro: "Otra consulta",
    },
    fulfillmentLabels: {
      entrega: "Entrega y montaje en mi evento",
      recoger: "Recoger en cocina",
    },
  },
  menuIntro: {
    eyebrow: "Nuestra carta",
    title: "Del mar directo a tu mesa",
    titleEmphasis: "directo",
    subtitle:
      "Platillos y charolas por encargo, listos para tu evento. Todo se prepara el día de tu fecha con producto fresco.",
  },
  sections: {
    featured: true,
    customizer: false,
    catering: true,
    gallery: true,
    testimonials: true,
    faq: true,
  },
  hero: {
    title: "El mar, servido con elegancia",
    titleEmphasis: "elegancia",
    subtitle:
      "Barras de mariscos y pescados preparados con técnica gourmet para tus eventos familiares y corporativos.",
    image: {
      src: "/images/nerita/hero-1080.webp",
      srcSet:
        "/images/nerita/hero-720.webp 720w, /images/nerita/hero-860.webp 860w, /images/nerita/hero-1080.webp 1080w, /images/nerita/hero-1440.webp 1440w, /images/nerita/hero-1920.webp 1920w",
      sizes: "100vw",
      width: 1080,
      height: 608,
      alt: "Dos piezas de nigiri de salmón con crema y cebollín sobre un fondo oscuro",
    },
    ctaLabel: "Cotizar por WhatsApp",
    tone: "dark",
  },
  menu: [
    {
      id: "barra-fria",
      availability: "encargo",
      name: "Barra fría y entradas",
      items: [
        {
          id: "rollos-sushi",
          name: "Tabla de rollos de sushi",
          description:
            "Rollos de salmón, atún y aguacate con arroz de colores y flor comestible. Tabla para 8 a 10 personas.",
          image: {
            src: "/images/nerita/menu/rollos-sushi-480.webp",
            srcSet:
              "/images/nerita/menu/rollos-sushi-240.webp 240w, /images/nerita/menu/rollos-sushi-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Filas de rollos de sushi de colores sobre una charola azul, con una flor morada al centro",
          },
          price: 1450,
          priceFrom: true,
        },
        {
          id: "camaron-hierbas",
          name: "Camarón con micro hierbas",
          description:
            "Camarón salteado sobre crema de papa, jitomate deshidratado y micro hierbas. Charola para 10 personas.",
          image: {
            src: "/images/nerita/menu/camaron-hierbas-480.webp",
            srcSet:
              "/images/nerita/menu/camaron-hierbas-240.webp 240w, /images/nerita/menu/camaron-hierbas-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Camarones salteados en una charola blanca con jitomate seco y brotes morados",
          },
          price: 1100,
          priceFrom: true,
        },
        {
          id: "canapes-salmon",
          name: "Canapés de salmón ahumado",
          description:
            "Salmón ahumado, crema fresca y caviar sobre pan tostado. 40 piezas.",
          image: {
            src: "/images/nerita/menu/canapes-salmon-480.webp",
            srcSet:
              "/images/nerita/menu/canapes-salmon-240.webp 240w, /images/nerita/menu/canapes-salmon-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Canapés de salmón con crema y caviar negro sobre pan tostado en una charola",
          },
          price: 1250,
        },
        {
          id: "shots-camaron",
          name: "Shots de coctel de camarón",
          description:
            "Caldillo de jitomate frío con camarón cocido y perejil. 24 vasitos.",
          image: {
            src: "/images/nerita/menu/shots-camaron-480.webp",
            srcSet:
              "/images/nerita/menu/shots-camaron-240.webp 240w, /images/nerita/menu/shots-camaron-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Vasitos de coctel de jitomate, cada uno con un camarón colgando del borde",
          },
          price: 1380,
          tags: ["sin-lactosa"],
        },
        {
          id: "ostiones-camaron",
          name: "Ostiones y camarón en cama de hielo",
          description:
            "Ostiones frescos y camarón cocido con limón y salsas. 24 ostiones y 1 kg de camarón.",
          image: {
            src: "/images/nerita/menu/ostiones-camaron-480.webp",
            srcSet:
              "/images/nerita/menu/ostiones-camaron-240.webp 240w, /images/nerita/menu/ostiones-camaron-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Ostiones abiertos y camarones rosados sobre hielo con rebanadas de limón",
          },
          price: 2100,
          priceFrom: true,
          tags: ["sin-gluten", "sin-lactosa"],
        },
      ],
    },
    {
      id: "del-fuego",
      availability: "encargo",
      name: "Del fuego y la paellera",
      items: [
        {
          id: "pescado-parrilla",
          name: "Pescados a la parrilla",
          description:
            "Pescado entero asado con ajo, alcaparras, limón y hierbas. Para 10 personas.",
          image: {
            src: "/images/nerita/menu/pescado-parrilla-480.webp",
            srcSet:
              "/images/nerita/menu/pescado-parrilla-240.webp 240w, /images/nerita/menu/pescado-parrilla-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Pescados asados con ajo picado y alcaparras sobre charolas blancas, con limones",
          },
          price: 2400,
          priceFrom: true,
          tags: ["sin-gluten"],
        },
        {
          id: "paella-mariscos",
          name: "Paella de mariscos",
          description:
            "Arroz azafranado con camarón, mejillones y langostino. Paellera para 15 personas.",
          image: {
            src: "/images/nerita/menu/paella-mariscos-480.webp",
            srcSet:
              "/images/nerita/menu/paella-mariscos-240.webp 240w, /images/nerita/menu/paella-mariscos-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Paellera con arroz amarillo, langostinos, mejillones y pimiento rojo",
          },
          price: 3200,
          priceFrom: true,
          tags: ["sin-gluten", "sin-lactosa"],
        },
        {
          id: "pulpo-parrilla",
          name: "Pulpo a la parrilla",
          description:
            "Pulpo glaseado con chile fresco y cebollín, sobre puré de papa. 2 kg.",
          image: {
            src: "/images/nerita/menu/pulpo-parrilla-480.webp",
            srcSet:
              "/images/nerita/menu/pulpo-parrilla-240.webp 240w, /images/nerita/menu/pulpo-parrilla-480.webp 480w",
            width: 480,
            height: 480,
            alt: "Tentáculo de pulpo asado y glaseado con chile rojo y cebollín sobre un plato azul",
          },
          price: 2800,
          tags: ["picante"],
        },
      ],
    },
  ],
  featured: {
    eyebrow: "Lo más pedido",
    title: "Favoritos en eventos",
    titleEmphasis: "eventos",
    subtitle: "Tres platillos que casi nunca faltan en nuestras barras.",
    itemIds: ["rollos-sushi", "paella-mariscos", "ostiones-camaron"],
  },
  packages: [
    {
      id: "barra-marina",
      name: "Barra Marina",
      description:
        "Barra fría con ostiones, camarón y canapés para recepciones y brindis.",
      minPeople: 20,
      pricePerPerson: 520,
      includes: [
        "Ostiones y camarón en cama de hielo",
        "Canapés de salmón ahumado",
        "Shots de coctel de camarón",
        "Montaje y personal de servicio (4 horas)",
      ],
    },
    {
      id: "parrilla-pacifico",
      name: "Parrilla del Pacífico",
      description:
        "Pescados y pulpo a la parrilla con guarniciones para comidas al aire libre.",
      minPeople: 30,
      pricePerPerson: 690,
      includes: [
        "Pescado entero a la parrilla",
        "Pulpo a la parrilla con chile fresco",
        "Arroz, ensaladas y salsas",
        "Montaje, parrilleros y personal de servicio",
      ],
    },
    {
      id: "banquete-nerita",
      name: "Banquete Nerita",
      description:
        "Menú completo con barra fría, sushi y paella en vivo para bodas y eventos corporativos.",
      minPeople: 40,
      pricePerPerson: 980,
      includes: [
        "Barra fría y mesa de sushi",
        "Paella de mariscos preparada en vivo",
        "Agua fresca y limonada",
        "Coordinación del evento",
      ],
    },
  ],
  beverages: {
    id: "bebidas",
    availability: "encargo",
    name: "Bebidas sin alcohol · precio por persona",
    items: [
      {
        id: "agua-pepino-limon",
        name: "Agua de pepino y limón",
        description: "Fresca, ligera y con hierbabuena.",
        price: 45,
        tags: ["vegano", "sin-gluten", "sin-lactosa"],
      },
      {
        id: "limonada-mineral",
        name: "Limonada mineral",
        description:
          "Limón recién exprimido con agua mineral y un toque de sal.",
        price: 50,
        tags: ["vegano", "sin-gluten", "sin-lactosa"],
      },
      {
        id: "te-jamaica",
        name: "Té helado de jamaica",
        description: "Jamaica y canela, endulzado al gusto.",
        price: 40,
        tags: ["vegano", "sin-gluten", "sin-lactosa"],
      },
    ],
  },
  howToOrder: {
    eyebrow: "Paso a paso",
    title: "Tu evento en cuatro pasos",
    titleEmphasis: "cuatro pasos",
    subtitle: "De tu idea a la barra servida, sin complicaciones.",
    steps: [
      {
        title: "Cuéntanos",
        description:
          "Dinos la fecha, el lugar y cuántas personas serán, por el formulario o por WhatsApp.",
      },
      {
        title: "Recibe tu propuesta",
        description:
          "Te enviamos el menú sugerido y el precio final, ajustado a tu evento.",
      },
      {
        title: "Aparta con anticipo",
        description: "Reservas tu fecha con el 50 % de anticipo.",
      },
      {
        title: "Disfruta",
        description:
          "Llegamos con tiempo, montamos la barra y nos encargamos del servicio.",
      },
    ],
  },
  gallery: {
    eyebrow: "Galería",
    title: "Así se ve una barra Nerita",
    titleEmphasis: "Nerita",
    subtitle: "Montajes y platillos de muestra para esta plantilla.",
    images: [
      {
        src: "/images/nerita/gallery/barra-camarones-600.webp",
        srcSet:
          "/images/nerita/gallery/barra-camarones-480.webp 480w, /images/nerita/gallery/barra-camarones-600.webp 600w",
        width: 600,
        height: 750,
        alt: "Camarones con salsa y mango sobre un plato blanco en una mesa de buffet al aire libre",
      },
      {
        src: "/images/nerita/gallery/risotto-alberca-500.webp",
        width: 500,
        height: 625,
        alt: "Charola con tazones individuales de arroz con camarón frente a una alberca",
      },
      {
        src: "/images/nerita/gallery/paella-evento-500.webp",
        width: 500,
        height: 625,
        alt: "Cocineros preparando paellas gigantes en un puesto de mercado",
      },
      {
        src: "/images/nerita/gallery/cocinero-paella-500.webp",
        width: 500,
        height: 625,
        alt: "Cocinero con delantal azul sirviendo paella de mariscos de una paellera grande",
      },
      {
        src: "/images/nerita/gallery/camarones-empanizados-600.webp",
        srcSet:
          "/images/nerita/gallery/camarones-empanizados-480.webp 480w, /images/nerita/gallery/camarones-empanizados-600.webp 600w",
        width: 600,
        height: 750,
        alt: "Camarones empanizados en vasitos transparentes con salsa de jitomate sobre una mesa de buffet",
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
        name: "Mariana G.",
        text: "La barra de mariscos fue lo más comentado de la boda. Todo llegó fresco y a tiempo.",
        isSample: true,
      },
      {
        name: "Roberto S.",
        text: "Atendieron nuestra comida de fin de año con 60 personas sin un solo contratiempo.",
        isSample: true,
      },
      {
        name: "Daniela V.",
        text: "La paella en vivo hizo la fiesta. Cotizar por WhatsApp fue muy rápido.",
        isSample: true,
      },
    ],
  },
  faq: {
    title: "Preguntas frecuentes",
    items: [
      {
        question: "¿Con cuánta anticipación debo contratar?",
        answer:
          "Con mínimo 5 días, porque el producto fresco se pide para tu fecha. Para bodas y eventos de más de 80 personas, mientras antes mejor.",
      },
      {
        question: "¿Cómo funciona el anticipo?",
        answer:
          "Para reservar tu fecha se requiere el 50 % del total. El resto se paga antes del servicio. Los datos de pago se envían por WhatsApp al confirmar.",
      },
      {
        question: "¿Cómo garantizan la frescura?",
        answer:
          "Compramos el producto para tu evento y lo transportamos en cadena de frío hasta el lugar del montaje.",
      },
      {
        question: "¿Manejan alergias?",
        answer:
          "Trabajamos con pescado, crustáceos y moluscos. Si alguno de tus invitados tiene alergias, cuéntanoslo al cotizar; en nuestra cocina no podemos garantizar la ausencia de trazas.",
      },
      {
        question: "¿A qué zonas llegan?",
        answer:
          "A toda la Ciudad de México y zona conurbada. El costo de traslado depende de la distancia y se incluye en tu cotización.",
      },
    ],
  },
  hours: {
    timeZone: "America/Mexico_City",
    schedule: {
      mon: { open: "09:00", close: "19:00" },
      tue: { open: "09:00", close: "19:00" },
      wed: { open: "09:00", close: "19:00" },
      thu: { open: "09:00", close: "19:00" },
      fri: { open: "09:00", close: "19:00" },
      sat: { open: "10:00", close: "15:00" },
      sun: null,
    },
  },
  orders: {
    whatsapp: "525500000000",
    defaultMessage: "Hola, me gustaría cotizar un evento.",
    minLeadDays: 5,
    depositPercent: 50,
    madeToOrderLabel: "Eventos y charolas por encargo",
    itemOrder: {
      vitrina: {
        label: "Pedir hoy",
        badge: "Disponible hoy",
        message: "Hola, quiero pedir {item}. ¿Está disponible hoy?",
      },
      encargo: {
        label: "Cotizar",
        badge: "Por encargo",
        message:
          "Hola, quiero cotizar {item} para un evento. ¿Con cuánta anticipación necesitan el pedido?",
      },
    },
    paymentNote:
      "Te enviamos los datos de pago por WhatsApp al confirmar tu evento.",
  },
  contact: {
    email: "hola@neritacatering.example",
    address: "Av. Ejemplo 456, Col. Roma Norte, Ciudad de México",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Av+Ejemplo+456+Ciudad+de+Mexico",
    formProvider: "web3forms",
    formKey: "REEMPLAZA-CON-TU-LLAVE-PUBLICA",
  },
};
