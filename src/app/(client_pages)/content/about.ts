export const projectsCount = "11+";
export const countriesCount = "3";

export const values = [
  { title: "Rigor", description: "Trabalhamos com precisão, responsabilidade e atenção ao detalhe em todas as fases de cada projecto." },
  { title: "Compromisso", description: "Assumimos cada desafio com dedicação, transparência e responsabilidade perante os nossos clientes." },
  { title: "Excelência", description: "Procuramos soluções que conciliam qualidade técnica, funcionalidade e valor arquitectónico." },
  { title: "Visão", description: "Pensamos no futuro, desenvolvendo espaços e infra-estruturas preparados para responder às necessidades de amanhã." },
];

export const expertise = [
  {
    title: "Arquitectura",
    description: "Desenvolvimento de projectos arquitectónicos, organização de espaços interiores e exteriores, estudo de fachadas e apoio à visualização das soluções através de modelação tridimensional.",
    image: "/images/arquitectura.svg",
    alt: "Desenho de alçado de um edifício moderno com palas verticais e um volume dourado.",
    span: "md:col-span-7",
  },
  {
    title: "Engenharia",
    description: "Desenvolvimento e coordenação de soluções técnicas, incluindo estruturas e especialidades de instalações, com atenção à segurança, ao desempenho e à eficiência construtiva.",
    image: "/images/engenharia.svg",
    alt: "Desenho de uma ponte atirantada com cabos dourados.",
    span: "md:col-span-5",
  },
  {
    title: "Construção",
    description: "Construção, remodelação e reabilitação de edifícios, com coordenação dos trabalhos e atenção à qualidade de execução, aos materiais, aos prazos e ao controlo da obra.",
    image: "/images/construcao.svg",
    alt: "Desenho de uma estrutura em betão em construção, com andaimes e grua.",
    span: "md:col-span-5",
  },
  {
    title: "Fiscalização e Consultoria",
    description: "Acompanhamento técnico e fiscalização da execução, com verificação da conformidade com o projecto, registo da evolução da obra e apoio à tomada de decisões técnicas.",
    image: "/images/fiscalizacao.svg",
    alt: "Corte construtivo de um edifício com cotas de nível e uma lupa sobre uma ligação estrutural.",
    span: "md:col-span-7",
  },
];

// ---- Optional trust sections: each renders only when it has entries. ----
export type FeaturedProject = { title: string; type: string; image: string; alt: string; href: string };
export const featuredProjects: FeaturedProject[] = [
  // { title: "Nome do projecto", type: "Hotelaria · Luanda", image: "/images/projects/x.jpg", alt: "…", href: "/portfolio/x" },
];

export const credentials: string[] = [
  // "Alvará de construção — Classe …", "Ordem dos Engenheiros de Angola", "ISO 9001"
];

export type TeamMember = { name: string; role: string };

export const team: TeamMember[] = [
  // { name: "Nome Apelido", role: "Director Geral" },
];