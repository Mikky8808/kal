import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-member-qv',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-qv.component.html',
  styleUrls: ['./member-qv.component.scss']
})
export class MemberQVComponent {
  @Input() currentMember: number = 0;
}
