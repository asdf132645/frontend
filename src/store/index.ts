import { createStore } from "vuex";
import { userModule } from "@/store/modules/userModule";

export default createStore({
    modules: { userModule }
});



