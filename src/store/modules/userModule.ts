// userModule.ts
import { Commit } from 'vuex';

interface UserState {
    id: number;
    userId: string;
    password: string;
    name: string;
    employeeNo: string;
    userType: string;
    subscriptionDate: string;
    latestDate: string;
}

interface UserModule {
    namespaced: true;
    state: () => UserState;
    mutations: {
        setUserMutation: (state: UserState, user: UserState) => void;
    };
    actions: {
        setUserAction: (context: { commit: Commit }, user: UserState) => void;
    };
}

export const userModule: UserModule = {
    namespaced: true,
    state: () => ({
        id: 0,
        userId: '',
        password: '',
        name: '',
        employeeNo: '',
        userType: '',
        subscriptionDate: '',
        latestDate: '',
    }),
    mutations: {
        setUserMutation(state: UserState, user: UserState): void {
            Object.assign(state, user);
        },
    },
    actions: {
        setUserAction({ commit }: { commit: Commit }, user: UserState): void {
            commit('setUserMutation', user);
        },
    },
};
