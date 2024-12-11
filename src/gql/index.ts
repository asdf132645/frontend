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
  DateTime: { input: any; output: any; }
};

export type ClassInfo = {
  __typename?: 'ClassInfo';
  classId?: Maybe<Scalars['String']['output']>;
  classNm?: Maybe<Scalars['String']['output']>;
  degree?: Maybe<Scalars['String']['output']>;
};

export type Query = {
  __typename?: 'Query';
  getRunningInfoByIdGQL: RuningInfoEntity;
};


export type QueryGetRunningInfoByIdGqlArgs = {
  id: Scalars['Int']['input'];
};

export type RbcInfo = {
  __typename?: 'RbcInfo';
  categoryId?: Maybe<Scalars['String']['output']>;
  categoryNm?: Maybe<Scalars['String']['output']>;
  classInfo?: Maybe<Array<ClassInfo>>;
};

export type RuningInfoEntity = {
  __typename?: 'RuningInfoEntity';
  analyzedDttm: Scalars['String']['output'];
  barcodeNo: Scalars['String']['output'];
  bf_lowPowerPath: Array<Scalars['String']['output']>;
  birthDay: Scalars['String']['output'];
  cassetId: Scalars['String']['output'];
  cbcAge?: Maybe<Scalars['String']['output']>;
  cbcPatientNm?: Maybe<Scalars['String']['output']>;
  cbcPatientNo?: Maybe<Scalars['String']['output']>;
  cbcSex?: Maybe<Scalars['String']['output']>;
  gender: Scalars['String']['output'];
  hosName?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  img_drive_root_path?: Maybe<Scalars['String']['output']>;
  isNormal: Scalars['String']['output'];
  isNsNbIntegration?: Maybe<Scalars['String']['output']>;
  lock_status?: Maybe<Scalars['Boolean']['output']>;
  maxWbcCount: Scalars['String']['output'];
  orderDttm: Scalars['String']['output'];
  patientId: Scalars['String']['output'];
  patientNm: Scalars['String']['output'];
  pcIp?: Maybe<Scalars['String']['output']>;
  rbcInfo?: Maybe<RbcInfo>;
  rbcInfoAfter: Array<Scalars['String']['output']>;
  rbcInfoPosAfter: Array<Scalars['String']['output']>;
  rbcMemo?: Maybe<Scalars['String']['output']>;
  slotId: Scalars['String']['output'];
  slotNo: Scalars['String']['output'];
  submitOfDate?: Maybe<Scalars['DateTime']['output']>;
  submitState?: Maybe<Scalars['String']['output']>;
  submitUserId?: Maybe<Scalars['String']['output']>;
  tactTime: Scalars['String']['output'];
  testType: Scalars['String']['output'];
  traySlot?: Maybe<Scalars['String']['output']>;
  wbcCount: Scalars['String']['output'];
  wbcInfo?: Maybe<WbcResponse>;
  wbcInfoAfter: Array<WbcInfoAfter>;
  wbcMemo?: Maybe<Scalars['String']['output']>;
};

export type WbcInfo = {
  __typename?: 'WbcInfo';
  count?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  name?: Maybe<Scalars['String']['output']>;
  percent?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type WbcInfoAfter = {
  __typename?: 'WbcInfoAfter';
  count?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  images?: Maybe<Array<Scalars['String']['output']>>;
  name?: Maybe<Scalars['String']['output']>;
  percent?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type WbcResponse = {
  __typename?: 'WbcResponse';
  maxWbcCount?: Maybe<Scalars['String']['output']>;
  totalCount?: Maybe<Scalars['String']['output']>;
  wbcInfo?: Maybe<Array<WbcInfo>>;
};

export type GetRunningInfoByIdQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetRunningInfoByIdQuery = { __typename?: 'Query', getRunningInfoByIdGQL: { __typename?: 'RuningInfoEntity', id: number, lock_status?: boolean | null, traySlot?: string | null, slotNo: string, barcodeNo: string, patientId: string, patientNm: string, gender: string, birthDay: string, wbcCount: string, slotId: string, orderDttm: string, testType: string, analyzedDttm: string, tactTime: string, maxWbcCount: string, bf_lowPowerPath: Array<string>, cassetId: string, isNormal: string, rbcInfoAfter: Array<string>, submitState?: string | null, submitOfDate?: any | null, submitUserId?: string | null, rbcInfoPosAfter: Array<string>, isNsNbIntegration?: string | null, wbcMemo?: string | null, rbcMemo?: string | null, pcIp?: string | null, cbcPatientNo?: string | null, cbcPatientNm?: string | null, cbcSex?: string | null, cbcAge?: string | null, img_drive_root_path?: string | null, hosName?: string | null, wbcInfo?: { __typename?: 'WbcResponse', totalCount?: string | null, maxWbcCount?: string | null, wbcInfo?: Array<{ __typename?: 'WbcInfo', id?: string | null, name?: string | null, count?: string | null, title?: string | null, images?: Array<string> | null, percent?: number | null }> | null } | null, wbcInfoAfter: Array<{ __typename?: 'WbcInfoAfter', id?: string | null, name?: string | null, count?: string | null, title?: string | null, images?: Array<string> | null, percent?: string | null }>, rbcInfo?: { __typename?: 'RbcInfo', categoryId?: string | null, categoryNm?: string | null, classInfo?: Array<{ __typename?: 'ClassInfo', classId?: string | null, classNm?: string | null, degree?: string | null }> | null } | null } };


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
      }
      percent
    }
    rbcInfo {
      classInfo {
        classId
        classNm
        degree
      }
      categoryId
      categoryNm
    }
    rbcInfoAfter {
      classInfo {
        classId
        classNm
        degree
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
    pcIp
    cbcPatientNo
    cbcPatientNm
    cbcSex
    cbcAge
    img_drive_root_path
    hosName
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