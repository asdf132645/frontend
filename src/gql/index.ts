import {gql} from 'graphql-tag';
import * as VueApolloComposable from '@vue/apollo-composable';

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

export type CreateRuningInfoDto = {
    dayQuery: Scalars['String']['input'];
    runingInfoDtoItems: RuningInfoDtoItems;
    userId?: InputMaybe<Scalars['Int']['input']>;
};

export type Mutation = {
    __typename?: 'Mutation';
    createRunningInfo: RuningInfoEntity;
};


export type MutationCreateRunningInfoArgs = {
    createRunningInfoDto: CreateRuningInfoDto;
};

export type Query = {
    __typename?: 'Query';
    getRunningInfoById?: Maybe<RuningInfoEntity>;
};


export type QueryGetRunningInfoByIdArgs = {
    id: Scalars['Int']['input'];
};

export type RuningInfoDtoItems = {
    analyzedDttm: Scalars['String']['input'];
    barcodeNo: Scalars['String']['input'];
    bf_lowPowerPath: Array<Scalars['String']['input']>;
    birthDay: Scalars['String']['input'];
    cassetId: Scalars['String']['input'];
    cbcAge?: InputMaybe<Scalars['String']['input']>;
    cbcPatientNm?: InputMaybe<Scalars['String']['input']>;
    cbcPatientNo?: InputMaybe<Scalars['String']['input']>;
    cbcSex?: InputMaybe<Scalars['String']['input']>;
    classificationResult?: InputMaybe<Array<Scalars['String']['input']>>;
    gender: Scalars['String']['input'];
    id: Scalars['Int']['input'];
    img_drive_root_path?: InputMaybe<Scalars['String']['input']>;
    isNormal: Scalars['String']['input'];
    isNsNbIntegration: Scalars['String']['input'];
    lock_status?: InputMaybe<Scalars['Boolean']['input']>;
    maxWbcCount: Scalars['String']['input'];
    orderDttm: Scalars['String']['input'];
    patientId: Scalars['String']['input'];
    patientNm: Scalars['String']['input'];
    pcIp: Scalars['String']['input'];
    rbcInfo: Array<Scalars['String']['input']>;
    rbcInfoAfter: Array<Scalars['String']['input']>;
    rbcMemo?: InputMaybe<Scalars['String']['input']>;
    slotId: Scalars['String']['input'];
    slotNo: Scalars['String']['input'];
    submitOfDate?: InputMaybe<Scalars['DateTime']['input']>;
    submitState?: InputMaybe<Scalars['String']['input']>;
    submitUserId?: InputMaybe<Scalars['String']['input']>;
    tactTime: Scalars['String']['input'];
    testType: Scalars['String']['input'];
    traySlot: Scalars['String']['input'];
    wbcCount: Scalars['String']['input'];
    wbcInfo: Array<Scalars['String']['input']>;
    wbcInfoAfter?: InputMaybe<Array<Scalars['String']['input']>>;
    wbcMemo?: InputMaybe<Scalars['String']['input']>;
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
    id: Scalars['Float']['output'];
    img_drive_root_path?: Maybe<Scalars['String']['output']>;
    isNormal: Scalars['String']['output'];
    isNsNbIntegration?: Maybe<Scalars['String']['output']>;
    lock_status?: Maybe<Scalars['Boolean']['output']>;
    maxWbcCount: Scalars['String']['output'];
    orderDttm: Scalars['String']['output'];
    patientId: Scalars['String']['output'];
    patientNm: Scalars['String']['output'];
    pcIp?: Maybe<Scalars['String']['output']>;
    rbcInfo: Array<Scalars['String']['output']>;
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
    wbcInfo: Array<Scalars['String']['output']>;
    wbcInfoAfter: Array<Scalars['String']['output']>;
    wbcMemo?: Maybe<Scalars['String']['output']>;
};

export type GetRunningInfoByIdQueryVariables = Exact<{
    id: Scalars['Int']['input'];
}>;


export type GetRunningInfoByIdQuery = {
    __typename?: 'Query',
    getRunningInfoById?: { __typename?: 'RuningInfoEntity', id: number } | null
};


export const GetRunningInfoByIdDocument = gql`
  query GetRunningInfoById($id: Int!) {
    getRunningInfoByIdGQL(id: $id) {
          id
          analyzedDttm
          barcodeNo
          birthDay
          cassetId
          cbcAge
          cbcPatientNm
          cbcPatientNo
          cbcSex
          gender
          img_drive_root_path
          isNormal
          isNsNbIntegration
          lock_status
          maxWbcCount
          orderDttm
          patientId
          patientNm
          pcIp
           rbcInfo {
              classInfo {
                classId
                classNm
                degree
              }
              categoryId
              categoryNm
           }
          
          rbcMemo
          slotId
          slotNo
          submitOfDate
          submitState
          submitUserId
          tactTime
          testType
          traySlot
          wbcCount
          wbcInfoAfter {
            id
            name
            count
            title
            images
            percent
          }
           wbcInfo {
            wbcInfo {
              id
              name
              count
              title
              images
              percent
            }
            totalCount
            maxWbcCount
          }
          wbcMemo
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
export function useGetRunningInfoByIdQuery(
    variables: GetRunningInfoByIdQueryVariables | ReactiveFunction<GetRunningInfoByIdQueryVariables>,
    options: VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>> = {}
) {
    return VueApolloComposable.useQuery<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>(
        GetRunningInfoByIdDocument,
        variables,
        options
    );
}

export function useGetRunningInfoByIdLazyQuery(
    variables?: GetRunningInfoByIdQueryVariables | ReactiveFunction<GetRunningInfoByIdQueryVariables>,
    options: VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>> = {}
) {
    return VueApolloComposable.useLazyQuery<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>(
        GetRunningInfoByIdDocument,
        variables,
        options
    );
}

export type GetRunningInfoByIdQueryCompositionFunctionResult = VueApolloComposable.UseQueryReturn<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>;