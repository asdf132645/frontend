export const rulers = [{
    id: 'none',
    text: 'None',
  }, {
    id: 'line',
    text: 'Line',
  }, {
    id: 'cross',
    text: 'Cross',
  }, {
    id: 'circle',
    text: 'Circle'
}]

export type VisibleRbcType = { classId: string; categoryId: string };

export const VISIBLE_SIZE_OPTIONS = [
  { categoryId: '01', classId: '02' },
  { categoryId: '01', classId: '03' },
];

export const VISIBLE_CHROMIA_OPTIONS = [

];

export const VISIBLE_SHAPE_OPTIONS = [
  { categoryId: '03', classId: '01' },
  { categoryId: '03', classId: '03' },
  { categoryId: '03', classId: '04' },
  { categoryId: '03', classId: '05' },
  { categoryId: '03', classId: '06' },
  { categoryId: '03', classId: '07' },
  { categoryId: '03', classId: '08' },
  { categoryId: '03', classId: '09' },
  { categoryId: '03', classId: '10' },
  { categoryId: '03', classId: '11' },
];

export const VISIBLE_INCLUSION_BODY_OPTIONS = [
  { categoryId: '05', classId: '01' },
  { categoryId: '05', classId: '02' },
  { categoryId: '05', classId: '03' },
];

export const VISIBLE_OTHERS_OPTIONS = [
  { categoryId: '04', classId: '01' }
];

export const VISIBLE_RBC_OPTIONS = [
    ...VISIBLE_SIZE_OPTIONS,
  ...VISIBLE_CHROMIA_OPTIONS,
  ...VISIBLE_SHAPE_OPTIONS,
  ...VISIBLE_INCLUSION_BODY_OPTIONS,
  ...VISIBLE_OTHERS_OPTIONS
];