import { Component,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  MatToolbarModule } from '@angular/material/toolbar';
import { SessionService } from 'projects/@session/src/public-api';

@Component({
  selector: 'jimgcard',
  standalone: true,
  imports: [CommonModule,MatToolbarModule],
  templateUrl: './jimgcard.component.html',
  styleUrls: ['./jimgcard.component.css']
})
export class JimgcardComponent {
  constructor(private session:SessionService){

  }
  @Input() heading?: string;
  @Input() marginBottom?: string = "0px";
  @Input() maxHeight: string = this.session.isMobile ? 'calc(100vh - 168px - 40px)' : 'calc(100vh - 168px)';

}
