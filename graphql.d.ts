// src/graphql.d.ts

// Declare .gql files
declare module '*.gql' {
    import { DocumentNode } from 'graphql';
    const value: DocumentNode;
    export default value;
}

// Declare .graphql files
declare module '*.graphql' {
    import { DocumentNode } from 'graphql';
    const value: DocumentNode;
    export default value;
}
