export class ProjectCustomMessageDto {
  message: string;
  primaryOrgId: number;
  projectId: number;
  active: boolean;

  constructor(model?: Partial<ProjectCustomMessageDto>) {
    Object.assign(this, model);
  }
}
