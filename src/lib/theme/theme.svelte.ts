export type ThemePreference = 'system' | 'light' | 'dark';
let preference: ThemePreference = 'system';
try {
  const saved = localStorage.getItem('iml-theme');
  if (saved === 'light' || saved === 'dark') preference = saved;
} catch {}
export const theme = $state({ preference });
export function applyTheme(value: ThemePreference) {
  theme.preference = value;
  const light =
    value === 'light' ||
    (value === 'system' && matchMedia('(prefers-color-scheme: light)').matches);
  document.documentElement.dataset.theme = light ? 'xianii-light' : 'xianii';
  try {
    localStorage.setItem('iml-theme', value);
  } catch {}
}
export function watchSystemTheme() {
  const query = matchMedia('(prefers-color-scheme: light)');
  const listener = () => {
    if (theme.preference === 'system') applyTheme('system');
  };
  query.addEventListener('change', listener);
  applyTheme(theme.preference);
  return () => query.removeEventListener('change', listener);
}
