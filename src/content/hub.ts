export type GameRoom = {
  index: string;
  title: string;
  genre: string;
  description: string;
  status: string;
  mark: string;
};

export const gameRooms: readonly GameRoom[] = [
  {
    index: "01",
    title: "YOR CHESS",
    genre: "Strategy / board room",
    description: "A tactile chess room with a slower, more deliberate interface.",
    status: "ROOM CONCEPT",
    mark: "♞",
  },
  {
    index: "02",
    title: "NEON SNAKE",
    genre: "Arcade / reflex",
    description: "A compact arcade loop built around timing, pressure, and a clean score chase.",
    status: "ROOM CONCEPT",
    mark: "✦",
  },
  {
    index: "03",
    title: "MEMORY PROTOCOL",
    genre: "Pattern / focus",
    description: "A quiet memory game for the space between a build and the next idea.",
    status: "ROOM CONCEPT",
    mark: "◈",
  },
  {
    index: "04",
    title: "TYPE // RUSH",
    genre: "Speed / keyboard",
    description: "A typing room for people who treat their keyboard like an instrument.",
    status: "ROOM CONCEPT",
    mark: "⌁",
  },
] as const;

export type VideoWallItem = {
  index: string;
  category: string;
  title: string;
  description: string;
  tone: "crimson" | "violet" | "amber" | "blue";
};

export const videoWall: readonly VideoWallItem[] = [
  {
    index: "01",
    category: "BUILD LOG",
    title: "The making of the field hub",
    description: "A reserved slot for the next studio walkthrough and product note.",
    tone: "crimson",
  },
  {
    index: "02",
    category: "GAME ROOM",
    title: "Chess, systems, and the long game",
    description: "A future cut for the arcade shelf, from board state to interface state.",
    tone: "violet",
  },
  {
    index: "03",
    category: "STUDIO DIARY",
    title: "What changed in version two",
    description: "A place for honest build notes, decisions, and the work behind the polish.",
    tone: "amber",
  },
  {
    index: "04",
    category: "FIELD NOTES",
    title: "Outside the build log",
    description: "A visual wall for the things that shape the work away from the editor.",
    tone: "blue",
  },
] as const;

export const youtubeChannel = "https://www.youtube.com/@YorAyriniwnl";
