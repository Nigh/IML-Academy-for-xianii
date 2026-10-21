import { lessons, modules } from '../src/lib/curriculum/catalog.ts';
import { topologicalOrder } from '../src/lib/curriculum/graph.ts';
console.log(
  `Curriculum: ${modules.length} modules, ${lessons.length} lessons, DAG ${topologicalOrder(lessons).length} nodes ✓`,
);
