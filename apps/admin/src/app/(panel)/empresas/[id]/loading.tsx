import { Card, Skeleton, SkeletonText } from "@/components/ui";

export default function Loading() {
  return (
    <div>
      <Skeleton w={80} h={12} />
      <div className="flex items-center justify-between" style={{ gap: 16, margin: "12px 0 24px" }}>
        <div>
          <Skeleton w={180} h={26} />
          <Skeleton w={240} h={13} style={{ marginTop: 9 }} />
        </div>
        <Skeleton w={160} h={34} radius={10} />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ marginBottom: 26 }}>
          <Skeleton w={150} h={12} style={{ marginBottom: 10 }} />
          <Card style={{ padding: 16 }}>
            <SkeletonText lines={3} />
          </Card>
        </div>
      ))}
    </div>
  );
}
