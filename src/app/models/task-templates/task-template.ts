import { DateHelper } from '@app/helpers/date.helper';
import { Auditable } from '../auditable';
import { IdValue } from '../idValue';
import { User } from '../user';

export class TaskTemplate extends Auditable {
  id: number;
  assigneeUser: User;
  name: string;
  description: string;
  active: number;
  taskPriority: IdValue;
  taskCategory: IdValue;
  parent: IdValue;
  team: IdValue;
  teamId: number;
  dueDate: Date;
  tasksCount: number;
  subTasksCount: number;
  templateDescription: string;
  templateName: string;
  stage: IdValue;
  associatedStageId: number;
  associatedStage: IdValue;
  standardSLA: number;
  notExisting: boolean;

  public static toModel(item: any): TaskTemplate {
    if (item) {
      return {
        ...super.toModel(item),
        id: item.id,
        assigneeUser: item.assigneeUser,
        name: item.name,
        description: item.description,
        active: item.active,
        tasksCount: item.tasksCount,
        subTasksCount: item.subTasksCount,
        taskPriority: item.taskPriority,
        taskCategory: item.taskCategory,
        parent: item.parent,
        team: item?.team || item?.taskTeam,
        teamId: item.team?.id,
        dueDate: DateHelper.toLocalDate(item.dueDate),
        templateDescription: item.templateDescription,
        templateName: item.templateName,
        stage: item.stage,
        associatedStageId: item.associatedStageId,
        standardSLA: item.standardSLA,
        associatedStage: item.associatedStage,
        notExisting: false,
      };
    }
    return null;
  }

  public static toDtoSubTask(item: TaskTemplate): any {
    return {
      id: item.id,
      taskCategoryId: item.taskCategory?.id,
      name: item.name,
      taskPriorityId: item.taskPriority?.id,
      assigneeUserId: item.assigneeUser?.id,
      description: item.description,
      dueDate: DateHelper.fromLocalDateToUtcString(item.dueDate),
      stageId: item.stage?.id,

      parentId: item.parent?.id,
      teamId: item.team?.id,
      templateName: item.templateName,
      templateDescription: item.templateDescription,
      active: item.active,
    };
  }
}
