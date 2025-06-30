import * as fromProjects from './reducer';
import * as fromRoot from '../../../state';

export interface AppState extends fromRoot.AppState {
  projects_feature: fromProjects.ProjectsState
}
