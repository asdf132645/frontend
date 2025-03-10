import { gql } from 'graphql-tag';
import * as VueApolloComposable from '@vue/apollo-composable';
import * as VueCompositionApi from 'vue';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type ReactiveFunction<TParam> = () => TParam;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: any; output: any; }
};

export type AbnormalClassInfo = {
  __typename?: 'AbnormalClassInfo';
  classNm?: Maybe<Scalars['String']['output']>;
  val?: Maybe<Scalars['String']['output']>;
};

export type ClassInfo = {
  __typename?: 'ClassInfo';
  classId?: Maybe<Scalars['String']['output']>;
  classNm?: Maybe<Scalars['String']['output']>;
  degree?: Maybe<Scalars['String']['output']>;
  originalDegree?: Maybe<Scalars['String']['output']>;
  rbcImageDegreeInfo?: Maybe<Array<RbcDegreeByImageInfoObj>>;
};

export type Coordinates = {
  __typename?: 'Coordinates';
  display?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  updateRunningInfoGQL: Array<RuningInfoEntity>;
};


export type MutationUpdateRunningInfoGqlArgs = {
  updateDto: UpdateRuningInfoDto;
};

export type Query = {
  __typename?: 'Query';
  getRunningInfoByIdGQL: RuningInfoEntity;
};


export type QueryGetRunningInfoByIdGqlArgs = {
  id: Scalars['Int']['input'];
};

export type RbcDegreeByImageInfoObj = {
  __typename?: 'RBCDegreeByImageInfoObj';
  degree?: Maybe<Scalars['String']['output']>;
  imageNo?: Maybe<Scalars['Float']['output']>;
  originalDegree?: Maybe<Scalars['String']['output']>;
};

export type RbcAfterClassInfoObj = {
  __typename?: 'RbcAfterClassInfoObj';
  classId?: Maybe<Scalars['String']['output']>;
  classNm?: Maybe<Scalars['String']['output']>;
  degree?: Maybe<Scalars['String']['output']>;
  originalDegree?: Maybe<Scalars['Float']['output']>;
  percent?: Maybe<Scalars['String']['output']>;
};

export type RbcAfterClassInfos = {
  __typename?: 'RbcAfterClassInfos';
  categoryId?: Maybe<Scalars['String']['output']>;
  categoryNm?: Maybe<Scalars['String']['output']>;
  classInfo?: Maybe<Array<Maybe<RbcAfterClassInfoObj>>>;
};

export type RbcClassInfo = {
  __typename?: 'RbcClassInfo';
  categoryId?: Maybe<Scalars['String']['output']>;
  categoryNm?: Maybe<Scalars['String']['output']>;
  classInfo?: Maybe<Array<Maybe<ClassInfo>>>;
};

export type RbcInfo = {
  __typename?: 'RbcInfo';
  malariaCount?: Maybe<Scalars['String']['output']>;
  maxRbcCount?: Maybe<Scalars['String']['output']>;
  pltCount?: Maybe<Scalars['String']['output']>;
  rbcClass?: Maybe<Array<Maybe<RbcClassInfo>>>;
};

export type RuningInfoEntity = {
  __typename?: 'RuningInfoEntity';
  abnormalClassInfo?: Maybe<Array<Maybe<AbnormalClassInfo>>>;
  analyzedDttm?: Maybe<Scalars['String']['output']>;
  barcodeNo?: Maybe<Scalars['String']['output']>;
  bf_lowPowerPath?: Maybe<Array<Scalars['String']['output']>>;
  birthDay?: Maybe<Scalars['String']['output']>;
  cassetId?: Maybe<Scalars['String']['output']>;
  cbcAge?: Maybe<Scalars['String']['output']>;
  cbcPatientNm?: Maybe<Scalars['String']['output']>;
  cbcPatientNo?: Maybe<Scalars['String']['output']>;
  cbcSex?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  hosName?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  img_drive_root_path?: Maybe<Scalars['String']['output']>;
  isAllClassesChecked?: Maybe<Scalars['Boolean']['output']>;
  isNormal?: Maybe<Scalars['String']['output']>;
  isNsNbIntegration?: Maybe<Scalars['String']['output']>;
  lock_status?: Maybe<Scalars['Boolean']['output']>;
  maxWbcCount?: Maybe<Scalars['String']['output']>;
  orderDttm: Scalars['String']['output'];
  patientId?: Maybe<Scalars['String']['output']>;
  patientNm?: Maybe<Scalars['String']['output']>;
  pcIp?: Maybe<Scalars['String']['output']>;
  pltMemo?: Maybe<Scalars['String']['output']>;
  rbcInfo?: Maybe<RbcInfo>;
  rbcInfoAfter?: Maybe<Array<RbcAfterClassInfos>>;
  rbcInfoPosAfter: Array<Scalars['String']['output']>;
  rbcMemo?: Maybe<Scalars['String']['output']>;
  slideCondition?: Maybe<SlideCondition>;
  slotId: Scalars['String']['output'];
  slotNo: Scalars['String']['output'];
  submitOfDate?: Maybe<Scalars['String']['output']>;
  submitState?: Maybe<Scalars['String']['output']>;
  submitUserId?: Maybe<Scalars['String']['output']>;
  tactTime?: Maybe<Scalars['String']['output']>;
  testType: Scalars['String']['output'];
  traySlot?: Maybe<Scalars['String']['output']>;
  wbcCount?: Maybe<Scalars['String']['output']>;
  wbcInfo?: Maybe<WbcResponse>;
  wbcInfoAfter: Array<WbcInfoAfter>;
  wbcMemo?: Maybe<Scalars['String']['output']>;
};

export type SlideCondition = {
  __typename?: 'SlideCondition';
  condition?: Maybe<Scalars['String']['output']>;
  desc?: Maybe<Scalars['String']['output']>;
};

export type UpdateRuningInfoDto = {
  dayQuery?: InputMaybe<Scalars['String']['input']>;
  runingInfoDtoItems?: InputMaybe<Array<InputMaybe<UpdateRuningInfoDtoItems>>>;
  userId?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateRuningInfoDtoItems = {
  abnormalClassInfo?: InputMaybe<Scalars['JSON']['input']>;
  analyzedDttm?: InputMaybe<Scalars['String']['input']>;
  barcodeNo?: InputMaybe<Scalars['String']['input']>;
  bf_lowPowerPath?: InputMaybe<Array<Scalars['String']['input']>>;
  birthDay?: InputMaybe<Scalars['String']['input']>;
  cassetId?: InputMaybe<Scalars['String']['input']>;
  cbcAge?: InputMaybe<Scalars['String']['input']>;
  cbcPatientNm?: InputMaybe<Scalars['String']['input']>;
  cbcPatientNo?: InputMaybe<Scalars['String']['input']>;
  cbcSex?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  hosName?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['Int']['input'];
  img_drive_root_path?: InputMaybe<Scalars['String']['input']>;
  isAllClassesChecked?: InputMaybe<Scalars['Boolean']['input']>;
  isNormal?: InputMaybe<Scalars['String']['input']>;
  isNsNbIntegration?: InputMaybe<Scalars['String']['input']>;
  lock_status?: InputMaybe<Scalars['Boolean']['input']>;
  maxWbcCount?: InputMaybe<Scalars['String']['input']>;
  orderDttm?: InputMaybe<Scalars['String']['input']>;
  patientId?: InputMaybe<Scalars['String']['input']>;
  patientNm?: InputMaybe<Scalars['String']['input']>;
  pcIp?: InputMaybe<Scalars['String']['input']>;
  pltMemo?: InputMaybe<Scalars['String']['input']>;
  rbcInfo?: InputMaybe<Scalars['JSON']['input']>;
  rbcInfoAfter?: InputMaybe<Scalars['JSON']['input']>;
  rbcInfoPosAfter?: InputMaybe<Array<Scalars['String']['input']>>;
  rbcMemo?: InputMaybe<Scalars['String']['input']>;
  slideCondition?: InputMaybe<Scalars['JSON']['input']>;
  slotId?: InputMaybe<Scalars['String']['input']>;
  slotNo?: InputMaybe<Scalars['String']['input']>;
  submitOfDate?: InputMaybe<Scalars['String']['input']>;
  submitState?: InputMaybe<Scalars['String']['input']>;
  submitUserId?: InputMaybe<Scalars['String']['input']>;
  tactTime?: InputMaybe<Scalars['String']['input']>;
  testType?: InputMaybe<Scalars['String']['input']>;
  traySlot?: InputMaybe<Scalars['String']['input']>;
  wbcCount?: InputMaybe<Scalars['String']['input']>;
  wbcInfo?: InputMaybe<Scalars['JSON']['input']>;
  wbcInfoAfter?: InputMaybe<Scalars['JSON']['input']>;
  wbcMemo?: InputMaybe<Scalars['String']['input']>;
};

export type WbcInfo = {
  __typename?: 'WbcInfo';
  count?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  images?: Maybe<Array<Maybe<WbcImages>>>;
  name?: Maybe<Scalars['String']['output']>;
  percent?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type WbcInfoAfter = {
  __typename?: 'WbcInfoAfter';
  count?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  images?: Maybe<Array<Maybe<WbcImages>>>;
  name?: Maybe<Scalars['String']['output']>;
  percent?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type WbcResponse = {
  __typename?: 'WbcResponse';
  maxWbcCount?: Maybe<Scalars['String']['output']>;
  totalCount?: Maybe<Scalars['String']['output']>;
  wbcInfo?: Maybe<Array<Array<WbcInfo>>>;
};

export type WbcImages = {
  __typename?: 'wbcImages';
  coordinates?: Maybe<Coordinates>;
  fileName?: Maybe<Scalars['String']['output']>;
  filter?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Float']['output']>;
};

export type GetRunningInfoByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetRunningInfoByIdQuery = { __typename?: 'Query', getRunningInfoByIdGQL: { __typename?: 'RuningInfoEntity', id: number, lock_status?: boolean | null, traySlot?: string | null, slotNo: string, barcodeNo?: string | null, patientId?: string | null, patientNm?: string | null, gender?: string | null, birthDay?: string | null, wbcCount?: string | null, slotId: string, orderDttm: string, testType: string, analyzedDttm?: string | null, tactTime?: string | null, maxWbcCount?: string | null, cassetId?: string | null, isNormal?: string | null, submitState?: string | null, submitOfDate?: string | null, submitUserId?: string | null, isNsNbIntegration?: string | null, wbcMemo?: string | null, rbcMemo?: string | null, pltMemo?: string | null, pcIp?: string | null, cbcPatientNo?: string | null, cbcPatientNm?: string | null, cbcSex?: string | null, cbcAge?: string | null, img_drive_root_path?: string | null, hosName?: string | null, isAllClassesChecked?: boolean | null, wbcInfo?: { __typename?: 'WbcResponse', totalCount?: string | null, maxWbcCount?: string | null, wbcInfo?: Array<Array<{ __typename?: 'WbcInfo', id?: string | null, name?: string | null, count?: string | null, title?: string | null, percent?: string | null, images?: Array<{ __typename?: 'wbcImages', fileName?: string | null, title?: string | null, filter?: string | null, height?: number | null, width?: number | null, coordinates?: { __typename?: 'Coordinates', display?: string | null } | null } | null> | null }>> | null } | null, wbcInfoAfter: Array<{ __typename?: 'WbcInfoAfter', id?: string | null, name?: string | null, count?: string | null, title?: string | null, percent?: string | null, images?: Array<{ __typename?: 'wbcImages', fileName?: string | null, title?: string | null, filter?: string | null, height?: number | null, width?: number | null, coordinates?: { __typename?: 'Coordinates', display?: string | null } | null } | null> | null }>, rbcInfo?: { __typename?: 'RbcInfo', malariaCount?: string | null, maxRbcCount?: string | null, pltCount?: string | null, rbcClass?: Array<{ __typename?: 'RbcClassInfo', categoryId?: string | null, categoryNm?: string | null, classInfo?: Array<{ __typename?: 'ClassInfo', classId?: string | null, classNm?: string | null, degree?: string | null, originalDegree?: string | null } | null> | null } | null> | null } | null, rbcInfoAfter?: Array<{ __typename?: 'RbcAfterClassInfos', categoryId?: string | null, categoryNm?: string | null, classInfo?: Array<{ __typename?: 'RbcAfterClassInfoObj', classId?: string | null, classNm?: string | null, degree?: string | null, originalDegree?: number | null, percent?: string | null } | null> | null }> | null, abnormalClassInfo?: Array<{ __typename?: 'AbnormalClassInfo', classNm?: string | null, val?: string | null } | null> | null } };

export type UpdateRunningInfoMutationVariables = Exact<{
  updateDto: UpdateRuningInfoDto;
}>;


export type UpdateRunningInfoMutation = { __typename?: 'Mutation', updateRunningInfoGQL: Array<{ __typename?: 'RuningInfoEntity', id: number, isNormal?: string | null, pcIp?: string | null, lock_status?: boolean | null, abnormalClassInfo?: Array<{ __typename?: 'AbnormalClassInfo', classNm?: string | null, val?: string | null } | null> | null, wbcInfoAfter: Array<{ __typename?: 'WbcInfoAfter', id?: string | null, name?: string | null, count?: string | null, title?: string | null, percent?: string | null, images?: Array<{ __typename?: 'wbcImages', fileName?: string | null, title?: string | null, filter?: string | null, height?: number | null, width?: number | null, coordinates?: { __typename?: 'Coordinates', display?: string | null } | null } | null> | null }> }> };


export const GetRunningInfoByIdDocument = gql`
    query GetRunningInfoById($id: Int!) {
  getRunningInfoByIdGQL(id: $id) {
    id
    lock_status
    traySlot
    slotNo
    barcodeNo
    patientId
    patientNm
    gender
    birthDay
    wbcCount
    slotId
    orderDttm
    testType
    analyzedDttm
    tactTime
    maxWbcCount
    cassetId
    isNormal
    wbcInfo {
      wbcInfo {
        id
        name
        count
        title
        images {
          coordinates {
            display
          }
          fileName
          title
          filter
          height
          width
        }
        percent
      }
      totalCount
      maxWbcCount
    }
    wbcInfoAfter {
      id
      name
      count
      title
      images {
        coordinates {
          display
        }
        fileName
        title
        filter
        height
        width
      }
      percent
    }
    rbcInfo {
      rbcClass {
        classInfo {
          classId
          classNm
          degree
          originalDegree
        }
        categoryId
        categoryNm
      }
      malariaCount
      maxRbcCount
      pltCount
    }
    rbcInfoAfter {
      classInfo {
        classId
        classNm
        degree
        originalDegree
        percent
      }
      categoryId
      categoryNm
    }
    submitState
    submitOfDate
    submitUserId
    isNsNbIntegration
    wbcMemo
    rbcMemo
    pltMemo
    pcIp
    cbcPatientNo
    cbcPatientNm
    cbcSex
    cbcAge
    img_drive_root_path
    hosName
    abnormalClassInfo {
      classNm
      val
    }
    isAllClassesChecked
  }
}
    `;

/**
 * __useGetRunningInfoByIdQuery__
 *
 * To run a query within a Vue component, call `useGetRunningInfoByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRunningInfoByIdQuery` returns an object from Apollo Client that contains result, loading and error properties
 * you can use to render your UI.
 *
 * @param variables that will be passed into the query
 * @param options that will be passed into the query, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/query.html#options;
 *
 * @example
 * const { result, loading, error } = useGetRunningInfoByIdQuery({
 *   id: // value for 'id'
 * });
 */
export function useGetRunningInfoByIdQuery(variables: GetRunningInfoByIdQueryVariables | VueCompositionApi.Ref<GetRunningInfoByIdQueryVariables> | ReactiveFunction<GetRunningInfoByIdQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>> = {}) {
  return VueApolloComposable.useQuery<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>(GetRunningInfoByIdDocument, variables, options);
}
export function useGetRunningInfoByIdLazyQuery(variables?: GetRunningInfoByIdQueryVariables | VueCompositionApi.Ref<GetRunningInfoByIdQueryVariables> | ReactiveFunction<GetRunningInfoByIdQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>> = {}) {
  return VueApolloComposable.useLazyQuery<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>(GetRunningInfoByIdDocument, variables, options);
}
export type GetRunningInfoByIdQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>;
export const UpdateRunningInfoDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
  updateRunningInfoGQL(updateDto: $updateDto) {
    id
    isNormal
    abnormalClassInfo {
      classNm
      val
    }
    pcIp
    lock_status
    wbcInfoAfter {
      id
      name
      count
      title
      images {
        coordinates {
          display
        }
        fileName
        title
        filter
        height
        width
      }
      percent
    }
  }
}
    `;

/**
 * __useUpdateRunningInfoMutation__
 *
 * To run a mutation, you first call `useUpdateRunningInfoMutation` within a Vue component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRunningInfoMutation` returns an object that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
 *
 * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
 *
 * @example
 * const { mutate, loading, error, onDone } = useUpdateRunningInfoMutation({
 *   variables: {
 *     updateDto: // value for 'updateDto'
 *   },
 * });
 */
export function useUpdateRunningInfoMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
  return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(UpdateRunningInfoDocument, options);
}
export type UpdateRunningInfoMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>;