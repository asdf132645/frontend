export interface CreateFilePathDto {
    filePathSetItems: FilePathItem[];
}

export interface FilePathItem {
    lisHotKey: string;
    lisFilePath: string;
    cbcFilePath: string;
}

export interface UpdateFilePathsDto {
    filePathSetItems: FilePathItem[];
}
