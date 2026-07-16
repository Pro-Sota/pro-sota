import { Profile } from "./types";

export const profiles: Profile[] = [
    {
        id: "1",
        firstName: "Maria",
        lastName: "Silva",
        photoUrl: "/images/profile.png",

        contact: {
            email: "maria.silva@prosota.com",
            phoneNumber: "+244 923 456 789",
        },

        professional: {
            role: "Senior Architect",
            department: "Architecture & Design",
            skills: [
                "Revit",
                "BIM",
                "AutoCAD",
            ],
            certifications: [
                "LEED Green Associate",
            ],
        },

        account: {
            status: "active",
            createdAt: "2024-03-15",
            lastLogin: "2026-07-16T09:30:00Z",
        },
    },

    {
        id: "2",
        firstName: "Carlos",
        lastName: "Mendes",
        photoUrl: "/images/profile.png",

        contact: {
            email: "carlos.mendes@prosota.com",
            phoneNumber: "+244 934 222 111",
        },

        professional: {
            role: "Project Manager",
            department: "Project Management",
            skills: [
                "Project Planning",
                "Construction Management",
                "Budget Control",
            ],
            certifications: [
                "PMP Certification",
            ],
        },

        account: {
            status: "active",
            createdAt: "2023-08-20",
            lastLogin: "2026-07-15T14:20:00Z",
        },
    },

    {
        id: "3",
        firstName: "Ana",
        lastName: "Fernandes",
        photoUrl: "/images/profile.png",

        contact: {
            email: "ana.fernandes@prosota.com",
            phoneNumber: "+244 911 555 333",
        },

        professional: {
            role: "Interior Designer",
            department: "Interior Design",
            skills: [
                "SketchUp",
                "3ds Max",
                "Material Selection",
            ],
            certifications: [
                "Interior Design Diploma",
            ],
        },

        account: {
            status: "inactive",
            createdAt: "2022-11-10",
            lastLogin: "2026-01-05T08:10:00Z",
        },
    },
];