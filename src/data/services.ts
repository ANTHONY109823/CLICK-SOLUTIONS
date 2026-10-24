/**
 * Las cuatro líneas de negocio de ClickSolutions.
 *
 * - `enabled: false` oculta una oferta en todo el sitio (úsalo para lo que aún no ofreces).
 * - Los textos describen el servicio sin prometer plazos, garantías, certificaciones ni
 *   permisos que no estén acreditados. Revisa y ajusta cada oferta (PENDIENTE DE CONFIRMAR).
 */
import type { IconName } from '../components/ui/icons';

export type ServiceSlug = 'drones' | 'desarrollo-web' | 'soporte-tecnico' | 'licencias-software';

export interface Offering {
  id: string;
  title: string;
  summary: string;
  icon: IconName;
  enabled: boolean;
  /** Detalle ampliado (usado en desarrollo web). */
  problem?: string;
  audience?: string;
  includes?: string[];
}

export interface Step {
  title: string;
  text: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface GalleryItem {
  src: string;
  alt: string;
  caption?: string;
}

export interface Service {
  slug: ServiceSlug;
  name: string;
  icon: IconName;
  /** Frase corta para tarjetas y menú. */
  tagline: string;
  /** Puntos clave para la tarjeta de inicio. */
  highlights: string[];
  hero: { eyebrow: string; title: string; lead: string };
  cta: { label: string; formHeading: string };
  description: string[];
  audiences: { title: string; text: string; icon: IconName }[];
  offeringsTitle: string;
  offerings: Offering[];
  process: Step[];
  /** Información que el cliente debe preparar. */
  requirements: string[];
  faqs: Faq[];
  /** Trabajos reales. Vacío = se muestra un estado “en preparación”. */
  gallery: GalleryItem[];
  /** Avisos importantes (normativa, condiciones). */
  notes?: string[];
  seo: { title: string; description: string };
}

export const services: Service[] = [
  {
    slug: 'drones',
    name: 'Servicios con drones',
    icon: 'drone',
    tagline: 'Fotografía, video y registro visual aéreo.',
    highlights: ['Fotografía y video aéreo', 'Registro de eventos', 'Material audiovisual para empresas'],
    hero: {
      eyebrow: 'Drones',
      title: 'Una perspectiva aérea para tus proyectos',
      lead: 'Fotografía y video con drones para personas y empresas: eventos, inmuebles, obras y contenido para tu marca. Evaluamos cada solicitud según el lugar y la normativa vigente.',
    },
    cta: { label: 'Cotizar servicio', formHeading: 'Cotiza tu servicio con drones' },
    description: [
      'Las tomas aéreas muestran lo que desde el suelo no se ve: la escala de un terreno, el avance de una obra, el ambiente de un evento o el entorno de un negocio.',
      'Te ayudamos a definir qué necesitas registrar, planificamos el vuelo considerando el lugar, el clima y las restricciones aplicables, y te entregamos el material listo para usar.',
    ],
    audiences: [
      { title: 'Personas', text: 'Recuerdos de eventos, celebraciones y lugares especiales desde el aire.', icon: 'users' },
      { title: 'Negocios y marcas', text: 'Contenido visual para redes sociales, web y presentaciones comerciales.', icon: 'building' },
      { title: 'Inmuebles y obras', text: 'Registro visual de terrenos, propiedades y avance de proyectos.', icon: 'eye' },
    ],
    offeringsTitle: 'Qué podemos hacer por ti',
    offerings: [
      { id: 'foto-aerea', title: 'Fotografía aérea', summary: 'Imágenes en alta resolución de lugares, inmuebles, terrenos y paisajes.', icon: 'camera', enabled: true },
      { id: 'video-aereo', title: 'Filmación y video aéreo', summary: 'Tomas de video aéreas para piezas promocionales, recuerdos o documentación.', icon: 'video', enabled: true },
      { id: 'inspecciones', title: 'Inspecciones visuales', summary: 'Registro visual de techos, fachadas, estructuras o terrenos de difícil acceso. Es un apoyo visual, no reemplaza una inspección técnica profesional.', icon: 'eye', enabled: true },
      { id: 'eventos', title: 'Registro de eventos', summary: 'Cobertura aérea de eventos sociales, deportivos o corporativos, según lo permita el lugar.', icon: 'calendar', enabled: true },
      { id: 'empresas', title: 'Material audiovisual para empresas', summary: 'Contenido aéreo para presentar instalaciones, proyectos o la marca de tu empresa.', icon: 'building', enabled: true },
      { id: 'personalizados', title: 'Proyectos personalizados', summary: 'Cuéntanos tu idea y evaluamos si es viable y cómo realizarla.', icon: 'sparkles', enabled: true },
    ],
    process: [
      { title: 'Nos cuentas tu idea', text: 'Lugar, fecha tentativa, qué quieres registrar y para qué usarás el material.' },
      { title: 'Evaluamos la viabilidad', text: 'Revisamos la zona, las restricciones de vuelo y las condiciones necesarias.' },
      { title: 'Cotización y planificación', text: 'Te enviamos una propuesta con alcance, entregables y condiciones.' },
      { title: 'Vuelo y entrega', text: 'Realizamos el registro y te entregamos el material acordado.' },
    ],
    requirements: [
      'Ubicación exacta del lugar y fecha tentativa.',
      'Tipo de material que necesitas (foto, video o ambos) y para qué lo usarás.',
      'Permisos del propietario o del organizador cuando se trate de un lugar privado o un evento.',
      'Referencias o ejemplos del estilo que te gusta (opcional).',
    ],
    faqs: [
      { question: '¿Se puede volar en cualquier lugar?', answer: 'No. Hay zonas con restricciones (por ejemplo, cerca de aeropuertos o instalaciones sensibles) y lugares que requieren autorización del propietario. Antes de confirmar un servicio evaluamos si el vuelo es viable en esa ubicación.' },
      { question: '¿Qué normativa se aplica en Perú?', answer: 'Las operaciones con drones están reguladas por la Dirección General de Aeronáutica Civil (DGAC) del Ministerio de Transportes y Comunicaciones. Cada solicitud se evalúa según esa normativa y las autorizaciones que correspondan al tipo de operación.' },
      { question: '¿Qué pasa si el clima no permite volar?', answer: 'La lluvia o el viento fuerte pueden impedir un vuelo seguro. En ese caso coordinamos una nueva fecha; las condiciones exactas se indican en la cotización.' },
      { question: '¿En qué formato recibo el material?', answer: 'Se acuerda en la cotización según el uso que le darás (redes sociales, web, presentaciones u otros).' },
    ],
    gallery: [],
    notes: [
      'Cada operación se evalúa según la normativa de la DGAC (MTC) y las restricciones del lugar. Si un vuelo no es viable o requiere autorizaciones adicionales, te lo indicaremos antes de cotizar.',
    ],
    seo: {
      title: 'Servicios con drones: fotografía y video aéreo',
      description: 'Fotografía aérea, video, registro de eventos e inspecciones visuales con drones en Perú. Cotiza tu servicio con ClickSolutions.',
    },
  },
  {
    slug: 'desarrollo-web',
    name: 'Desarrollo web',
    icon: 'code',
    tagline: 'Sitios, tiendas y sistemas web a medida.',
    highlights: ['Páginas corporativas y landing pages', 'Catálogos y tiendas online', 'Sistemas y automatización'],
    hero: {
      eyebrow: 'Desarrollo web',
      title: 'Tu negocio, listo para crecer en internet',
      lead: 'Diseñamos y desarrollamos sitios web rápidos, claros y fáciles de mantener: desde una landing page hasta un sistema a la medida de tus procesos.',
    },
    cta: { label: 'Solicitar propuesta', formHeading: 'Solicita una propuesta para tu proyecto web' },
    description: [
      'Una buena web no es solo diseño: tiene que cargar rápido, verse bien en el celular, aparecer en buscadores y llevar a tus visitantes a contactarte o comprar.',
      'Trabajamos contigo desde la idea hasta la publicación, con entregas que puedes revisar en cada etapa.',
    ],
    audiences: [
      { title: 'Emprendedores', text: 'Una presencia profesional para empezar a vender y generar confianza.', icon: 'sparkles' },
      { title: 'Pequeñas empresas', text: 'Webs y catálogos que presentan tus productos y reciben consultas.', icon: 'building' },
      { title: 'Empresas en crecimiento', text: 'Sistemas y automatizaciones que ahorran tiempo en tareas repetitivas.', icon: 'workflow' },
    ],
    offeringsTitle: 'Tipos de proyecto',
    offerings: [
      {
        id: 'corporativa', title: 'Página web corporativa', icon: 'building', enabled: true,
        summary: 'El sitio oficial de tu empresa: quiénes son, qué ofrecen y cómo contactarlos.',
        problem: 'Sin web, los clientes no encuentran información confiable sobre tu negocio.',
        audience: 'Empresas y profesionales que necesitan una presencia formal.',
        includes: ['Diseño adaptable a celulares', 'Secciones de servicios, nosotros y contacto', 'Formulario de contacto', 'Configuración básica de SEO'],
      },
      {
        id: 'landing', title: 'Landing page comercial', icon: 'target', enabled: true,
        summary: 'Una página enfocada en un producto, servicio o campaña, pensada para convertir.',
        problem: 'Las campañas envían visitas a páginas que no explican la oferta ni invitan a actuar.',
        audience: 'Negocios que lanzan un producto o invierten en publicidad.',
        includes: ['Mensaje y estructura orientados a la conversión', 'Llamadas a la acción claras', 'Integración con WhatsApp o formulario', 'Preparada para medir resultados'],
      },
      {
        id: 'catalogo', title: 'Catálogo digital', icon: 'layout', enabled: true,
        summary: 'Muestra tus productos con fotos, descripciones y consulta directa.',
        problem: 'Enviar fotos y precios uno por uno por chat consume tiempo y genera confusión.',
        audience: 'Negocios con varios productos que venden por consulta.',
        includes: ['Categorías y buscador', 'Fichas de producto', 'Botón de consulta por producto', 'Fácil de actualizar'],
      },
      {
        id: 'tienda', title: 'Tienda online', icon: 'cart', enabled: true,
        summary: 'Venta en línea con carrito, pedidos y pasarela de pago.',
        problem: 'Vender solo de forma presencial o por chat limita tu alcance y horario.',
        audience: 'Negocios listos para vender en línea de forma ordenada.',
        includes: ['Catálogo con carrito de compras', 'Integración con una pasarela de pago autorizada', 'Gestión de pedidos', 'Configuración de envíos o recojo'],
      },
      {
        id: 'sistemas', title: 'Sistemas web personalizados', icon: 'cpu', enabled: true,
        summary: 'Aplicaciones a medida: registros, reportes, paneles internos y más.',
        problem: 'Las hojas de cálculo dispersas y los procesos manuales generan errores y pérdida de tiempo.',
        audience: 'Empresas con procesos propios que ninguna herramienta genérica resuelve bien.',
        includes: ['Análisis del proceso actual', 'Usuarios y permisos', 'Base de datos y reportes', 'Capacitación de uso'],
      },
      {
        id: 'automatizacion', title: 'Automatización de procesos', icon: 'workflow', enabled: true,
        summary: 'Conectamos herramientas y automatizamos tareas repetitivas.',
        problem: 'Copiar datos entre sistemas o enviar los mismos mensajes a mano no escala.',
        audience: 'Equipos que repiten tareas administrativas todos los días.',
        includes: ['Identificación de tareas automatizables', 'Integración entre herramientas', 'Notificaciones y reportes automáticos', 'Documentación del flujo'],
      },
      {
        id: 'mantenimiento', title: 'Mantenimiento y actualización', icon: 'refresh', enabled: true,
        summary: 'Mantenemos tu sitio actualizado, seguro y funcionando.',
        problem: 'Un sitio desactualizado se vuelve lento, vulnerable y deja de reflejar tu negocio.',
        audience: 'Negocios que ya tienen una web y necesitan apoyo continuo.',
        includes: ['Actualizaciones de contenido', 'Revisión de seguridad y dependencias', 'Copias de seguridad', 'Mejoras de rendimiento'],
      },
    ],
    process: [
      { title: 'Diagnóstico', text: 'Conversamos sobre tu negocio, tus objetivos y lo que esperas de la web.' },
      { title: 'Propuesta', text: 'Te enviamos alcance, etapas, plazos estimados y costo antes de empezar.' },
      { title: 'Diseño y desarrollo', text: 'Construimos el proyecto con revisiones tuyas en cada etapa.' },
      { title: 'Publicación', text: 'Configuramos dominio, hosting y pruebas finales antes de salir en vivo.' },
      { title: 'Acompañamiento', text: 'Te explicamos cómo usarlo y acordamos el soporte posterior.' },
    ],
    requirements: [
      'Logo y colores de tu marca (si ya los tienes).',
      'Textos o información base de tu negocio y servicios.',
      'Fotos de productos, local o equipo, si las tienes.',
      'Ejemplos de webs que te gusten y por qué.',
      'Dominio y hosting actuales, si ya cuentas con ellos.',
    ],
    faqs: [
      { question: '¿Cuánto cuesta una página web?', answer: 'Depende del tipo de proyecto, el número de secciones y las funciones que necesites. Después de una breve conversación te enviamos una propuesta con el costo detallado.' },
      { question: '¿Cuánto tiempo toma?', answer: 'El plazo se define en la propuesta según el alcance y la rapidez con que contemos con tus textos e imágenes.' },
      { question: '¿Podré actualizar mi web yo mismo?', answer: 'Si lo necesitas, lo consideramos desde el inicio para que puedas editar contenidos sin conocimientos técnicos.' },
      { question: '¿El dominio y el hosting están incluidos?', answer: 'Se detalla en cada propuesta. Te asesoramos para que el dominio quede registrado a tu nombre.' },
    ],
    gallery: [],
    seo: {
      title: 'Desarrollo web: páginas, tiendas y sistemas a medida',
      description: 'Diseño y desarrollo de páginas corporativas, landing pages, catálogos, tiendas online y sistemas web en Perú. Solicita una propuesta.',
    },
  },
  {
    slug: 'soporte-tecnico',
    name: 'Soporte técnico',
    icon: 'headset',
    tagline: 'Diagnóstico, mantenimiento y configuración de equipos.',
    highlights: ['Diagnóstico y mantenimiento', 'Instalación y configuración', 'Asesoría tecnológica'],
    hero: {
      eyebrow: 'Soporte técnico',
      title: 'Tus equipos funcionando como deben',
      lead: 'Diagnóstico, mantenimiento e instalación de computadoras, software e impresoras para hogares, oficinas y negocios.',
    },
    cta: { label: 'Solicitar asistencia', formHeading: 'Describe tu problema y te contactamos' },
    description: [
      'Un equipo lento o una impresora que no responde detienen tu trabajo. Revisamos el problema, te explicamos qué ocurre y te proponemos la solución antes de intervenir.',
    ],
    audiences: [
      { title: 'Hogares', text: 'Computadoras lentas, virus, configuración de impresoras y periféricos.', icon: 'users' },
      { title: 'Oficinas y negocios', text: 'Instalación de equipos, mantenimiento preventivo y configuración de software.', icon: 'building' },
      { title: 'Asesoría', text: 'Te ayudamos a elegir equipos y herramientas adecuadas para lo que necesitas.', icon: 'help' },
    ],
    offeringsTitle: 'Servicios de soporte',
    offerings: [
      { id: 'diagnostico', title: 'Diagnóstico de computadoras', summary: 'Identificamos la causa de fallas, lentitud o errores.', icon: 'search', enabled: true },
      { id: 'software', title: 'Instalación y configuración de software', summary: 'Programas, controladores y aplicaciones con licencias legítimas.', icon: 'download', enabled: true },
      { id: 'preventivo', title: 'Mantenimiento preventivo', summary: 'Limpieza, revisión y optimización para prolongar la vida de tus equipos.', icon: 'shield', enabled: true },
      { id: 'windows', title: 'Solución de problemas de Windows', summary: 'Errores de arranque, actualizaciones, rendimiento y configuración.', icon: 'monitor', enabled: true },
      { id: 'impresoras', title: 'Impresoras y periféricos', summary: 'Instalación y configuración de impresoras, escáneres y otros dispositivos.', icon: 'printer', enabled: true },
      { id: 'instalacion', title: 'Instalación de equipos', summary: 'Puesta en marcha de computadoras y puestos de trabajo.', icon: 'cpu', enabled: true },
      { id: 'remota', title: 'Asistencia remota', summary: 'Ayuda a distancia, siempre iniciada y autorizada por ti, mediante herramientas que tú controlas.', icon: 'monitor', enabled: false },
      { id: 'asesoria', title: 'Asesoría tecnológica', summary: 'Recomendaciones para comprar equipos o mejorar tu entorno de trabajo.', icon: 'help', enabled: true },
    ],
    process: [
      { title: 'Describe el problema', text: 'Cuéntanos qué ocurre, desde cuándo y qué equipo es.' },
      { title: 'Evaluación', text: 'Revisamos la información y te indicamos los siguientes pasos y el costo estimado.' },
      { title: 'Atención', text: 'Coordinamos la atención en la modalidad disponible y realizamos el servicio.' },
      { title: 'Cierre', text: 'Te explicamos qué se hizo y te damos recomendaciones para evitar que se repita.' },
    ],
    requirements: [
      'Marca y modelo del equipo, si los conoces.',
      'Descripción del problema y mensajes de error (una foto de la pantalla ayuda).',
      'Desde cuándo ocurre y si hubo algún cambio reciente.',
      'Copia de seguridad de tus archivos importantes, si es posible.',
    ],
    faqs: [
      { question: '¿Necesitan acceso a mis archivos?', answer: 'Solo intervenimos lo necesario para resolver el problema y siempre con tu autorización. Te recomendamos respaldar tu información antes de cualquier servicio.' },
      { question: '¿Cuánto cuesta el servicio?', answer: 'Depende del problema. Tras revisar tu solicitud te damos un costo estimado antes de realizar cualquier trabajo.' },
      { question: '¿Instalan programas sin licencia?', answer: 'No. Solo instalamos software con licencias legítimas o programas gratuitos y de código abierto.' },
    ],
    gallery: [],
    seo: {
      title: 'Soporte técnico: diagnóstico, mantenimiento e instalación',
      description: 'Soporte informático en Perú: diagnóstico de computadoras, mantenimiento, instalación de software, impresoras y asesoría tecnológica.',
    },
  },
  {
    slug: 'licencias-software',
    name: 'Licencias de software',
    icon: 'key',
    tagline: 'Software original para trabajar con tranquilidad.',
    highlights: ['Productividad y seguridad', 'Asesoría para elegir', 'Solo licencias legítimas'],
    hero: {
      eyebrow: 'Licencias de software',
      title: 'Software original, sin complicaciones',
      lead: 'Te ayudamos a elegir la licencia adecuada para tus equipos y tu forma de trabajar. Consulta disponibilidad, condiciones y precio de cada producto.',
    },
    cta: { label: 'Consultar licencia', formHeading: 'Consulta por la licencia que necesitas' },
    description: [
      'Usar software original protege tus equipos y tu información, y te da acceso a actualizaciones y soporte del fabricante.',
      'Cada producto indica su tipo de licencia, duración, dispositivos permitidos y condiciones de uso. Las claves nunca se publican en este sitio: se entregan de forma privada tras confirmar el pedido.',
    ],
    audiences: [
      { title: 'Uso personal', text: 'Licencias para tu computadora o para la familia.', icon: 'users' },
      { title: 'Negocios', text: 'Licencias para varios equipos y usuarios.', icon: 'building' },
      { title: 'Asesoría', text: 'Te ayudamos a elegir según tus equipos y necesidades.', icon: 'help' },
    ],
    offeringsTitle: 'Cómo funciona',
    offerings: [],
    process: [
      { title: 'Elige o consulta', text: 'Busca el producto en el catálogo o cuéntanos qué necesitas.' },
      { title: 'Confirmamos', text: 'Verificamos disponibilidad, compatibilidad, condiciones y precio.' },
      { title: 'Pedido', text: 'Coordinamos el pago por un medio acordado.' },
      { title: 'Entrega privada', text: 'Recibes la licencia de forma privada, con instrucciones de activación.' },
    ],
    requirements: [
      'Sistema operativo y número de equipos donde usarás el software.',
      'Si es para uso personal o comercial.',
      'Si ya tienes una licencia anterior que quieras renovar.',
    ],
    faqs: [
      { question: '¿Las licencias son originales?', answer: 'Solo comercializamos licencias legítimas, obtenidas por canales autorizados. Las condiciones de cada producto son las del fabricante.' },
      { question: '¿Cómo recibo mi licencia?', answer: 'De forma privada, después de confirmar el pedido. Nunca publicamos claves en el sitio web.' },
      { question: '¿Puedo pagar en línea?', answer: 'Por ahora los pedidos se coordinan directamente con nosotros. El pago en línea se habilitará más adelante.' },
      { question: '¿Aceptan devoluciones?', answer: 'Depende del producto y de las condiciones del fabricante. La política aplicable se indica en cada ficha y antes de confirmar el pedido.' },
    ],
    gallery: [],
    seo: {
      title: 'Licencias de software originales',
      description: 'Catálogo de licencias de software legítimas en Perú: productividad, seguridad y más. Consulta disponibilidad, condiciones y precio.',
    },
  },
];
