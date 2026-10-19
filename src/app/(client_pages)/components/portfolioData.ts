/*
 * Dados iniciais do portefólio; cada id deve ser único e estável para os URLs.
 * O servidor usa esta lista apenas quando projects.json não existe.
 * Alterar este ficheiro não substitui dados já publicados pelo painel.
 */
const PROSOTA_PROJECTS = [
  {
    id: 'habitacao-unifamiliar',
    name: 'Habitação Unifamiliar',
    category: 'Construção',
    year: '2021',
    location: 'Luanda',
    summary: 'Extensão da habitação e criação de piscina',
    description: 'Projecto de ampliação de uma moradia unifamiliar em Luanda, com criação de uma nova área social exterior, piscina e zona de lazer ajardinada. Acompanhamento integral desde a fundação até aos acabamentos finais.',
    images: [
      '/images/habitacao-unifamiliar.jpg',
      '/images/habitacao-piscina.jpg',
      '/images/obra-fundacao.jpg'
    ]
  },
  {
    id: 'igreja-shekinah',
    name: 'Igreja Shekinah',
    category: 'Construção',
    year: '2011',
    location: 'Luanda',
    summary: 'Templo para cerca de 3.000 pessoas',
    description: 'Concepção e construção de um templo de grande escala, com capacidade para cerca de 3.000 pessoas, incluindo salão principal, torre sineira e áreas de apoio administrativo.',
    images: [
      '/images/igreja-shekinah.jpg',
      '/images/igreja-shekinah-interior.jpg'
    ]
  },
  {
    id: 'hotel-golden-park',
    name: 'Hotel Golden Park',
    category: 'Construção',
    year: '1997',
    location: 'Luanda',
    summary: 'Luanda · 7 andares, 24 quartos',
    description: 'Um dos primeiros grandes projectos da PRO SOTA: um hotel de 7 andares com 24 quartos no centro de Luanda, marcando o início de mais de duas décadas de experiência no sector.',
    images: [
      '/images/hotel-golden-park.jpg'
    ]
  },
  {
    id: 'colegio-fermas',
    name: 'Colégio Fermas',
    category: 'Construção',
    year: '2013',
    location: 'Luanda',
    summary: 'Campus completo, iniciação ao 12º ano',
    description: 'Construção de um campus escolar completo, da iniciação ao 12º ano, com salas de aula, laboratórios, zonas desportivas e áreas administrativas.',
    images: [
      '/images/colegio-fermas.jpg',
      '/images/colegio-fermas-fachada.jpg',
      '/images/obra-interior-estrutura.jpg'
    ]
  },
  {
    id: 'centro-medico',
    name: 'Centro Médico',
    category: 'Arquitectura',
    year: '2023',
    location: 'Luanda',
    summary: 'Volumetria contemporânea e circulação fluida',
    description: 'Projecto de arquitectura para um centro médico moderno, com volumetria contemporânea, boa iluminação natural e circulações internas pensadas para o conforto de pacientes e equipas clínicas.',
    images: [
      '/images/centro-medico.jpg',
      '/images/centro-medico-interior.jpg'
    ]
  },
  {
    id: 'complexo-eliada',
    name: 'Complexo Escolar Eliada',
    category: 'Construção',
    year: '2004',
    location: 'Luanda',
    summary: '36 salas, 1750 alunos',
    description: 'Um dos maiores complexos escolares do portefólio da PRO SOTA, com 36 salas de aula preparadas para acolher cerca de 1750 alunos.',
    images: [
      '/images/complexo-eliada.jpg',
      '/images/complexo-eliada-aerea.jpg',
      '/images/obra-em-progresso.jpg'
    ]
  },
  {
    id: 'apartamento-estoril',
    name: 'Apartamento · Estoril',
    category: 'Arquitectura',
    year: '2014',
    location: 'Estoril, Portugal',
    summary: 'Proposta de remodelação interior',
    description: 'Proposta de remodelação de interiores para um apartamento no Estoril, com renderizações fotorrealistas para apresentação ao cliente antes do início da obra.',
    images: [
      '/images/apartamento-estoril.jpg',
      '/images/apartamento-estoril-quarto.jpg'
    ]
  },
  {
    id: 'ad-sintra',
    name: 'AD Sintra',
    category: 'Construção',
    year: '2016',
    location: 'Mem Martins, Portugal',
    summary: 'Rés-do-chão transformado em local de culto',
    description: 'Transformação de um espaço de rés-do-chão em Mem Martins num local de culto, incluindo salão principal, átrio de entrada e áreas de apoio.',
    images: [
      '/images/ad-sintra.jpg',
      '/images/ad-sintra-entrada.jpg'
    ]
  },
  {
    id: 'multiverso-madrid',
    name: 'Multiverso · Madrid',
    category: 'Arquitectura',
    year: '2017',
    location: 'Madrid, Espanha',
    summary: 'Vencedor · 27ª edição Concurso Pladur',
    description: 'Projecto vencedor da 27ª edição do Concurso Pladur em Madrid, uma proposta arquitectónica reconhecida pela sua abordagem inovadora ao espaço e materiais.',
    images: [
      '/images/multiverso-madrid.jpg'
    ]
  },
  {
    id: 'estadio-da-luz',
    name: 'Estádio da Luz',
    category: 'Arquitectura',
    year: '2017',
    location: 'Lisboa, Portugal',
    summary: 'Remodelação da área de restauração · 2º lugar',
    description: 'Proposta para a remodelação da área de restauração e memorabilia do Estádio da Luz, classificada em 2º lugar em concurso.',
    images: [
      '/images/estadio-da-luz.jpg'
    ]
  }
];

export default PROSOTA_PROJECTS;

