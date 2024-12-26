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

export const memoUpdateDocument = gql`
    mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
        updateRunningInfoGQL(updateDto: $updateDto) {
            id
            wbcMemo
            rbcMemo
        }
    }
`;


export function useUpdateRunningInfoMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(UpdateRunningInfoDocument, options);
}

export function cbcUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(cbcUpdateDocument, options);
}


export function memoUpdateMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
    return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(memoUpdateDocument, options);
}

export const gqlUpdate = async (originalDb: any) => {
    const updateDtos = {
        runingInfoDtoItems: [
            {
                id: originalDb.id,
                isNormal: originalDb.isNormal,
                abnormalClassInfo: originalDb.abnormalClassInfo,
                pcIp: originalDb.pcIp,
                lock_status: originalDb.lock_status,
                wbcInfoAfter: originalDb.wbcInfoAfter,
                submitState: originalDb.submitState,
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

export const gqlCBCUpdate = async (originalDb: any) => {
    const updateDtos = {
        runingInfoDtoItems: [
            {
                id: originalDb.id,
                submitState: originalDb.submitState,
                submitOfDate: originalDb.submitOfDate,
                submitUserId: originalDb.submitUserId,
            },
        ],
    };
    const { mutate, loading, error, onDone } = cbcUpdateMutation({
        variables: {
            updateDto: updateDtos, // 수정된 구조
        },
    });

    return  await mutate();
}

export const gqlMemoMenuUpdate = async (originalDb: any) => {
    const updateDtos = {
        runingInfoDtoItems: [
            {
                id: originalDb.id,
                wbcMemo: originalDb.wbcMemo,
                rbcMemo: originalDb.rbcMemo,
            },
        ],
    };
    const { mutate, loading, error, onDone } = memoUpdateMutation({
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