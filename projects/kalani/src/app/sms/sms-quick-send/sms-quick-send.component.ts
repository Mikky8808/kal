import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Optional,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BarcodereaderService } from 'projects/@session/src/lib/barcodereader.service';
import { SessionService } from 'projects/@session/src/public-api';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NotificationService } from 'projects/@session/src/lib/notification.service';
import { PhoneMaskDirective } from 'projects/@directives/src/lib/phone-mask.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { MemlookupComponent } from 'projects/@components/src/lib/memlookup/memlookup.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sms-quick-send',
  standalone: true,
  imports: [
    CommonModule,
    // MaterialModule,
    JimgcardComponent,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatCardModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    PhoneMaskDirective,
    FormsModule,
    MemlookupComponent,

  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sms-quick-send.component.html',
  styleUrls: ['./sms-quick-send.component.scss']
})
export class SmsQuickSendComponent implements OnInit, OnDestroy {
  Ready = false;
  Busy = false;
  quickEntry = false;
  // BarcodeDL: any;
  avatar = '';
  user = this.session.currentUser;
  smsForm!: FormGroup;
  private destroy$ = new Subject();

  
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;

  constructor(
    private barCodeReader: BarcodereaderService,
    @Optional()  public dialogRef: MatDialogRef<SmsQuickSendComponent>,
    private FormBuilder: FormBuilder,

    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private session: SessionService,
    private kalanisession: KalaniSessionService,
    private db: DbservicesService,
    private notification: NotificationService,
    private dialog: MatDialog,

    private changeDetectorRef: ChangeDetectorRef,
  ) {

  }

  ngOnInit(): void {
     this.setupForm({ member: {...this.dialogData} });

    // console.log(this.dialogRef);
    // if (this.dialogData == undefined || this.dialogData?.id == 0) {
    //   this.setupForm({ id: 0 });
    // } else {
    //   this.db.getMember({ id: this.dialogData.id }).subscribe({
    //     next: (json: any) => {
    //       this.avatar=json.avatar;
    //       this.setupForm(json);
    //     },
    //     error: (err: any) => {
    //       this.kalanisession.showErrorMsg(err);
    //       this.onClose();
    //     },
    //   });
    // }

    // eval('this.setupForm({})');
  }

  setupForm(rec: any) {
    this.Ready = true;

    this.smsForm = this.FormBuilder.nonNullable.group({
      member: [rec?.member, Validators.required],
      phone: [{disabled:true}],

      message: [rec?.message, Validators.required],
    });


    this.changeDetectorRef.markForCheck();
  }

  onSave() {
    this.submitButton?.nativeElement.click();
  }
  onSubmit() {
    // this.Busy=true;
    // this.changeDetectorRef.markForCheck();
    if (this.smsForm.value.message.trim()==''){
      this.smsForm.controls['message'].setErrors({ required: true })
      return;
    }
    const value = this.smsForm.value;
     const data = {message: value.message, phone: value.member.phone};
    
    this.db.smsQuickSend(data).subscribe({

      next: (json: any) => {
        // this.notification.notify(
        //   `Member: ${json.firstName} ${json.lastName} record ${
        //     this.smsForm.value.id == 0 ? 'Added' : 'Updated'
        //   } `
        // );
         this.Busy=false;
        this.changeDetectorRef.markForCheck();


        this.onClose();
      },
      error: (err: any) => {
        this.Busy=false;
        this.changeDetectorRef.markForCheck();

        this.kalanisession.showErrorMsg(err);
      },
    });

  }
  onMemberChanged (e:any){
   }
  openUploadDialog() {
    // const dialogRef = this.dialog.open(MemberUploadPicComponent, {
    //   disableClose: true,
    //   maxWidth: '100vw',
    //   maxHeight: '100%',
    //   width: '100%',
    //   height: '100%',
    //   data: {
    //     id: this.smsForm.value.id,
    //     name: `${this.smsForm.value.firstName} ${this.smsForm.value.lastName}`,
    //   },
    // });
    // dialogRef.afterClosed().subscribe((result) => {}); // calendarApi.unselect(); // clear date selection
  }
  onClose() {
    {
      this.dialogRef?.close();
    }
  }
  ngOnDestroy(): void {

    this.destroy$.next('');
    this.destroy$.complete();

  }
}
