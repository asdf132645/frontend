// index.vue
import {createStore} from "vuex";
import {userModule} from "@/store/modules/userModule";
import {executeModule} from '@/store/modules/analysis/executeModule';
import {workingViewModule} from '@/store/modules/analysis/workingViewModule';
import {embeddedStatusModule} from '@/store/modules/embeddedStatusModule';
import {orderListModule} from '@/store/modules/analysis/orderListModule';
import {runningInfoModule} from '@/store/modules/testPageCommon/ruuningInfo';
import {commonModule} from "@/store/modules/commonModule";
import {dataBaseSetDataModule} from "@/store/modules/dataBaseSetData/dataBaseSetDataModule";
import {timeModule} from "@/store/modules/timeModule";
import slideDataModule from "@/store/modules/runningDataModule";


const store = createStore({
    modules: {
        userModule,
        executeModule,
        workingViewModule,
        embeddedStatusModule,
        orderListModule,
        runningInfoModule,
        commonModule,
        dataBaseSetDataModule,
        timeModule,
        slideDataModule,
    }

});

export default store;


