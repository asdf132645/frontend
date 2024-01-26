// router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '@/views/HomeView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'HomeView',
        component: HomeView,
    },
    {
        path: '/analysis',
        name: 'AnalysisView', // 수정: 다른 이름으로 변경
        component: HomeView,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
