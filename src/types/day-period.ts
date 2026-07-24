export const dayPeriods = ["morning", "afternoon", "evening"] as const;

export type DayPeriod = (typeof dayPeriods)[number];

export type DayPeriodDefinition = Readonly<{
   id: DayPeriod;
   label: string;
   rangeLabel: string;
   bestWindow: string;
}>;

export const dayPeriodDefinitions = [
   {
      id: "morning",
      label: "Morning",
      rangeLabel: "8:00 AM–12:00 PM",
      bestWindow: "9:00 AM–11:00 AM",
   },
   {
      id: "afternoon",
      label: "Afternoon",
      rangeLabel: "12:00 PM–5:00 PM",
      bestWindow: "1:00 PM–3:00 PM",
   },
   {
      id: "evening",
      label: "Evening",
      rangeLabel: "5:00 PM–11:00 PM",
      bestWindow: "6:30 PM–8:30 PM",
   },
] satisfies readonly DayPeriodDefinition[];
