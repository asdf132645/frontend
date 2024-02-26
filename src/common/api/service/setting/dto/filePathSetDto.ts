export interface CreateFilePathDto {
    filePathSetItems: FilePathItem[];
    userId: number;
}

export interface FilePathItem {
    lisHotKey: string;
    lisFilePath: string;
    cbcFilePath: string;
}

export interface UpdateFilePathsDto {
    filePathSetItems: FilePathItem[];
    userId: number;
}
