// Theme management functionality

export function initTheme(): void {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (prefersDark ? 'dark' : 'light');

  setTheme(theme);
}

export function setTheme(theme: string): void {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);

  // Update theme icon by changing the icon name attribute
  const themeIcon = document.getElementById('themeIcon') as Element;
  if (themeIcon) {
    const iconName = theme === 'dark' ? 'lucide:sun' : 'lucide:moon';
    themeIcon.setAttribute('name', iconName);

    // For dynamic icon updates, we need to reload the icon
    const iconElement = themeIcon.closest('[data-icon]') || themeIcon;
    if (iconElement && 'reload' in iconElement) {
      (iconElement as any).reload();
    }
  }
}

export function toggleTheme(): void {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}