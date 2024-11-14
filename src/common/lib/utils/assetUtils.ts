import completeAlarm from "@/assets/sound/complete.wav";
import errorAlarm from "@/assets/sound/error.mp3";

export const SOUND_ERROR_ALARM = new Audio(errorAlarm);
export const SOUND_COMPLETE_ALARM = new Audio(completeAlarm);

export const openseadragonPrefixUrl = (apiBaseUrl: string) => `${apiBaseUrl}/folders?folderPath=D:/UIMD_Data/Res/uimdFe/images/`