import {gql} from "graphql-tag";
import * as VueCompositionApi from "vue";
import * as VueApolloComposable from "@vue/apollo-composable";
import {GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables, ReactiveFunction} from "@/gql/index";

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
            slideCondition {
                condition
                desc
            }
        }
    }
`;


export function useGetRunningInfoByIdQuery(variables: GetRunningInfoByIdQueryVariables | VueCompositionApi.Ref<GetRunningInfoByIdQueryVariables> | ReactiveFunction<GetRunningInfoByIdQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>> = {}) {
    return VueApolloComposable.useQuery<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>(GetRunningInfoByIdDocument, variables, options);
}

export function useClassInfoMenuInfoByIdQuery(variables: GetRunningInfoByIdQueryVariables | VueCompositionApi.Ref<GetRunningInfoByIdQueryVariables> | ReactiveFunction<GetRunningInfoByIdQueryVariables>, options: VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables> | VueCompositionApi.Ref<VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>> | ReactiveFunction<VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>> = {}) {
    return VueApolloComposable.useQuery<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables>(GetRunningInfoByIdDocument, variables, options);
}

