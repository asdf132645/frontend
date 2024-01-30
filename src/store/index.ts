import {createStore} from "vuex";
import {userModule} from "@/store/modules/userModule";
import {executeModule} from '@/store/modules/analysis/executeModule';
import {rbcClassificationModule} from '@/store/modules/analysis/rbcClassification';
import {processInfoModule} from '@/store/modules/analysis/processInfoModule';
import {classificationModule} from '@/store/modules/analysis/wbcclassification';
import {workingViewModule} from '@/store/modules/analysis/workingViewModule';
import { embeddedStatusModule } from '@/store/modules/embeddedStatusModule';

export default createStore({
    modules: {
        userModule,
        executeModule,
        rbcClassificationModule,
        processInfoModule,
        classificationModule,
        workingViewModule,
        embeddedStatusModule,
    }
});



