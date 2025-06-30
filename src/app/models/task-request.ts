import { DateHelper } from '@app/helpers/date.helper';
import { IdValue } from '@app/models/idValue';
import { Auditable } from './auditable';
import { Project } from './projects/project';
import { User } from './user';

export class TaskRequest extends Auditable {
  id: number;
  taskCategoryId: number;
  name: string;
  projectId: number;
  taskPriorityId: number;
  assigneeUserId: User;
  description: string;
  parentId: number;
  dueDate: Date;
  completedDate: Date;
  resolutionSummary: string;
  createdFromTemplate: IdValue;
  createdFromTemplateId: number;
  blocked: boolean;
  blockingReason: string;
  blockingDate: Date;
  responsibleParty: string;
  stageId: number;
  teamId: number;
  subTasks: TaskRequest[];
  assigneeUser: User;
  taskCategory: IdValue;
  project: Project;
  taskPriority: IdValue;
  parent : IdValue;
  stage: IdValue;
  team: IdValue;
  templateName: string;

  constructor(model?: Partial<TaskRequest>) {
    super();
    Object.assign(this, model);
  }

  public static toModel(item: any): TaskRequest {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        taskCategory: item.taskCategory,
        taskCategoryId: item.taskCategory?.id,
        name: item.name,
        project: item.project,
        projectId: item.projectId,
        taskPriority: item.taskPriority,
        taskPriorityId: item.taskPriority?.id,
        assigneeUser: item.assigneeUser,
        assigneeUserId: item.assigneeUserId,
        description: item.description,
        parent: item.parent,
        parentId: item.parentId,
        dueDate: DateHelper.toLocalDate(item.dueDate),
        completedDate: DateHelper.toLocalDate(item.completedDate),
        resolutionSummary: item.resolutionSummary,
        createdFromTemplate: item.createdFromTemplate,
        createdFromTemplateId: item.createdFromTemplateId,
        blocked: item.blocked,
        blockingReason: item.blockingReason,
        blockingDate: DateHelper.toLocalDate(item.blockingDate),
        responsibleParty: item.responsibleParty,
        stage: item.stage,
        stageId: item.stageId,
        team: item.team,
        teamId: item.teamId,
        subTasks: item.subTasks,
        templateName: item.templateName,
      };
    }
    return null;
  }

  public static toDtoSubTask(item: TaskRequest): any {
    return {
      id: item.id,
      taskCategoryId: item.taskCategoryId,
      name: item.name,
      taskPriorityId: item.taskPriorityId,
      assigneeUserId: item.assigneeUserId,
      description: item.description,
      dueDate: DateHelper.fromLocalDateToUtcString(item.dueDate),
      completedDate: DateHelper.fromLocalDateToUtcString(item.completedDate),
      resolutionSummary: item.resolutionSummary,
      stageId: item.stageId,
      createdFromTemplateId: item.createdFromTemplate?.id,
      parentId: item.parent?.id,
      teamId: item.team?.id,
      projectId: item.project?.id,
      blocked: item.blocked,
      blockingReason: item.blockingReason,
      blockingDate: item.blockingDate ? DateHelper.fromLocalDateToUtcString(item.blockingDate) : null,
      responsibleParty: item.responsibleParty,
    };
  }
}
