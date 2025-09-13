export type GroupColorSet = {
  main: string;
  accent: string;
  soft: string;
  dark: string;
  text: string;
  bg: string;
};

export const defaultColors: GroupColorSet = {
  main: "#212F84",
  accent: "#212F84",
  soft: "#facc15",
  dark: "#111827",
  text: "#374151",
  bg: "#f3f4f6",
};

export const groupColors: Record<string, GroupColorSet> = {
  "6A": {
    ...defaultColors,
    main: "#1E3A8A",
    accent: "#3646b3",
  },
  "6B": {
    ...defaultColors,
    main: "#1E40AF",
    accent: "#2563EB",
  },
  "6C": {
    ...defaultColors,
    main: "#3730A3",
    accent: "#4F46E5",
  },
  "6D": {
    ...defaultColors,
    main: "#312E81",
    accent: "#4338CA",
  },
};
