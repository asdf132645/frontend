// index.ts
import {createStore} from "vuex";
import {userModule} from "@/store/modules/userModule";
import {executeModule} from '@/store/modules/analysis/executeModule';
import {rbcClassificationModule} from '@/store/modules/analysis/rbcClassification';
import {processInfoModule} from '@/store/modules/analysis/processInfoModule';
import {wbcClassificationModule} from '@/store/modules/analysis/wbcclassification';
import {workingViewModule} from '@/store/modules/analysis/workingViewModule';
import { embeddedStatusModule } from '@/store/modules/embeddedStatusModule';
import { orderListModule } from '@/store/modules/analysis/orderListModule';
import { runningInfoModule } from '@/store/modules/testPageCommon/ruuningInfo';
import createPersistedState from 'vuex-persistedstate';


const store = createStore({
    modules: {
        userModule,
        executeModule,
        rbcClassificationModule,
        processInfoModule,
        wbcClassificationModule,
        workingViewModule,
        embeddedStatusModule,
        orderListModule,
        runningInfoModule,
    },
    plugins: [
        createPersistedState({
            key: 'runningInfoModule',
            paths: ['runningInfoModule.slotInfo'],
        }),
    ],

});

export default store;


