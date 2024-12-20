import * as VueApolloComposable from "@vue/apollo-composable";
import { ref, reactive } from "vue";
import { GetRunningInfoByIdDocument } from "./queries"; // 쿼리 파일 가져오기
import { GetRunningInfoByIdQueryVariables, GetRunningInfoByIdQuery } from "@/gql"; // 타입 가져오기

// 쿼리 함수에 변수와 옵션 타입 지정
export function useGetRunningInfoByIdQuery(
    variables: GetRunningInfoByIdQueryVariables, // 변수 타입 지정
    options: VueApolloComposable.UseQueryOptions<GetRunningInfoByIdQuery, GetRunningInfoByIdQueryVariables> = {} // 옵션 타입 지정
) {
    // variables와 options를 ref로 감싸서 반응형으로 처리
    const reactiveVariables = ref(variables);
    const reactiveOptions = reactive(options);

    return VueApolloComposable.useQuery(
        GetRunningInfoByIdDocument,  // GraphQL 쿼리
        reactiveVariables,          // 반응형 변수
        reactiveOptions            // 반응형 옵션
    );
}
