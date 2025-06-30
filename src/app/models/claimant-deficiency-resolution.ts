export interface IDeficiencyResolution {
  clientId: number;
  deficiencyId: number;
  resolutionNote: string;
  deficiencyResolutionDetails: IDeficiencyResolutionDetail[];
}

interface IDeficiencyResolutionDetail {
  resolutionValue?: string;
  deficiencyTypeExpectedResponseId: number;
}

export interface EncodedFileDto {
  fileName: string;
  name: string;
  contentType: string;
  base64Content: string;
}

export interface IDeficiencyResolutionWithFiles {
  deficiencyResolution: IDeficiencyResolution;
  files: EncodedFileDto[];
}