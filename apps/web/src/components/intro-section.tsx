import {
  Card,
  CardContent,
  CardHeader,
} from "@tk2-pkpl/ui/components/card";

const TEAM_MEMBERS = [
  { name: "Heraldo Arman", npm: "2406420702" },
  { name: "Valerian Hizkia Emmanuel", npm: "2406495382" },
  { name: "Muhammad Rifqi Ilham", npm: "2406495483" },
  { name: "Ryan Gibran Purwacakra Sihaloho", npm: "2406419833" },
  { name: "Cyrillo Praditya Soeharto", npm: "2406495413" },
];

export default function IntroSection() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Tugas 2 - Kelompok
        </p>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground">
          Authentication &amp; Authorization
        </h1>
        <p className="text-xl text-muted-foreground">
          by PKPL: Pusing Kurang Paham Lur
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="pb-4 text-center">
          <p className="text-lg font-semibold">Team Members</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {TEAM_MEMBERS.map((member, index) => (
              <div
                key={member.npm}
                className="flex items-center justify-between rounded-md border bg-card px-4 py-2 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                    {index + 1}
                  </span>
                  <span className="font-medium">{member.name}</span>
                </div>
                <span className="font-mono text-sm text-muted-foreground">
                  {member.npm}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
