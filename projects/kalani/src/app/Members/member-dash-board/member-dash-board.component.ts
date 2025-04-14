import { ChangeDetectorRef, Component,ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MemberlistComponent } from '../memberlist/memberlist.component';

@Component({
  selector: 'app-member-dash-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, DragDropModule,
    MemberlistComponent
  ],
  templateUrl: './member-dash-board.component.html',
  styleUrls: ['./member-dash-board.component.scss']
})
export class MemberDashBoardComponent {
constructor(    public changeDetectorRef: ChangeDetectorRef
  ){
}
}
