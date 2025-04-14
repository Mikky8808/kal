import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
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
import { MemberUploadPicComponent } from '../member-upload-pic/member-upload-pic.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

@Component({
  selector: 'app-member-edit',
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,

  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.scss'],
})
export class MemberEditComponent implements OnInit, OnDestroy {
  Ready = false;
  Busy = false;
  quickEntry = false;
  BarcodeDL: any;
  BarCodeDL$: any;
  avatar = '';
  user = this.session.currentUser;
  memberForm!: FormGroup;
  membertypes: any[] = this.kalanisession.membertypes;
  insurancetypes: any[] = this.kalanisession.insurancetypes;
  membershiptypes: any[] = this.kalanisession.membershiptypes;
  
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;

  constructor(
    private barCodeReader: BarcodereaderService,
    private dialogRef: MatDialogRef<MemberEditComponent>,
    private FormBuilder: FormBuilder,

    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private session: SessionService,
    private kalanisession: KalaniSessionService,
    private db: DbservicesService,
    private notification: NotificationService,
    private dialog: MatDialog,

    private changeDetectorRef: ChangeDetectorRef,
  ) {
    //  this.BarCodeDL$= this.barCodeReader.BarCodeDL$.asObservable();
    this.BarCodeDL$ = this.barCodeReader.BarCodeDL$.subscribe((dlInfo: any) => {
      const keys = Object.keys(dlInfo);
      keys.forEach((key) => {
        this.memberForm.controls[key].patchValue(dlInfo[key]);
      });
    });
  }

  ngOnInit(): void {
    if (this.dialogData.id == 0) {
      this.setupForm({ id: 0 });
    } else {
      this.db.getMember({ id: this.dialogData.id }).subscribe({
        next: (json: any) => {
          this.avatar=json.avatar;
          this.setupForm(json);
        },
        error: (err: any) => {
          this.kalanisession.showErrorMsg(err);
          this.onClose();
        },
      });
    }

    // eval('this.setupForm({})');
  }
  onQuickEntry() {
    if (!this.quickEntry) {
      Object.keys(this.memberForm.controls).forEach((key) => {
        this.memberForm.controls[key].enable();
      });

      return;
    } else {
      const allowed = [
        'id',
        'membertype',
        'firstName',
        'lastName',
        'DOB',
        'phone',
      ];
      Object.keys(this.memberForm.controls).forEach((key) => {
        // this.memberForm.controls[key].enable();
        if (!allowed.includes(key)) {
          this.memberForm.controls[key].disable();
        }
      });
    }
  }

  setupForm(rec: any) {
    this.Ready = true;

    this.memberForm = this.FormBuilder.nonNullable.group({
      id: rec?.id,
      membertype: [rec?.membertype, Validators.required],
       firstName: [rec?.firstName, Validators.required],
      middleName: [rec?.middleName],
      lastName: [rec?.lastName, Validators.required],
      nickName: [rec?.nickName],
      // DOB: [rec?.DOB, Validators.required],

      DOB: [rec?.DOB],
    

      legalSex: [rec?.legalSex],
      address: [rec?.address, Validators.required],
      emrID: [rec?.emrID],
      DL: [rec?.DL],
      // email: [rec?.email, Validators.email],
      email: [rec?.email],
      city: [rec?.city, Validators.required],
      state: [rec?.state, Validators.required],
      zipCode: [rec?.zipCode, Validators.required],
      phone: [
        rec?.phone,
        [Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/), Validators.required],
      ],
      homePhone: [
        rec?.homePhone,
        Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
      ],
      emrContact: [rec?.emrContact],
      emrRelationship: [rec?.emrRelationship],
      emrPhone: [rec?.emrPhone, Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/)],
      emrHomePhone: [
        rec?.emrHomePhone,
        Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),
      ],

      comments: [rec?.comments],
    });
    this.changeDetectorRef.markForCheck();
  }
  getMemberTypeDesc() {
    const found = this.membertypes.find(
      (element) => element.type == this.memberForm.controls['membertype'].value
    );
    if (found) return found.desc;
    return '';
  }
  onSave() {
    this.submitButton?.nativeElement.click();
  }
  onSubmit() {
    this.Busy=true;
    this.changeDetectorRef.markForCheck();

    this.db.saveMember(this.memberForm.value).subscribe({
      // this.db.saveXrayLog(toFormData (this.xrayLogForm.value)).subscribe({
      //  this.db.saveXrayLog( (this.xrayLogForm.value)).subscribe({
      next: (json: any) => {
        this.notification.notify(
          `Member: ${json.firstName} ${json.lastName} record ${
            this.memberForm.value.id == 0 ? 'Added' : 'Updated'
          } `
        );
        this.Busy=false;
        this.changeDetectorRef.markForCheck();

        this.memberForm.controls['id'].patchValue(json.id);

        this.onClose();
      },
      error: (err: any) => {
        this.Busy=false;
        this.changeDetectorRef.markForCheck();

        this.kalanisession.showErrorMsg(err);
      },
    });
  }
  openUploadDialog() {
    const dialogRef = this.dialog.open(MemberUploadPicComponent, {
      disableClose: true,
      maxWidth: '100vw',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
      data: {
        id: this.memberForm.value.id,
        name: `${this.memberForm.value.firstName} ${this.memberForm.value.lastName}`,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {}); // calendarApi.unselect(); // clear date selection
  }
  onClose() {
    {
      this.dialogRef.close();
    }
  }
  ngOnDestroy(): void {
    this.BarCodeDL$.unsubscribe();
  }
}
