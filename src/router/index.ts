// router/index.vue
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import JoinView from '@/views/join/index.vue';
import loginView from '@/views/login/index.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'HomeView',
        component: HomeView,
    },
    {
        path: '/analysis',
        name: 'AnalysisView',
        component: HomeView,
    },
    {
        path: '/user/join',
        name: 'join',
        component: JoinView,
    },
    {
        path: '/user/login',
        name: 'login',
        component: loginView,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
