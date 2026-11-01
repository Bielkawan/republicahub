const colors: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-700",
  OCCUPIED: "bg-sky-100 text-sky-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-emerald-100 text-emerald-700",
  OVERDUE: "bg-red-100 text-red-700",
};

const labels: Record<string, string> = {
  AVAILABLE: "Disponível",
  OCCUPIED: "Ocupado",
  MAINTENANCE: "Manutenção",
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Atrasado",
};

export function Badge({ value }: { value: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[value] ?? "bg-slate-100 text-slate-600"}`}
    >
      {labels[value] ?? value}
    </span>
  );
}
