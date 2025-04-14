import { NgModule } from '@angular/core';
import { DirectivesComponent } from './directives.component';
import { PhoneMaskDirective } from './phone-mask.directive';
import { DragDropFileUploadDirective } from './drag-drop-file-upload.directive';



@NgModule({
  declarations: [
    DirectivesComponent,
    PhoneMaskDirective,
    DragDropFileUploadDirective
  ],
  imports: [
  ],
  exports: [
    DirectivesComponent
  ]
})
export class DirectivesModule { }
