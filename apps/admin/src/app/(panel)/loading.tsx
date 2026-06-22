import { Card, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <Skeleton w={120} h={26} />
        <Skeleton w={200} h={13} style={{ marginTop: 9 }} />
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} style={{ padding: 16 }}>
            <Skeleton w={90} h={11} />
            <Skeleton w={64} h={28} style={{ marginTop: 12 }} />
            <Skeleton w={120} h={11} style={{ marginTop: 10 }} />
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 28 }}>
        <Skeleton w={130} h={12} style={{ marginBottom: 10 }} />
        <Card style={{ padding: 14 }}>
          <div className="flex flex-col" style={{ gap: 14 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between" style={{ gap: 12 }}>
                <Skeleton w={140} h={20} radius={999} />
                <Skeleton w={120} h={12} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
