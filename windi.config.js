import { defineConfig } from 'windicss/helpers'

export default defineConfig({
    plugins: [
        require('@windicss/plugin-scrollbar'),
    ],
    extract: {
        include: ['src/**/*.{vue,html,jsx,tsx}'],
        exclude: ['node_modules', '.git'],
    },
}) 