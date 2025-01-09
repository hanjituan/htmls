import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/dashboard/Dashboard.vue'
import Recipes from '../views/recipes/index.vue'
import Ingredients from '../views/Ingredients.vue'
import IngredientEffects from '../views/IngredientEffects.vue'
import StockReport from '../views/reports/StockReport.vue'
import CostReport from '../views/reports/CostReport.vue'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard
    },
    {
        path: '/recipes',
        name: 'Recipes',
        component: Recipes
    },
    {
        path: '/ingredients',
        name: 'Ingredients',
        component: Ingredients
    },
    {
        path: '/ingredients/effects',
        name: 'IngredientEffects',
        component: IngredientEffects
    },
    {
        path: '/reports/stock',
        name: 'StockReport',
        component: StockReport
    },
    {
        path: '/reports/cost',
        name: 'CostReport',
        component: CostReport
    },
    {
        path: '/settings',
        name: 'UserSettings',
        component: () => import('@/views/UserSettings.vue'),
        meta: {
            title: '个人设置'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router 