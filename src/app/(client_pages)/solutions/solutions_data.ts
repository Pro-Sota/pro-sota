
export type Solution = {
    id: string;
    slug: string;
    name: string;
    category: string;
    headline: string;
    description: string;
    audiences: string[];
    services: string[];
    tags: string[];
    image: string;
    href: string;
    action: string;
    status: "available" | "development";
    visual: {
        title: string;
        subtitle: string;
        gradient: string;
    };
};

export const SOLUTIONS: Solution[] = [
    {
        id: "pro-sota-360",
        slug: "pro-sota-360",
        name: "PRO SOTA 360°",
        category: "GESTÃO, MANUTENÇÃO E REMODELAÇÃO",
        headline:
            "Cuidamos dos seus espaços. Preservamos e valorizamos o seu património.",
        description:
            "Uma solução integrada de manutenção preventiva e correctiva, inspecção técnica e remodelação de infraestruturas. Asseguramos melhores condições de conservação, segurança e funcionalidade dos imóveis através de serviços contínuos e programados.",
        audiences: [
            "Escolas e instituições de ensino",
            "Moradias",
            "Bancos e instituições financeiras",
            "Lojas e espaços comerciais",
            "Edifícios e condomínios",
        ],
        services: [
            "Manutenção preventiva",
            "Manutenção correctiva",
            "Inspecções técnicas",
            "Reparações programadas",
            "Remodelação de espaços",
            "Acompanhamento de instalações",
        ],
        tags: ["Escolas", "Bancos", "Espaços comerciais", "Habitações"],
        image: "/images/prosota_360.svg",
        href: "/contact?servico=pro-sota-360",
        action: "Solicitar uma proposta",
        status: "available",
        visual: {
            title: "360°",
            subtitle: "CUIDAMOS DO SEU PATRIMÓNIO",
            gradient:
                "bg-[radial-gradient(circle_at_75%_25%,rgba(189,150,85,0.35),transparent_38%),linear-gradient(135deg,#002950,#06436b)]",
        },
    },
    {
        id: "sos-casas",
        slug: "sos-casas",
        name: "SOS Casas",
        category: "APLICAÇÃO DIGITAL DE ASSISTÊNCIA RESIDENCIAL",
        headline:
            "Uma solução simples para resolver as emergências da sua casa.",
        description:
            "Uma aplicação digital em desenvolvimento que permitirá solicitar assistência técnica residencial para situações como avarias eléctricas, problemas de canalização, fugas de água, infiltrações e outras necessidades de reparação. Consoante a hora de submissão do pedido, a resposta será prevista para o próprio dia ou para o dia seguinte.",
        audiences: [
            "Proprietários de habitações",
            "Inquilinos",
            "Famílias",
            "Utilizadores que necessitam de assistência residencial",
        ],
        services: [
            "Pedidos de assistência residencial",
            "Avarias eléctricas",
            "Problemas de canalização",
            "Fugas de água e infiltrações",
            "Reparações domésticas",
            "Acompanhamento dos pedidos",
        ],
        tags: [
            "Assistência residencial",
            "Emergências domésticas",
            "Aplicação digital",
        ],
        image: "/images/sos_casas.svg",
        href: "/contact?servico=sos-casas&interesse=lancamento",
        action: "Registar interesse",
        status: "development",
        visual: {
            title: "SOS",
            subtitle: "A SUA CASA, A NOSSA PRIORIDADE",
            gradient:
                "bg-[radial-gradient(circle_at_80%_20%,rgba(189,150,85,0.35),transparent_40%),linear-gradient(135deg,#65543C,#002950)]",
        },
    },
    {
        id: "chave-na-mao",
        slug: "chave-na-mao",
        name: "Chave na Mão",
        category: "REMODELAÇÃO E CONSTRUÇÃO",
        headline:
            "Da transformação à construção, realizamos o seu projecto.",
        description:
            "Uma solução completa para a remodelação de imóveis existentes e construção de novas moradias desde a raiz. Integramos arquitectura, engenharia, execução de obras, fiscalização e acabamentos, acompanhando cada etapa até à entrega do imóvel.",
        audiences: [
            "Proprietários de imóveis",
            "Particulares",
            "Investidores imobiliários",
            "Promotores imobiliários",
        ],
        services: [
            "Remodelação integral de moradias",
            "Reabilitação e modernização de casas",
            "Construção desde a raiz",
            "Projectos de arquitectura",
            "Projectos de engenharia",
            "Fiscalização e acompanhamento de obras",
            "Acabamentos e entrega do imóvel",
        ],
        tags: ["Arquitectura", "Engenharia", "Fiscalização", "Construção"],
        image: "/images/key_on_hand.svg",
        href: "/contact?servico=chave-na-mao",
        action: "Falar sobre um projecto",
        status: "available",
        visual: {
            title: "PROJECTO.",
            subtitle: "DA CONCEPÇÃO À ENTREGA",
            gradient:
                "bg-[radial-gradient(circle_at_80%_20%,rgba(189,150,85,0.4),transparent_38%),linear-gradient(135deg,#BD9655,#002950)]",
        },
    },
];
