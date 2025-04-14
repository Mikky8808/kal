import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JimgcardComponent } from '../jimgcard/jimgcard.component';
import { Nl2brPipe } from 'projects/@pipes/src/lib/nl2br.pipe';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
declare const navigator: any;
@Component({
  selector: 'lib-show-error',
  standalone: true,
  imports: [
    CommonModule,
    JimgcardComponent,
    Nl2brPipe,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './show-error.component.html',
  styleUrls: ['./show-error.component.css'],
})
export class ShowErrorComponent {
  message!: string;
  heading = 'Error Detected';
  validationError = [];
  constructor(
    public dialogRef: MatDialogRef<ShowErrorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    // this.message=data;
    if (typeof data === 'string') {
      this.message = data;
    } else {
      if (this.data.status != 501)
        this.message =
          JSON.stringify(data.message) +
          '\n' +
          JSON.stringify(data.error) +
          '\n' +
          JSON.stringify(data.stack);
      else {
        this.heading = 'Validation Error';
        this.validationError = data.error;
      }
    }
  }
}
