export const dayPeriods = ["early-morning", "morning", "afternoon", "evening", "night"] as const;

export type DayPeriod = (typeof dayPeriods)[number];

export type DayPeriodDefinition = Readonly<{
   id: DayPeriod;
   label: string;
   rangeLabel: string;
   bestWindow: string;
}>;

export const dayPeriodDefinitions: readonly DayPeriodDefinition[] = [
   {
      id: "early-morning",
      label: "Early Morning",
      rangeLabel: "5:00–9:00 AM",
      bestWindow: "6:00–8:30 AM",
   },
   {
      id: "morning",
      label: "Morning",
      rangeLabel: "9:00 AM–12:00 PM",
      bestWindow: "9:30–11:30 AM",
   },
   {
      id: "afternoon",
      label: "Afternoon",
      rangeLabel: "12:00–5:00 PM",
      bestWindow: "12:30–4:30 PM",
   },
   {
      id: "evening",
      label: "Evening",
      rangeLabel: "5:00–9:00 PM",
      bestWindow: "5:30–8:30 PM",
   },
   {
      id: "night",
      label: "Night",
      rangeLabel: "9:00 PM–2:00 AM",
      bestWindow: "9:00 PM–1:00 AM",
   },
] as const;
