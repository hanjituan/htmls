// 主题类型
export const ThemeType = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
}

// 获取系统主题偏好
const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

// 应用主题
const applyTheme = (theme) => {
    const root = document.documentElement
    const actualTheme = theme === ThemeType.SYSTEM ? getSystemTheme() : theme

    if (actualTheme === ThemeType.DARK) {
        root.classList.add('dark')
        document.body.setAttribute('el-theme', 'dark')
    } else {
        root.classList.remove('dark')
        document.body.removeAttribute('el-theme')
    }

    // 保存到本地存储
    localStorage.setItem('theme', theme)
}

// 监听系统主题变化
const watchSystemTheme = (callback) => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', callback)
    return () => mediaQuery.removeEventListener('change', callback)
}

export const useTheme = () => {
    // 初始化主题
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || ThemeType.SYSTEM
        applyTheme(savedTheme)
        return savedTheme
    }

    // 切换主题
    const changeTheme = (theme) => {
        applyTheme(theme)
    }

    return {
        initTheme,
        changeTheme,
        watchSystemTheme
    }
} 