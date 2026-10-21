export type Route =
  | { type: 'home' | 'curriculum' | 'progress' | 'not-found' }
  | { type: 'module' | 'lesson'; slug: string };
export function parseRoute(hash: string): Route {
  let path: string;
  try {
    path = decodeURIComponent(hash.replace(/^#/, '') || '/').replace(/\/$/, '') || '/';
  } catch {
    return { type: 'not-found' };
  }
  if (path === '/') return { type: 'home' };
  if (path === '/curriculum') return { type: 'curriculum' };
  if (path === '/progress') return { type: 'progress' };
  const match = /^\/(lesson|module)\/([a-z0-9/-]+)$/.exec(path);
  return match ? { type: match[1] as 'lesson' | 'module', slug: match[2] } : { type: 'not-found' };
}
