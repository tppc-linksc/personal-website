const techColorMap: Record<string, string> = {
  React: "#61dafb",
  TypeScript: "#3178c6",
  "Next.js": "#000000",
  Tailwind: "#06b6d4",
  Vite: "#646cff",
  Zustand: "#b06b3b",
  CodeMirror: "#d7006b",
  Drizzle: "#c5f74f",
  SQLite: "#003b57",
  MDX: "#ffb13b",
  Monaco: "#ff80b5",
  Node: "#339933",
  Postgres: "#336791",
  "OpenAI API": "#412991",
  "Vector DB": "#6f42c1",
  Queue: "#e36209",
};

const defaultColor = "#586069";

export function techColor(tech: string): string {
  const key = Object.keys(techColorMap).find(
    (k) => tech.startsWith(k) || tech.toLowerCase() === k.toLowerCase()
  );
  return key ? techColorMap[key] : defaultColor;
}
