import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  ViewChild,
  AfterViewChecked,
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
// Add this import at the top
import { NotificationService } from 'projects/@session/src/lib/notification.service';

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
export class MemberUploadPicComponent implements OnDestroy, AfterViewChecked {
  file?: File; // Variable to store file
  form!: FormGroup;
  private destroy$ = new Subject();
  imgSrc = '';
  avatar: string = ''; 
  Ready = false;
  progress: number = 0;
  loaded: number = 0;
  total: number = 0;
  uploading: boolean = false;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;
  @ViewChild('imageCropper', { static: false }) imageCropper?: ElementRef;
  croppedImgSrc: string = '';
  cropper: any;

  constructor(
    public dialogRef: MatDialogRef<MemberUploadPicComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private FormBuilder: FormBuilder,
    public kalanisession: KalaniSessionService,
    public db: DbservicesService,
    private notification: NotificationService,
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
              this.croppedImgSrc = ''; // Reset cropped image
              if (this.cropper) {
                this.cropper.destroy();
                this.cropper = null;
              }
            };
          }
        });
    }
  }

  ngAfterViewChecked() {
    // Initialize cropper when imgSrc is set and cropper not yet created
    if (this.imgSrc && this.imageCropper && !this.cropper) {
      this.cropper = new (window as any).Cropper(this.imageCropper.nativeElement, {
        aspectRatio: 1,
        viewMode: 1,
      });
    }
  }

removePhoto() {
  if (!this.data?.id) return;
  this.uploading = true;
  this.db.removeMemberPhoto({ memberId: this.data.id }).subscribe({
    next: () => {
      this.avatar = '';
      this.imgSrc = '';
      this.croppedImgSrc = '';
      this.uploading = false;
      this.notification.notify('Photo removed');
    },
    error: (err) => {
      this.uploading = false;
      this.notification.notify('Failed to remove photo');
    }
  });
}

  cropImage() {
    if (this.cropper) {
      this.croppedImgSrc = this.cropper.getCroppedCanvas().toDataURL('image/png');
      this.imgSrc = this.croppedImgSrc;
      this.cropper.destroy();
      this.cropper = null;
    }
  }

  dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/png' });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }
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

    // Use cropped image if available
    if (this.croppedImgSrc) {
      formData.append('avatarpic', this.dataURItoBlob(this.croppedImgSrc), 'avatar.png');
    } else {
      formData.append('avatarpic', this.form.value.avatarpic);
    }

    this.uploading = true;
    this.db.uploadMemberPic(formData).subscribe({
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