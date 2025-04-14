import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef } from '@angular/material/dialog';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

@Component({
  selector: 'app-lock-screen',
  standalone: true,
  imports: [CommonModule, JimgcardComponent,MatButtonModule,MatIconModule],
  templateUrl: './lock-screen.component.html',
  styleUrls: ['./lock-screen.component.scss']
})
export class LockScreenComponent {
  constructor(   public dialogRef: MatDialogRef<LockScreenComponent>,
    public session : KalaniSessionService
  ){
 
  }

  
}
