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
import {computed} from "vue";

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

router.beforeEach(async (to, from, next)  => {
    // 세션 스토리지에서 사용자 정보 확인
    const storedUser = sessionStorage.getItem('user');
    const getStoredUser = JSON.parse(storedUser || '{}');
// 스토어
    const store = useStore();
    // 스토어에서 사용자 정보 확인
    const settingChangedChecker = computed(() => store.state.commonModule.settingChangedChecker);
    const currentUser = store.state.userModule;

    if (from.path === '/setting') {
        const beforeSettingFormattedString = computed(() => store.state.commonModule.beforeSettingFormattedString);
        const afterSettingFormattedString = computed(() => store.state.commonModule.afterSettingFormattedString);

        const beforeSetting = beforeSettingFormattedString.value;
        const afterSetting = afterSettingFormattedString.value;

        // 설정 변경 여부 확인
        if (beforeSetting === afterSetting) {
            // 설정 변경이 없을 경우 초기화 후 페이지 이동 허용
            await store.dispatch('commonModule/setCommonInfo', { beforeSettingFormattedString: null });
            await store.dispatch('commonModule/setCommonInfo', { afterSettingFormattedString: null });
            await store.dispatch('commonModule/setCommonInfo', { enteringRouterPath: '' });
            await store.dispatch('commonModule/setCommonInfo', { settingType: '' });
            next();
        } else {
            // 설정이 변경되었을 경우 확인 처리
            await store.dispatch('commonModule/setCommonInfo', { settingChangedChecker: !settingChangedChecker.value });
            await store.dispatch('commonModule/setCommonInfo', { enteringRouterPath: to.path });
            next(false);  // 페이지 이동 취소
            return;       // 이후 코드 실행 방지
        }
    }

    // 로그인이 필요한 페이지에 접근할 때 세션 및 스토어에서 사용자 정보 확인
    if (to.name !== 'login' && to.name !== 'join' && (!getStoredUser.userId && !currentUser.value)) {
        // 로그인 페이지로 리다이렉트
        next('/user/login');
    }
    // 'database' 페이지에 접근할 때
    else if (to.name === 'database') {
        await store.dispatch('commonModule/setCommonInfo', { dataBasePageReset: true });
        next();  // 데이터베이스 페이지로 이동 허용
    }
    // 그 외의 페이지 이동 허용
    else {
        next();
    }
});

export default router;
