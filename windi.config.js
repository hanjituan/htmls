import { defineConfig } from 'windicss/helpers'
import scrollbar from '@windicss/plugin-scrollbar'


export default defineConfig({
    darkMode: 'class',
    plugins: [
        scrollbar
    ],
    extract: {
        include: ['src/**/*.{vue,html,jsx,tsx}'],
        exclude: ['node_modules', '.git'],
    },
}) 