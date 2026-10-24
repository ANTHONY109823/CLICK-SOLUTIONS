import type { Faq } from './services';

/** Preguntas generales (las de cada servicio están en src/data/services.ts). */
export const generalFaqs: Faq[] = [
  {
    question: '¿Cómo solicito una cotización?',
    answer: 'Completa el formulario de contacto o el de la página del servicio que te interesa. Revisamos tu solicitud y te respondemos con los siguientes pasos.',
  },
  {
    question: '¿La cotización tiene costo?',
    answer: 'No. Te enviamos una propuesta con el alcance y el costo antes de iniciar cualquier trabajo; solo empezamos cuando la apruebas.',
  },
  {
    question: '¿Atienden a personas o solo a empresas?',
    answer: 'A ambos. Nuestros servicios están pensados tanto para personas como para emprendedores y empresas.',
  },
  {
    question: '¿En qué zonas atienden?',
    answer: 'Atendemos clientes en Perú. Para servicios presenciales, indícanos tu ubicación y te confirmamos si podemos llegar.',
  },
  {
    question: '¿Qué hacen con mis datos?',
    answer: 'Solo los usamos para responder tu solicitud. Puedes leer los detalles en nuestra política de privacidad.',
  },
];
