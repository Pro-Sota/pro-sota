export type Solution = {
    id: string;
    name: string;
    category: string;
    description: string;
    image:string;
    /** Audiences or scope items shown as small tags on the card */
    tags: string[];
    href: string;
    action: string;
    visual: {
        title: string;
        subtitle: string;
        /** Full Tailwind class string (keep complete so Tailwind can detect it) */
        gradient: string;
    };
    comingSoon?: boolean;
};

export const SOLUTIONS: Solution[] = [
    {
        id: "pro-sota-360",
        name: "PRO SOTA 360°",
        category: "GESTÃO E MANUTENÇÃO",
        description: "Cuidamos de edifícios e espaços através de soluções de manutenção preventiva e correctiva, adaptadas às necessidades de cada imóvel.",
        tags: ["Escolas", "Bancos", "Espaços comerciais", "Habitações"],
        href: "/contact?servico=pro-sota-360",
        action: "Conhecer a solução",
        visual: {
            title: "360°",
            subtitle: "Cuidado integral do seu imóvel",
            gradient: "bg-[radial-gradient(circle_at_75%_25%,rgba(189,150,85,0.32),transparent_38%),linear-gradient(135deg,#292824,#1F1E1B)]",
        },
        image: "/images/prosota_360.svg"
    },
    {
        id: "chave-na-mao",
        name: "Chave na Mão",
        category: "PROJECTO E CONSTRUÇÃO",
        description: "Uma solução integrada que acompanha todas as etapas de um projecto, desde a concepção arquitectónica e engenharia até à fiscalização e construção.",
        tags: ["Arquitectura", "Engenharia", "Fiscalização", "Construção"],
        href: "/contact?servico=chave-na-mao",
        action: "Conhecer a solução",
        visual: {
            title: "PROJECTO.",
            subtitle: "Da ideia à concretização.",
            gradient: "bg-[radial-gradient(circle_at_20%_80%,rgba(189,150,85,0.28),transparent_42%),linear-gradient(135deg,#3A3832,#1F1E1B)]",
        },
        image: "/images/key_on_hand.svg"
    },
    {
        id: "sos-casas",
        name: "SOS Casas",
        category: "ASSISTÊNCIA RESIDENCIAL",
        description: "Uma plataforma digital em desenvolvimento que permitirá solicitar serviços de manutenção e reparação residencial, com resposta num prazo de até 24 horas.",
        tags: ["Assistência residencial", "Reparações", "Manutenção"],
        href: "/contact?servico=sos-casas&interesse=lancamento",
        action: "Registar interesse",
        comingSoon: true,
        visual: {
            title: "24H",
            subtitle: "A sua casa, a nossa prioridade.",
            gradient: "bg-[radial-gradient(circle_at_80%_20%,rgba(189,150,85,0.35),transparent_40%),linear-gradient(135deg,#65543C,#292824)]",
        },
      image: "/images/sos_casas.svg"

    },
];