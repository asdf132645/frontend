import {gql} from "graphql-tag";
import * as VueApolloComposable from "@vue/apollo-composable";
import {ReactiveFunction, UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables} from "./index";

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

export const classInfoMenuUpdateDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
        updateRunningInfoGQL(updateDto: $updateDto) {
            id
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
            testType
            img_drive_root_path
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
            wbcMemo
            isAllClassesChecked
        }
    }
`;


export function useUpdateRunningInfoMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(UpdateRunningInfoDocument, options);
}

export function classInfoMenuUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(classInfoMenuUpdateDocument, options);
}

export const gqlUpdate = async (originalDb: any) => {
    const updateDtos = {
        runingInfoDtoItems: [
            {
                id: originalDb[0].id,
                isNormal: originalDb[0].isNormal,
                abnormalClassInfo: originalDb[0].abnormalClassInfo,
                pcIp: originalDb[0].pcIp,
                lock_status: originalDb[0].lock_status,
                wbcInfoAfter: originalDb[0].wbcInfoAfter,
                submitState: originalDb[0].submitState,
            },
        ],
    };
    const { mutate, loading, error, onDone } = useUpdateRunningInfoMutation({
        variables: {
            updateDto: updateDtos, // 수정된 구조
        },
    });

    return  await mutate();
}

export const gqlClassInfoMenuUpdate = async (originalDb: any) => {
    const updateDtos = {
        runingInfoDtoItems: [
            {
                id: originalDb[0].id,
                isNormal: originalDb[0].lock_status,
                wbcInfo: originalDb[0].wbcInfo,
                testType: originalDb[0].testType,
                img_drive_root_path: originalDb[0].img_drive_root_path,
                lock_status: originalDb[0].lock_status,
                wbcMemo: originalDb[0].wbcMemo,
                wbcInfoAfter: originalDb[0].wbcInfoAfter,
                rbcInfoAfter: originalDb[0].rbcInfoAfter,
            },
        ],
    };
    const { mutate, loading, error, onDone } = useUpdateRunningInfoMutation({
        variables: {
            updateDto: updateDtos, // 수정된 구조
        },
    });

    return  await mutate();
}

export const gqlIsAllClassesCheckedUpdate = async (originalDB: any) => {
    const updateDtos = {
        runingInfoDtoItems: [
            {
                id: originalDB[0].id,
                isAllClassesChecked: originalDB[0].isAllClassesChecked,
            }
        ]
    };
    const { mutate, loading, error, onDone } = useUpdateRunningInfoMutation({
        variables: {
            updateDto: updateDtos,
        },
    });
    return await mutate();
}
export type UpdateRunningInfoMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>;