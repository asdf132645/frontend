// src/icons/customIcons.ts
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const faHalfCircleUp: IconDefinition = {
    prefix: 'fac',
    iconName: 'half-circle-up',
    icon: [
        512, // width
        512, // height
        [], // ligatures
        'e002', // unicode
        'M256 0c141.385 0 256 114.615 256 256H0C0 114.615 114.615 0 256 0z' // SVG path data for top half circle
    ]
};

const faHalfCircleDown: IconDefinition = {
    prefix: 'fac',
    iconName: 'half-circle-down',
    icon: [
        512, // width
        512, // height
        [], // ligatures
        'e003', // unicode
        'M256 512c-141.385 0-256-114.615-256-256h512c0 141.385-114.615 256-256 256z' // SVG path data for bottom half circle
    ]
};

export { faHalfCircleUp, faHalfCircleDown };
