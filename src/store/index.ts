// index.vue
import {createStore} from "vuex";
import {userModule} from "@/store/modules/userModule";
import {executeModule} from '@/store/modules/analysis/executeModule';
import {rbcClassificationModule} from '@/store/modules/analysis/rbcClassification';
import {wbcClassificationModule} from '@/store/modules/analysis/wbcclassification';
import {workingViewModule} from '@/store/modules/analysis/workingViewModule';
import { embeddedStatusModule } from '@/store/modules/embeddedStatusModule';
import { orderListModule } from '@/store/modules/analysis/orderListModule';
import { runningInfoModule } from '@/store/modules/testPageCommon/ruuningInfo';
import {commonModule} from "@/store/modules/commonModule";
import {dataBaseSetDataModule} from "@/store/modules/dataBaseSetData/dataBaseSetDataModule";
import {timeModule} from "@/store/modules/timeModule";
// import createPersistedState from 'vuex-persistedstate';


const store = createStore({
    modules: {
        userModule,
        executeModule,
        // rbcClassificationModule,
        // wbcClassificationModule,
        workingViewModule,
        embeddedStatusModule,
        orderListModule,
        runningInfoModule,
        commonModule,
        dataBaseSetDataModule,
        timeModule,
    }

});

export default store;


