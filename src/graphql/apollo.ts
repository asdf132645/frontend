// src/apollo.ts
import {ApolloClient, InMemoryCache} from '@apollo/client/core';
import {provideApolloClient} from '@vue/apollo-composable';

const apiBaseUrl = window.APP_API_BASE_URL || 'http://192.168.0.131:3002';
// GraphQL 서버의 URL (NestJS 백엔드에서 제공하는 GraphQL 엔드포인트)
const apolloClient = new ApolloClient({
    uri: `${apiBaseUrl}/graphql`,
    cache: new InMemoryCache({
        typePolicies: {
            WbcInfoAfter: {
                fields: {
                    images: {
                        // 커스텀 머지 함수
                        merge(existing = [], incoming) {
                            return [...existing, ...incoming];
                        },
                    },
                },
            },
        },
    }),
});

export function useProvideApolloClient() {
    provideApolloClient(apolloClient);
}