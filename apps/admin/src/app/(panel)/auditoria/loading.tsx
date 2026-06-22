import { Card, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <Skeleton w={130} h={26} />
        <Skeleton w={200} h={13} style={{ marginTop: 9 }} />
      </div>
      <div className="flex flex-wrap" style={{ gap: 8, marginBottom: 16 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} w={84} h={30} radius={999} />
        ))}
      </div>
      <Card style={{ padding: 14 }}>
        <div className="flex flex-col" style={{ gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between" style={{ gap: 12 }}>
              <Skeleton w={150} h={13} />
              <Skeleton w={120} h={20} radius={999} />
              <Skeleton w={100} h={13} />
              <Skeleton w={140} h={13} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
