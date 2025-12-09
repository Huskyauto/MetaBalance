import { FastingTimer } from "../FastingTimer";

export default function FastingTimerExample() {
  return (
    <div className="p-4 max-w-md">
      <FastingTimer protocol="16:8 TRE" targetHours={16} />
    </div>
  );
}
