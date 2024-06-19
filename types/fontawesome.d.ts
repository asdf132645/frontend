// src/types/fontawesome.d.ts
import '@fortawesome/fontawesome-svg-core';

declare module '@fortawesome/fontawesome-svg-core' {
    export interface IconDefinition {
        prefix: 'fac' | 'fas' | 'far' | 'fab';
        iconName: 'half-circle' | string;
    }

    export interface IconPack {
        fac: {
            'half-circle': IconDefinition;
        };
    }
}
