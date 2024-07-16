// router/index.vue
import {createRouter, createWebHistory} from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import JoinView from '@/views/join/index.vue';
import loginView from '@/views/login/index.vue';
import setting from '@/views/setting/index.vue'
import Database from '@/views/datebase/index.vue';
import DatabaseRbc from '@/views/datebase/commponent/detail/rbc/listDetailRbc.vue';
import DatabaseWbc from '@/views/datebase/commponent/detail/wbc/listDetailWbc.vue';
import Report from '@/views/datebase/commponent/detail/report/report.vue';
import databaseDetail from '@/views/datebase/commponent/detail/classInfo/listDetail.vue';
import DatabaseWhole from '@/views/datebase/commponent/detail/databaseWhole/index.vue';

import {useStore} from "vuex";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        // {
        //     path: '/',
        //     name: 'HomeView',
        //     component: HomeView,
        // },
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
        {
            path: '/setting',
            name: 'setting',
            component: setting,
        },
        {
            path: '/database',
            name: 'database',
            component: Database,
        },
        {
            path: '/databaseDetail',
            name: 'databaseDetail',
            component: databaseDetail,
        },
        {
            path: '/databaseWhole',
            name: 'databaseWhole',
            component: DatabaseWhole,
        },
        {
            path: '/databaseRbc',
            name: 'databaseRbc',
            component: DatabaseRbc,
        },
        {
            path: '/report',
            name: 'report',
            component: Report,
        }
    ],
});

router.beforeEach((to, from, next)  => {
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
    }
    else if (to.name === "database") {
        store.dispatch('commonModule/setCommonInfo', {dataBasePageReset: true});
        next();
    } else {
        // 그 외의 경우에는 계속 진행
        next();
    }
});

export default router;
