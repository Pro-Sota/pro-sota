export type Profile = {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl: string;

    contact: {
        email: string;
        phoneNumber: string;
    };

    professional: {
        role: string;
        department: string;
        skills: string[];
        certifications: string[];
    };

    account: {
        status: "active" | "inactive";
        createdAt: string;
        lastLogin?: string;
    };
};