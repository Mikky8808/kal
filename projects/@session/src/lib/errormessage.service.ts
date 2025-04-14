import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ShowErrorComponent } from 'projects/@components/src/lib/show-error/show-error.component';

@Injectable({
  providedIn: 'root',
})
export class ErrormessageService {
  constructor(private dialog: MatDialog) {}

  showErrorMsg(error: any) {
    const dialogRef = this.dialog.open(ShowErrorComponent, {
      // maxWidth: '100vw',
      maxHeight: '100vh',
      // height: '100%',
      // width: '100%',
      data: error,
    });
  }
}
