import CreateDndWrapper from "./CreateDndWrapper";
import TierList from "./TierList";
import UnderList from "./UnderList";

export default function Page() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-zinc-950 pb-12 text-zinc-100">
      <CreateDndWrapper>
        <TierList />
        <UnderList />
      </CreateDndWrapper>
    </main>
  );
}
