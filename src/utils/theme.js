const THEME_KEY = 'user-theme';

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'auto';
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}

export function applyTheme(theme) {
  // Element Plus 暗黑模式只需要在 html 根元素上添加 dark 类名即可
  const darkClass = 'dark';
  const root = document.documentElement;

  const applyDarkMode = (isDark) => {
    if (isDark) {
      root.classList.add(darkClass);
    } else {
      root.classList.remove(darkClass);
    }
  };

  if (theme === 'light') {
    applyDarkMode(false);
  } else if (theme === 'dark') {
    applyDarkMode(true);
  } else if (theme === 'auto') {
    // 根据系统主题设置
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyDarkMode(mediaQuery.matches);

    // 监听系统主题变化
    mediaQuery.addEventListener('change', (e) => {
      if (getTheme() === 'auto') {
        applyDarkMode(e.matches);
      }
    });
  }
}