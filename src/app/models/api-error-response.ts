export interface ApiErrorResponse {
  error: string;
  errorMessages: { [key: string]: ApiErrorMessage[] };
}

export interface ApiErrorMessage {
  fieldName: string;
  content: string;
  errorLevel: ErrorLevel;
}

export enum ErrorLevel {
  Field = 0,
  Form = 1,
}
