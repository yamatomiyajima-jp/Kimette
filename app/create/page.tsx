import { CreateRoomForm } from "./create-room-form";

export default function CreatePage() {
  return (
    <div className="flex flex-1 justify-center bg-bg-secondary">
      <div className="w-full max-w-sm bg-bg-primary min-h-dvh">
        <div className="px-[18px] py-[22px]">
          <h1 className="text-[17px] font-medium text-text-primary m-0">
            ルームを作成
          </h1>
          <p className="text-xs text-text-secondary mt-0 mb-[18px]">
            みんなで選ぼう
          </p>

          <CreateRoomForm />
        </div>
      </div>
    </div>
  );
}
