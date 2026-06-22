import { Card, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <Skeleton w={120} h={26} />
        <Skeleton w={200} h={13} style={{ marginTop: 9 }} />
      </div>
      <Card style={{ padding: 18, marginBottom: 22 }}>
        <Skeleton w={220} h={14} style={{ marginBottom: 12 }} />
        <div className="flex flex-wrap items-end" style={{ gap: 10 }}>
          <Skeleton w={200} h={38} radius={10} />
          <Skeleton w={160} h={38} radius={10} />
          <Skeleton w={200} h={38} radius={10} />
          <Skeleton w={90} h={38} radius={10} />
        </div>
      </Card>
      <div className="flex flex-col" style={{ gap: 12 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} style={{ padding: 16 }}>
            <Skeleton w={140} h={15} />
            <Skeleton w={180} h={12} style={{ marginTop: 8, marginBottom: 12 }} />
            <div className="flex flex-wrap" style={{ gap: 8 }}>
              <Skeleton w={110} h={26} radius={999} />
              <Skeleton w={90} h={26} radius={999} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
