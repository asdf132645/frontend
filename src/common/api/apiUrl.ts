export const apiUrl = (): string => {
    const linux = window.LINUX_SERVER_SET;
    console.log(linux)
    if(linux){
        return window.LINUXSERVERIP || ""; // 기본값 설정
    }else{
        return window.APP_API_BASE_URL || ""; // 기본값 설정
    }
}