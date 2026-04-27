import { Card } from "@/components/ui/card";

type Props = {
  label: string;
  value: string | number;
  note: string;
};

export function MetricCard({ label, value, note }: Props) {
  return (
    <Card className="rounded-[28px] p-6">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-4 font-heading text-4xl text-slate-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
    </Card>
  );
}
