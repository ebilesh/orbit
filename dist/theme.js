(() => {
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try { preference = localStorage.getItem('orbit-theme') || 'system'; } catch {}
  if (!['system', 'light', 'dark'].includes(preference)) preference = 'system';
  function apply() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#212529' : '#f8f9fa';
    window.dispatchEvent(new Event('orbit-theme-change'));
  }
  apply();
  system.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    const control = document.querySelector('#theme');
    control.value = preference;
    control.addEventListener('change', () => {
      preference = control.value;
      try { localStorage.setItem('orbit-theme', preference); } catch {}
      apply();
    });
  });
})();
