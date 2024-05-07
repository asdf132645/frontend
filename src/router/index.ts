// router/index.vue
import {createRouter, createWebHistory} from 'vue-router';
import {useStore} from "vuex";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'HomeView',
            component: () => import('@/views/HomeView.vue'), // 동적 임포트
        },
        {
            path: '/analysis',
            name: 'AnalysisView',
            component: () => import('@/views/HomeView.vue'), // 동적 임포트
        },
        {
            path: '/user/join',
            name: 'join',
            component: () => import('@/views/join/index.vue'), // 동적 임포트
        },
        {
            path: '/user/login',
            name: 'login',
            component: () => import('@/views/login/index.vue'), // 동적 임포트
        },
        {
            path: '/setting',
            name: 'setting',
            component: () => import('@/views/setting/index.vue'), // 동적 임포트
        },
        {
            path: '/database',
            name: 'database',
            component: () => import('@/views/datebase/index.vue'), // 동적 임포트
        },
        {
            path: '/databaseDetail',
            name: 'databaseDetail',
            component: () => import('@/views/datebase/commponent/detail/classInfo/listDetail.vue'), // 동적 임포트
        },
        {
            path: '/databaseWhole',
            name: 'databaseWhole',
            component: () => import('@/views/datebase/commponent/detail/databaseWhole/index.vue'), // 동적 임포트
        },
        {
            path: '/databaseRbc',
            name: 'databaseRbc',
            component: () => import('@/views/datebase/commponent/detail/rbc/listDetailRbc.vue'), // 동적 임포트
        },
        {
            path: '/report',
            name: 'report',
            component: () => import('@/views/datebase/commponent/detail/report/report.vue'), // 동적 임포트
        }
    ],
});

router.beforeEach((to, from, next) => {
    // 페이지 이동 전에 setInterval 정리
    // clearIntervalIfExists();
    // 세션 스토리지에서 사용자 정보 확인
    const storedUser = sessionStorage.getItem('user');
    const getStoredUser = JSON.parse(storedUser || '{}');
// 스토어
    const store = useStore();
    // 스토어에서 사용자 정보 확인
    const currentUser = store.state.userModule;

    if ((to.name !== 'login' && to.name !== 'join') && (!getStoredUser.userId && !currentUser.userId)) {
        // 로그인이 필요한 페이지에 접근하려고 할 때 로그인 페이지로 리다이렉트
        next('/user/login');
    } else {
        // 그 외의 경우에는 계속 진행
        next();
    }
});

export default router;
