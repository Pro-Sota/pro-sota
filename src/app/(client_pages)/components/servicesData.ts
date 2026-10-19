// Catálogo partilhado, baseado no portefólio institucional da PRO SOTA.


export const SERVICE_KEYS = [
  "arquitectura",
  "engenharia",
  "construcao",
  "fiscalizacao",
] as const;

export type ServiceKey = (typeof SERVICE_KEYS)[number];

export interface Service {
  key: ServiceKey;
  num: string;
  title: string;
  label: string;
  intro: string;
  items: [string, string][];
}

export const services = [
  {
    "key": "arquitectura",
    "num": "01",
    "title": "Arquitectura",
    "label": "Modelação & Projecto",
    "intro": "Espaços pensados para a forma como vive e trabalha.",
    "items": [
      [
        "Projecto arquitectónico",
        "Plantas, cortes e organização de espaços para construção ou remodelação."
      ],
      [
        "Modelação 3D e renderização",
        "Modelos e imagens realistas para visualizar o projecto antes da obra."
      ],
      [
        "Plantas humanizadas",
        "Plantas ilustradas com mobiliário, cores e texturas para apresentações."
      ],
      [
        "Projecto de interiores",
        "Organização dos espaços, materiais e iluminação para conforto e funcionalidade."
      ],
      [
        "Projecto de fachadas",
        "Soluções estéticas e funcionais para o exterior dos edifícios."
      ],
      [
        "Regularização arquitectónica",
        "Adequação de construções existentes para preparar o licenciamento."
      ]
    ]
  },
  {
    "key": "engenharia",
    "num": "02",
    "title": "Engenharia",
    "label": "Cálculo & Instalações",
    "intro": "Soluções técnicas para construir com segurança e eficiência.",
    "items": [
      [
        "Projecto estrutural",
        "Dimensionamento de fundações, vigas, lajes e pilares com segurança e economia."
      ],
      [
        "Projecto eléctrico",
        "Circuitos, quadros, iluminação e tomadas com segurança e eficiência."
      ],
      [
        "Projecto hidrossanitário",
        "Planeamento das redes de água, esgoto e drenagem pluvial."
      ],
      [
        "Projecto de gás e incêndio",
        "Redes de gás e sistemas de combate a incêndio, com equipamentos e sinalização."
      ],
      [
        "Projecto de climatização",
        "Ar condicionado, ventilação e exaustão para conforto térmico e eficiência."
      ],
      [
        "Projecto de energia solar",
        "Sistemas fotovoltaicos dimensionados para habitações e empreendimentos."
      ],
      [
        "Levantamento topográfico",
        "Medição do relevo, dimensões e limites do terreno para orientar o projecto."
      ]
    ]
  },
  {
    "key": "construcao",
    "num": "03",
    "title": "Construção & Obras Públicas",
    "label": "Execução de Obra",
    "intro": "Execução cuidada, do primeiro alicerce à entrega.",
    "items": [
      [
        "Construção de raiz",
        "Execução de edifícios residenciais e comerciais, das fundações à entrega."
      ],
      [
        "Remodelações e reabilitação integrada",
        "Renovação de espaços e modernização de infraestruturas para novos usos."
      ],
      [
        "Gestão e fiscalização de obra",
        "Controlo da execução, qualidade e segurança dos trabalhos no terreno."
      ],
      [
        "Impermeabilização e isolamentos",
        "Protecção contra humidades e isolamento térmico e acústico."
      ],
      [
        "Acabamentos de especialidade",
        "Revestimentos, pavimentos, pinturas e carpintarias com atenção ao detalhe."
      ],
      [
        "Manutenção de edifícios",
        "Manutenção preventiva e correctiva para conservar o imóvel e a segurança."
      ]
    ]
  },
  {
    "key": "fiscalizacao",
    "num": "04",
    "title": "Fiscalização & Consultoria",
    "label": "Controlo & Consultoria",
    "intro": "Acompanhamento técnico para decisões bem fundamentadas.",
    "items": [
      [
        "Fiscalização técnica",
        "Verificação da obra face ao projecto, às normas e ao cronograma."
      ],
      [
        "Relatórios técnicos de obra",
        "Registo da evolução, materiais e conformidades, acompanhado de fotografias."
      ],
      [
        "Gestão de empreiteiros e subcontratados",
        "Supervisão das equipas, tarefas e condições de segurança no estaleiro."
      ],
      [
        "Consultoria pré-obra",
        "Análise do terreno e da viabilidade para preparar a construção."
      ],
      [
        "Consultoria para licenciamento",
        "Apoio na documentação e submissão de processos de licenciamento."
      ],
      [
        "Estudos de viabilidade técnica e económica",
        "Avaliação de custos, condições locais e retorno previsto do projecto."
      ],
      [
        "Análise patológica e avaliação técnica",
        "Vistorias para identificar humidades, fissuras e falhas, com propostas de solução."
      ]
    ]
  }
];
