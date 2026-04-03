import Image from "next/image";
import Link from "next/link";
import { createServerCaller } from "@/utils/server-caller";
import { formatRelativeTime } from "@tk2-pkpl/ui/lib/time-utils";

const TEAM_MEMBERS = [
  { name: "Heraldo Arman", npm: "2406420702", avatar: "/HeraldoArman.webp", link: "https://www.linkedin.com/in/heraldo-arman/" as const },
  { name: "Valerian Hizkia Emmanuel", npm: "2406495382", avatar: "/valerian-hizkia-emmanuel.webp", link: "https://www.linkedin.com/in/valhize/" as const },
  { name: "Muhammad Rifqi Ilham", npm: "2406495483", avatar: "/muhammad-rifqi-ilham.webp", link: "https://www.linkedin.com/in/rifqi-ilham/" as const },
  { name: "Ryan Gibran Purwacakra Sihaloho", npm: "2406419833", avatar: "/ryan.jpg", link: "https://www.linkedin.com/in/ryansihaloho/" as const },
  { name: "Cyrillo Praditya Soeharto", npm: "2406495413", avatar: "/cyrillo-praditya-soeharto.webp", link: "https://www.linkedin.com/in/cyrillo-praditya-soeharto-b67605324/" as const },
];

async function getThemeInfo() {
  const caller = await createServerCaller();
  const result = await caller.admin.getTheme();
  return {
    themeUpdatedAt: result.themeUpdatedAt,
    themeChangedBy: result.themeChangedBy,
  };
}

export default async function IntroSection() {
  const { themeUpdatedAt, themeChangedBy } = await getThemeInfo();

  return (
    <section className="bg-background py-16 md:py-32">
      <div className="mx-auto max-w-5xl border-t px-6">
        <span className="text-caption -ml-6 -mt-3.5 block w-max bg-background px-6">
          Team
        </span>

        <div className="mt-12 gap-4 sm:grid sm:grid-cols-2 md:mt-24">
          <div className="sm:w-2/5">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Our dream team
            </h2>
          </div>
          <div className="mt-6 sm:mt-0">
            <p className="text-xl font-medium tracking-tight text-muted-foreground sm:text-2xl">
              Tugas 2 - Kelompok
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight sm:text-4xl">
              PKPL: Pusing Kurang Paham Lur
            </p>
          </div>
        </div>

        <div className="mt-12 md:mt-24">
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM_MEMBERS.map((member, index) => (
              <div key={member.npm} className="group overflow-hidden">
                {member.avatar ? (
                  <Image
                    className="h-96 w-full rounded-md object-cover object-top grayscale transition-all duration-500 hover:grayscale-0 group-hover:h-[22.5rem] group-hover:rounded-xl"
                    src={member.avatar}
                    alt={member.name}
                    width={826}
                    height={1239}
                    sizes="(max-width: 768px) 100vw, 280px"
                  />
                ) : (
                  <div className="h-96 w-full rounded-md bg-gradient-to-br from-muted to-muted-foreground/20 object-cover object-top grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:rounded-xl" />
                )}
                <div className="px-2 pt-2 sm:pb-0 sm:pt-4">
                  <div className="flex justify-between">
                    <h3 className="text-base font-medium transition-all duration-500 group-hover:tracking-wider">
                      {member.name}
                    </h3>
                    <span className="text-xs">_0{index + 1}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-muted-foreground inline-block translate-y-6 text-sm opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      {member.npm}
                    </span>
                    <Link
                      href={member.link}
                      className="group-hover:text-primary inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100"
                    >
                      LinkedIn
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {themeUpdatedAt && (
          <p className="mt-12 text-sm text-muted-foreground md:mt-24">
            Theme changed by {themeChangedBy}{" "}
            {formatRelativeTime(new Date(themeUpdatedAt))}
          </p>
        )}
      </div>
    </section>
  );
}
