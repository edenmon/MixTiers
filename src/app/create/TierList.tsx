import Rows from "./Rows";
import TierListHeader from "./TierListHeader";

export default function TierList() {
  return (
    <div id="tier-list-capture" className="px-4 pt-6 sm:px-6 sm:pt-8">
      <TierListHeader />
      <Rows />
    </div>
  );
}
