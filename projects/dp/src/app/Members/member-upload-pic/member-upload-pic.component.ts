import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SessionService } from 'projects/@session/src/public-api';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

@Component({
  selector: 'app-member-upload-pic',
  standalone: true,
  imports: [
    CommonModule,
    JimgcardComponent,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    NgxMatFileInputModule,
    MatProgressBarModule,
  ],
  templateUrl: './member-upload-pic.component.html',
  styleUrls: ['./member-upload-pic.component.scss'],
})
export class MemberUploadPicComponent implements OnDestroy {
  file?: File; // Variable to store file
  form!: FormGroup;
  private destroy$ = new Subject();
  imgSrc = '';
  Ready = false;
  progress: number = 0;
  loaded: number = 0;
  total: number = 0;
  uploading: boolean = false;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<MemberUploadPicComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private FormBuilder: FormBuilder,
    public kalanisession: KalaniSessionService,
    public db: DbservicesService
  ) {
    this.form = this.FormBuilder.group({
      id: this.data.id,
      avatarpic: [this.file, Validators.required],
    });
    this.Ready = true;
    const fileControl = this.form.controls['avatarpic'];
    if (fileControl) {
      fileControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          if (value) {
            const reader = new FileReader();
            reader.readAsDataURL(value);

            reader.onload = () => {
              this.imgSrc = reader.result as string;
            };
          }
        });
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
  onSave() {
    this.submitButton?.nativeElement.click();
  }
  onClose() {
    this.dialogRef.close();
  }
  onSubmit() {
    const formData = new FormData();
    formData.append('id', this.form.value.id);
    formData.append('avatarpic', this.form.value.avatarpic);
    this.uploading = true;
    this.db.uploadMemberPic(formData).subscribe({
      //  this.db.saveXrayLog( (this.xrayLogForm.value)).subscribe({
      next: (event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Request has been made!');
            break;
          case HttpEventType.ResponseHeader:
            console.log('Response header has been received!');
            break;
          case HttpEventType.UploadProgress:
            if (event.total)
              this.progress = Math.round((event.loaded / event.total) * 100);
            this.total = event.total as number;
            this.loaded = event.loaded;
            console.log(`Uploaded! ${this.progress}%`);
            break;
          case HttpEventType.Response:
            console.log('File uploaded successfully!', event.body);

            this.kalanisession.notify(
              `Profile image for member: ${this.data.name} uploaded!`
            );
            this.onClose();
        }
      },

      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
      },
    });

  }
}
