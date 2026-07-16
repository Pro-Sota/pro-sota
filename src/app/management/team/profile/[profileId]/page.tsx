import Image from "next/image";
import { profiles } from "../data";
import { Profile } from "../types";

type PageProps = {
    params: Promise<{
        profileId: string;
    }>;
};

export default async function ProfilePage({ params }: PageProps) {
    const { profileId } = await params;

    const profile = profiles.find((p) => p.id === profileId) as Profile;

    return (
        <div className="bg-gray-100 min-h-screen p-8 text-gray-800 ">
            <div className="w-full">
                <h1 className="text-3xl font-semibold text-gray-900">
                    Perfil
                </h1>
            </div>

            {/* Profile Header */}
            <div className="flex justify-center">
                <div className="space-y-8 mt-8 w-[40%] flex flex-col justify-center">
                    <section className="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">

                            <div className="w-28 h-28 rounded-full overflow-hidden border border-gray-300">
                                <Image
                                    src={profile.photoUrl}
                                    width={120}
                                    height={120}
                                    alt={`${profile.firstName} ${profile.lastName}`}
                                    className="object-cover"
                                />
                            </div>

                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {profile.firstName} {profile.lastName}
                                </h2>

                                <p className="text-gray-600">
                                    {profile.professional.role}
                                </p>

                                <p className="text-sm text-gray-500">
                                    {profile.professional.department}
                                </p>
                            </div>
                        </div>
                        <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
                            Edit Profile
                        </button>
                    </section>

                    {/* Personal Information */}
                    <section className="bg-white rounded-lg border border-gray-200 p-6">

                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Personal Information
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Email
                                </p>
                                <p className="text-gray-900">
                                    {profile.contact.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Phone
                                </p>
                                <p className="text-gray-900">
                                    {profile.contact.phoneNumber}
                                </p>
                            </div>
                        </div>
                    </section>


                    {/* Professional Information */}
                    <section className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Professional Information
                        </h2>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Role
                                </p>

                                <p className="text-gray-900">
                                    {profile.professional.role}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">
                                    Skills
                                </p>

                                <div className="flex flex-wrap gap-2 mt-2">
                                    {profile.professional.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className="bg-gray-200 px-3 py-1 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}