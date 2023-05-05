export enum ErrorCode {
    NOT_FOUND = 404,
}

export type Error = {
    code: ErrorCode;
    message: string;
}