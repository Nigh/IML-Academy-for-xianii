import { lessons } from '../lib/curriculum/catalog.ts';
export function adjacentLessons(id: string) {
  const index = lessons.findIndex((l) => l.id === id);
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 ? lessons[index + 1] : undefined,
  };
}
