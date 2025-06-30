import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TabPlaceholderUnderConstructionComponent } from '../shared/tab-placeholder/tab-placeholder-under-construction/tab-placeholder-under-construction.component';

const routes: Routes = [
  { path: '', component: TabPlaceholderUnderConstructionComponent },
  { path: 'documents', loadChildren: () => import('./documents/documents.module').then(m => m.DocumentsModule) },
  { path: 'persons', loadChildren: () => import('./persons/persons.module').then(m => m.PersonsModule) },
  { path: 'document-intake', loadChildren: () => import('./document-intake/document-intake.module').then(m => m.DocumentIntakeModule) },
  { path: 'communications', loadChildren: () => import('./communications/global-communication-search.module').then(m => m.GlobalCommunicationSearchModule) },
  { path: 'matters', loadChildren: () => import('./matters/matters.module').then(m => m.MattersModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }
