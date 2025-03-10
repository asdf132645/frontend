import { gql } from "graphql-tag";
import * as VueApolloComposable from "@vue/apollo-composable";
import { ReactiveFunction, UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables } from "../index";

// GraphQL 문서
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

export const cbcUpdateDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
        updateRunningInfoGQL(updateDto: $updateDto) {
            id
            submitState
            submitOfDate
            submitUserId
        }
    }
`;

export const firstCheckUpdateDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
        updateRunningInfoGQL(updateDto: $updateDto) {
            id
            submitState
        }
    }
`;

export const memoUpdateDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
        updateRunningInfoGQL(updateDto: $updateDto) {
            id
            wbcMemo
            rbcMemo
        }
    }
`;

export const barcodeNoUpdateDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
        updateRunningInfoGQL(updateDto: $updateDto) {
            id
            barcodeNo
        }
    }
`;

export const isAllClassCheckedDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
        updateRunningInfoGQL(updateDto: $updateDto) {
            id
            isAllClassesChecked
        }
    }
`;

export const rbcUpdateDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
        updateRunningInfoGQL(updateDto: $updateDto) {
            id
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
        }
    }
`;

export const slideConditionUpdateDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
        updateRunningInfoGQL(updateDto: $updateDto) {
            id
            slideCondition {
                condition
                desc
            }
        }
    }
`;

export const appVueUpdateDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
        updateRunningInfoGQL(updateDto: $updateDto) {
            id
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
        }
    }
`;

// 뮤테이션 훅 정의
export function useUpdateRunningInfoMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(UpdateRunningInfoDocument, options);
}

export function cbcUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(cbcUpdateDocument, options);
}

export function memoUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(memoUpdateDocument, options);
}

export function barcodeNoUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(barcodeNoUpdateDocument, options);
}

export function rbcUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(rbcUpdateDocument, options);
}

export function slideConditionUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(slideConditionUpdateDocument, options);
}

export function isAllClassCheckedUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(isAllClassCheckedDocument, options);
}

export function appVueUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(appVueUpdateDocument, options);
}
// firstCheckUpdateDocument
export function firstCheckUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(firstCheckUpdateDocument, options);
}

type MutationHook = (options: {
    variables: { updateDto: any };
}) => {
    mutate: () => Promise<any>;
    loading: boolean;
    error: any;
    onDone: () => void;
};

// 공통 업데이트 함수
export const gqlGenericUpdate = async (
    mutationHook: MutationHook,
    originalDb: any,
) => {
    const updateDtos = {
        runingInfoDtoItems: [
            originalDb,
        ],
    };

    const { mutate, loading, error, onDone } = mutationHook({
        variables: {
            updateDto: updateDtos,
        },
    });

    return await mutate();
};
