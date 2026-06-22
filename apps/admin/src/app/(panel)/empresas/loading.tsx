import { Card, Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 22, gap: 16 }}>
        <div>
          <Skeleton w={130} h={26} />
          <Skeleton w={210} h={13} style={{ marginTop: 9 }} />
        </div>
        <Skeleton w={150} h={38} radius={10} />
      </div>
      <Card style={{ padding: 14 }}>
        <div className="flex flex-col" style={{ gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between" style={{ gap: 12 }}>
              <Skeleton w={160} h={14} />
              <Skeleton w={70} h={20} radius={999} />
              <Skeleton w={60} h={14} />
              <Skeleton w={90} h={14} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
