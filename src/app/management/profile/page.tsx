import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Calendar,
  Pencil,
} from "lucide-react";

const tokens = {
  ink: "#F1F5F9",       // slate-100 — primary text
  paper: "#0F172A",      // slate-900 — page bg
  card: "#1E293B",       // slate-800 — card bg
  cardAlt: "#243244",    // between slate-800/700 — nested tiles
  slate700: "#334155",   // slate-700 — button + borders
  slate600: "#475569",   // slate-600 — hover borders
  stone: "#94A3B8",       // slate-400 — secondary text
  line: "#334155",        // slate-700 — hairlines
  bronze: "#C98A4B",      // warm accent, kept for icons/highlights
  bronzeBg: "#3A2E20",    // dark tint for icon chips
  olive: "#8FBF6B",
  oliveBg: "#26361F",
  amber: "#E0B84B",
  amberBg: "#3A2F14",
  rust: "#E0925C",
  rustBg: "#3A2313",
};

const statusStyles = {
  Completed: { bg: tokens.oliveBg, text: tokens.olive },
  Planning: { bg: tokens.amberBg, text: tokens.amber },
  "In Progress": { bg: tokens.rustBg, text: tokens.rust },
};

export default function ProfilePage() {
  const user = {
    name: "Love Cabungula",
    role: "Arquitecto Senior",
    company: "Pro-Sota Ltd.",
    email: "love.cabungula@example.com",
    phone: "+244 923 567 890",
    location: "Luanda, Angola",
    joined: "January 2022",
    avatar: "https://i.pravatar.cc/150?img=12",
  };

  const stats = [
    { title: "Projectos Activos", value: 8 },
    { title: "Conclu]ido", value: 24 },
    { title: "Comentário pendentes", value: 5 },
    { title: "Experiência", value: "7 anos" },
  ];

  const projects = [
    { name: "Skyline Towers", status: "In Progress", deadline: "12 Aug 2026" },
    { name: "Green Villa", status: "Planning", deadline: "20 Sep 2026" },
    { name: "Business Center", status: "Completed", deadline: "15 Jun 2026" },
  ];

  const info = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Phone", value: user.phone },
    { icon: MapPin, label: "Location", value: user.location },
    { icon: Building2, label: "Firm", value: user.company },
    { icon: Calendar, label: "Joined", value: user.joined },
  ];

  return (
    <div
      className="min-h-screen p-6 md:p-10 bg-slate-200"
    >
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Header */}
        <section
          className="rounded-3xl p-8 shadow-sm bg-white"
        >
          <div className="flex flex-col  gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl text-3xl font-semibold bg-gray-900 text-slate-200 font-serif"
              >
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>

              <div>
                <p
                  className="text-xs uppercase tracking-[0.2em] text-yellow-700"
                >
                  {user.company}
                </p>

                <h1
                  className="mt-2 text-4xl font-medium font-serif"
                >
                  {user.name}
                </h1>

                <p className="mt-1 text-sm text-gray-400">
                  {user.role}
                </p>
              </div>
            </div>

            <button
              className="cursor-pointer flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm text-slate-200 font-medium bg-gray-900 transition hover:opacity-90"
            >
              <Pencil size={16} />
              Edit profile
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-6 transition hover:-translate-y-1 bg-white shadow-xs"
            >
              <p className="text-xs uppercase tracking-widest text-gray-500" >
                {item.title}
              </p>
              <h3 className="mt-4 text-4xl font-serif">
                {item.value}
              </h3>
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-3">

          {/* Information */}
          <section
            className="rounded-3xl p-7 xl:col-span-1 bg-white"
          >
            <h2 className="mb-8 text-xl font-serif">
              Informação pessoal
            </h2>

            <div className="grid gap-6">
              {info.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl border"
                  >
                    <Icon size={18} className="text-slate-700" />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400" >
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section
            className="rounded-3xl p-7 xl:col-span-2 bg-white"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl" style={{ fontFamily: "Georgia, serif" }}>
                Projectos atribuídos
              </h2>

              <button
                className="rounded-lg px-4 py-2 text-sm transition bg-white text-gray-700  border border-transparent cursor-pointer hover:border-gray-400"
               
              >
                Ver todos
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 ">
              {projects.map((project) => {
                const s = statusStyles[project.status];
                return (
                  <article
                    key={project.name}
                    className="rounded-2xl p-5 transition hover:shadow-md border border-gray-300"
                  >
                    <div className="flex justify-between">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-600"
                      >
                        <Briefcase size={18} className="text-gray-200" />
                      </div>

                      <span
                        className={ `rounded-full px-3 py-1 text-xs font-medium flex items-center border `}
                        style={{ color: s.text }}
                      >
                        {project.status}
                      </span>
                    </div>

                    <h3 className="mt-5 text-lg font-medium">{project.name}</h3>

                    <p className="mt-2 text-sm text-gray-400" >
                      Deadline: {project.deadline}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}