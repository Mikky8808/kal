import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
  Optional,
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
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  MatCalendarCellCssClasses,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'projects/@session/src/lib/notification.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MemlookupComponent } from 'projects/@components/src/lib/memlookup/memlookup.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { PtApptPrintComponent } from '../pt-appt-dash/pt-appt-print/pt-appt-print.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

@Component({
  selector: 'app-pt-appt-edit',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatCheckboxModule,
    MemlookupComponent,
    MatMenuModule,
    MatDividerModule,
    PtApptPrintComponent,
  ],
  templateUrl: './pt-appt-edit.component.html',
  styleUrls: ['./pt-appt-edit.component.scss'],
})
export class PtApptEditComponent implements OnInit, OnDestroy {
  Ready = false;
  Busy = false;
  ptStatus = this.kalanisession.getptStatus;
  allowDelete = false;
  isDialog = true;
  PTStaff = this.kalanisession.PTStaff;
  ptReasons = this.kalanisession.ptReasons;
  Print = false;
  member: any;
  printMember = 0;
  currentUser = this.kalanisession.currentUser.username;
  private destroy$ = new Subject();

  form!: FormGroup;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;

  constructor(
    @Optional() private dialogRef: MatDialogRef<PtApptEditComponent>,
    private FormBuilder: FormBuilder,

    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public kalanisession: KalaniSessionService,
    private db: DbservicesService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  addMinutes(time: string, minutes: number) {
    let date = new Date('2000-01-01 ' + time);

    date = new Date(date.getTime() + minutes * 60000);

    return (
      String(date.getHours()).padStart(2, '0') +
      ':' +
      String(date.getMinutes()).padStart(2, '0')
    );
  }
  diff_minutes(start: Date, end: Date) {
    var diff = (end.getTime() - start.getTime()) / 1000;
    diff /= 60;
    if (diff > 1400) diff = 30;
    return Math.abs(Math.round(diff));
  }

  ngOnInit(): void {
    var rec: any = {};
    var data = { ...this.dialogData.data };

    this.db.getPTAppt(data).subscribe({
      next: (json: any) => {
        // this.form.controls['id'].patchValue(json.id);
        this.allowDelete = json.allowDelete;
        this.member = {
          id: json.memberId,
          MemberFullName: json.MemberFullName,
        };
        this.Ready = true;
        this.setupForm(json);

        this.subscribeValueChanges();
        this.rideFieldsEditable();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
        this.onClose();

      },
    });
  }
  subscribeValueChanges() {
    const apptTimeControl = this.form.get('apptTime');

    if (apptTimeControl) {
      apptTimeControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.form.controls['ridePickupTime'].patchValue(
            this.addMinutes(value, -30)
          );
          this.form.controls['rideDropTime'].patchValue(
            this.addMinutes(value, 90)
          );
        });
    }

    const reserveRideControl = this.form.get('reserveRide');
    if (reserveRideControl) {
      reserveRideControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.rideFieldsEditable();
        });
    }
  }
  rideFieldsEditable() {
    const value = this.form.get('reserveRide')?.value;
    if (value == 'Y') {
      this.form.get('ridePickupTime')?.enable();
      this.form.get('rideDropTime')?.enable();
      this.form.get('instructions')?.enable();
    } else {
      this.form.get('ridePickupTime')?.disable();
      this.form.get('rideDropTime')?.disable();
      this.form.get('instructions')?.disable();
    }
  }
  onClose() {
    {
      this.dialogRef?.close();
    }
  }

  setupForm(rec: any) {
    this.form = this.FormBuilder.group({
      id: rec?.id,
      memberId: [rec?.memberId, Validators.required],
      PTStaff: [rec?.PTStaff, Validators.required],
      PTStaffAssistant: [rec?.PTStaffAssistant],

      status: [rec?.status, Validators.required],
      // ptReason: [rec?.ptReason, Validators.required],
      reserveRide: [rec?.reserveRide, Validators.required],
      apptDate: [rec?.apptDate, Validators.required],
      apptTime: [rec?.apptTime, Validators.required],
      apptDuration: [rec?.apptDuration, Validators.required],
      initialVisit: [rec?.initialVisit],

      wheelChair: [rec?.wheelChair],
      ridePickupTime: [
        { value: rec?.ridePickupTime, disabled: true },
        Validators.required,
      ],
      rideDropTime: [
        { value: rec?.rideDropTime, disabled: true },
        Validators.required,
      ],
      instructions: [{ value: rec?.instructions, disabled: true }],
    });
  }
  onDelte(deleteType: string) {
    const value = this.form.value;
    let data = {};
    if (deleteType == 'single') {
      data = { deleteType: deleteType, id: value.id };
    } else {
      data = {
        deleteType: deleteType,
        id: value.id,
        memberId: this.member.id,
        apptDate: value.apptDate,
      };
    }
    this.db.deletePTAppt(data).subscribe({
      next: (json: any) => {
        // this.form.controls['id'].patchValue(json.id);
        this.notification.notify('Appointment(s) Deleted');
        this.Busy = false;
         this.onClose();
      },
      error: (err: any) => {
        this.Ready = true;
        this.Busy = false;
        this.kalanisession.showErrorMsg(err);
      },
    });
  }
  onSave() {
    this.submitButton?.nativeElement.click();
  }
  onSubmit() {
    let value = { ...this.form.value };
    // value.memberId = value.member.id;
    if (value.PTStaff == value.PTStaffAssistant) value.PTStaffAssistant = '';
    this.db.updatePTAppt(value).subscribe({
      next: (json: any) => {
        // this.form.controls['id'].patchValue(json.id);
        this.setupForm({});
        this.Ready = false;
        this.Busy = false;
        setTimeout(() => {
          this.Ready = true;
        }, 50);
        this.notification.notify('Appointment updated');

        this.onClose();
      },
      error: (err: any) => {
        this.Ready = true;
        this.Busy = false;
        this.onClose();

        this.kalanisession.showErrorMsg(err);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  noDataEntry(event: any) {
    event.preventDefault();
  }
}
