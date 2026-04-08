export default function RoomLoading() {
  return (
    <div className="flex flex-1 justify-center bg-bg-secondary">
      <div className="w-full max-w-sm bg-bg-primary min-h-dvh">
        <div className="px-[18px] py-[22px]">
          <div className="animate-pulse space-y-4">
            <div className="h-5 bg-bg-secondary rounded w-1/3" />
            <div className="h-3 bg-bg-secondary rounded w-1/2" />
            <div className="h-24 bg-bg-secondary rounded" />
            <div className="h-16 bg-bg-secondary rounded" />
            <div className="h-16 bg-bg-secondary rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
