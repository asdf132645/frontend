const config = require('./public/gql.js'); // config.js에서 값 가져오기

module.exports = {
    overwrite: true,
    schema: config.GRAPHQL_API_URL, // 동적으로 URL 설정
    documents: "src/**/*.ts",
    generates: {
        "src/gql/index.ts": {
            plugins: [
                "typescript",
                "typescript-operations",
                "typescript-vue-apollo",
            ],
            config: {
                gqlImport: "graphql-tag#gql",
                vueCompositionApiImportFrom: "vue", // Vue 3에서의 Composition API 설정
                withCompositionFunctions: true,
            },
        },
    },
};

