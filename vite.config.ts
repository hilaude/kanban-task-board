import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/kanban-task-board/",
  plugins: [react()],
});
