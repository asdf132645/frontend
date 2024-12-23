// import {gql} from "graphql-tag";
// import * as VueApolloComposable from "@vue/apollo-composable";
// import {ReactiveFunction, UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables} from "./index";
//
// export const UpdateRunningInfoDocument = gql`
//     mutation UpdateRunningInfo($updateDto: UpdateRuningInfoDto!) {
//         updateRunningInfoGQL(updateDto: $updateDto) {
//             id
//             isNormal
//             abnormalClassInfo {
//                 classNm
//                 val
//             }
//             pcIp
//             lock_status
//             wbcInfoAfter {
//                 id
//                 name
//                 count
//                 title
//                 images {
//                     coordinates {
//                         display
//                     }
//                     fileName
//                     title
//                     filter
//                     height
//                     width
//                 }
//                 percent
//             }
//         }
//     }
// `;
//
// /**
//  * __useUpdateRunningInfoMutation__
//  *
//  * To run a mutation, you first call `useUpdateRunningInfoMutation` within a Vue component and pass it any options that fit your needs.
//  * When your component renders, `useUpdateRunningInfoMutation` returns an object that includes:
//  * - A mutate function that you can call at any time to execute the mutation
//  * - Several other properties: https://v4.apollo.vuejs.org/api/use-mutation.html#return
//  *
//  * @param options that will be passed into the mutation, supported options are listed on: https://v4.apollo.vuejs.org/guide-composable/mutation.html#options;
//  *
//  * @example
//  * const { mutate, loading, error, onDone } = useUpdateRunningInfoMutation({
//  *   variables: {
//  *     updateDto: // value for 'updateDto'
//  *   },
//  * });
//  */
// export function useUpdateRunningInfoMutation(options: VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables> | ReactiveFunction<VueApolloComposable.UseMutationOptions<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>> = {}) {
//     return VueApolloComposable.useMutation<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>(UpdateRunningInfoDocument, options);
// }
//
// export const gqlUpdate = async (originalDb: any) => {
//     const updateDtos = {
//         runingInfoDtoItems: [
//             {
//                 id: originalDb[0].id,
//                 isNormal: originalDb[0].isNormal,
//                 abnormalClassInfo: originalDb[0].abnormalClassInfo,
//                 pcIp: originalDb[0].pcIp,
//                 lock_status: originalDb[0].lock_status,
//                 wbcInfoAfter: originalDb[0].wbcInfoAfter,
//             },
//         ],
//     };
//     const { mutate, loading, error, onDone } = useUpdateRunningInfoMutation({
//         variables: {
//             updateDto: updateDtos, // 수정된 구조
//         },
//     });
//
//     return  await mutate();
// }
// export type UpdateRunningInfoMutationCompositionFunctionResult = VueApolloComposable.UseMutationReturn<UpdateRunningInfoMutation, UpdateRunningInfoMutationVariables>;