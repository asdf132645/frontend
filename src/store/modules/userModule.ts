// userModule.ts
import { Commit } from 'vuex';

interface UserState {
    username: string;
}

interface UserModule {
    state: () => UserState;
    mutations: {
        usernameSet: (state: UserState, value: string) => void;
    };
    actions: {
        setUsername: (context: { commit: Commit }, value: string) => void;
    };
}

export const userModule: UserModule = {
    state: () => ({
        username: '',
    }),
    mutations: {
        usernameSet(state: UserState, value: string): void {
            state.username = value;
        },
    },
    actions: {
        setUsername({ commit }: { commit: Commit }, value: string): void {
            commit('usernameSet', value);
        },
    },
};
