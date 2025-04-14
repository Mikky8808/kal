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
  FormGroupDirective,
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
  MatCalendar,
  MatCalendarCellCssClasses,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'projects/@session/src/lib/notification.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MemlookupComponent } from 'projects/@components/src/lib/memlookup/memlookup.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

@Component({
  selector: 'app-pt-appointment',
  standalone: true,
  imports: [
    CommonModule,
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
  ],
  templateUrl: './pt-appointment.component.html',
  styleUrls: ['./pt-appointment.component.scss'],
})
export class PtAppointmentComponent implements OnInit, OnDestroy {
  Ready = true;
  Busy = false;
  isDialog = true;
  PTStaff = this.kalanisession.PTStaff;
  ptReasons = this.kalanisession.ptReasons;
  currentUser = this.kalanisession.currentUser.username;
 startAt = new Date();

  selectedDate: any;
  daysSelected: any[] = [];
  private destroy$ = new Subject();

  form!: FormGroup;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;
  @ViewChild('calendar', { static: false }) public calendar!: MatCalendar<Date>;
  @ViewChild(FormGroupDirective)
  private formDir!: FormGroupDirective;

  constructor(
    @Optional() private dialogRef: MatDialogRef<PtAppointmentComponent>,
    private FormBuilder: FormBuilder,

    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public kalanisession: KalaniSessionService,
    private db: DbservicesService,
    private dialog: MatDialog,
    // private _snackBar: MatSnackBar,
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
 
    if (this.dialogRef === null) {
      this.isDialog = false;
      (rec.apptTime = '07:00'), (rec.apptDuration = 30);
    } else {
      
      var data = { ...this.dialogData.data };
      rec.PTStaff = data?.PTStaff;
      if (data?.start instanceof Date) {
        this.startAt = data.start;

        this.daysSelected = [
          data.start.getFullYear() +
            '-' +
            ('00' + (data.start.getMonth() + 1)).slice(-2) +
            '-' +
            ('00' + data.start.getDate()).slice(-2),
        ];
        rec.apptDatesSelected = 'Y';
        rec.apptTime =
          String(data.start.getHours()).padStart(2, '0') +
          ':' +
          String(data.start.getMinutes()).padStart(2, '0');
        if (rec.apptTime == '00:00') rec.apptTime = '07:00';
        rec.apptDuration = this.diff_minutes(data.start, data.end);
      }
    }

    rec.ridePickupTime = this.addMinutes(rec.apptTime, -30);
    rec.rideDropTime = this.addMinutes(rec.apptTime, rec.apptDuration + 90);
    rec.apptEndTime = this.addMinutes(rec.apptTime, rec.apptDuration);

    this.setupForm(rec);
   }
  onClose() {
    {
      this.dialogRef?.close();
    }
  }

  setupForm(rec: any) {
    this.Ready = true;

    this.form = this.FormBuilder.group({
      PTStaff: [rec?.PTStaff, Validators.required],
      member: [rec?.member, Validators.required],
      reason: [{value: '' ,disabled:true}, Validators.required],

      blockTime: [],

      // ptReason: [rec?.ptReason, Validators.required],
      PTStaffAssistant: [''],

      reserveRide: [rec?.reserveRide, Validators.required],
      apptTime: [
        rec?.apptTime ? rec?.apptTime : '07:00:00',
        Validators.required,
      ],
      apptEndTime: [{ value: rec?.apptEndTime, disabled: true }],

      apptDuration: [
        rec?.apptDuration ? rec?.apptDuration : 30,
        Validators.required,
      ],
      wheelChair: [0],
      initialVisit: [0],
      apptDatesSelected: [rec?.apptDatesSelected, Validators.required],

      ridePickupTime: [
        { value: rec?.ridePickupTime, disabled: true },
        Validators.required,
      ],
      rideDropTime: [
        { value: rec?.rideDropTime, disabled: true },
        Validators.required,
      ],
      instructions: [{ value: '', disabled: true }],
    });

    const apptTimeControl = this.form.get('apptTime');

    if (apptTimeControl) {
      apptTimeControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          

          this.form.controls['ridePickupTime'].patchValue(
            this.addMinutes(value, -30)
          );

          this.form.controls['rideDropTime'].patchValue(
            this.addMinutes(
              value,
              this.form.controls['apptDuration'].value + 60
            )
          );
          this.form.controls['apptEndTime'].patchValue(
            this.addMinutes(value, this.form.controls['apptDuration'].value)
          );
        });
    }

    const aapptDurationControl = this.form.get('apptDuration');

    if (aapptDurationControl) {
      aapptDurationControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.form.controls['rideDropTime'].patchValue(
            this.addMinutes(this.form.get('apptTime')?.value, value + 60)
          );
          this.form.controls['apptEndTime'].patchValue(
            this.addMinutes(this.form.get('apptTime')?.value, value)
          );
        });
    }

    const reserveRideControl = this.form.get('reserveRide');
    if (reserveRideControl) {
      reserveRideControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          if (value == 'Y') {
            this.form.get('ridePickupTime')?.enable();
            this.form.get('rideDropTime')?.enable();
            this.form.get('instructions')?.enable();
          } else {
            this.form.get('ridePickupTime')?.disable();
            this.form.get('rideDropTime')?.disable();
            this.form.get('instructions')?.disable();
          }
        });
    }
    const nonBlockFields = ['member','PTStaffAssistant','wheelChair','initialVisit','reserveRide']
    const blockTimeControl = this.form.get('blockTime');
    if (blockTimeControl) {
      blockTimeControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
           nonBlockFields.forEach(field => {
            if (value===true)  this.form.get('reason')?.enable()
            else this.form.get('reason')?.disable();

             if (value === true) this.form.get(field)?.disable()
            else  this.form.get(field)?.enable();
          })
          // if (value === true) {
          //   this.form.get('member')?.disable();
          //   this.form.get('PTStaffAssistant')?.disable();
          //   this.form.get('wheelChair')?.disable();
            
          // } else {
          //   this.form.get('member')?.enable();
          //   this.form.get('PTStaffAssistant')?.enable();
          //   this.form.get('wheelChair')?.enable();

          // }
        });
    }

  }

  onSave() {
    this.submitButton?.nativeElement.click();
  }
  onSubmit() {
    this.Busy = true;
    let value = { ...this.form.value };
    value.daysSelected = [...this.daysSelected.sort()];
    value.memberId = value.member?.id;

    if (value.PTStaff == value.PTStaffAssistant) value.PTStaffAssistant = '';
    this.db.createPTAppt(value).subscribe({
      next: (json: any) => {
        this.formDir.resetForm({
          PTStaff: value.PTStaff,
          member: value.member,
        });
         this.Busy = false;
        this.daysSelected = [];
        this.notification.notify('Appointment Created');
        this.calendar.updateTodaysDate();

        // this.onClose();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
        this.Busy = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
  onSelectDate(event: any, calendar: any) {
    if (event.getDay()==0 || event.getDay()==6) return;
    this.selectedDate = event;
    const date =
      event.getFullYear() +
      '-' +
      ('00' + (event.getMonth() + 1)).slice(-2) +
      '-' +
      ('00' + event.getDate()).slice(-2);
    const index = this.daysSelected.findIndex((x) => x == date);
    if (index < 0) this.daysSelected.push(date);
    else this.daysSelected.splice(index, 1);
    this.daysSelected.length > 0
      ? this.form.controls['apptDatesSelected'].patchValue('Y')
      : this.form.controls['apptDatesSelected'].patchValue(null);
    this.form.updateValueAndValidity();

    calendar.updateTodaysDate();
  }
  isDateSelected = (event: any) => {
    const date =
      event.getFullYear() +
      '-' +
      ('00' + (event.getMonth() + 1)).slice(-2) +
      '-' +
      ('00' + event.getDate()).slice(-2);
    return this.daysSelected.find((x) => x == date) ? 'selected' : '';
  };

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      if (date.getDay()==0 || date.getDay()==6) {
        return 'hide-date';}

      const seldate =
        date.getFullYear() +
        '-' +
        ('00' + (date.getMonth() + 1)).slice(-2) +
        '-' +
        ('00' + date.getDate()).slice(-2);
      return this.daysSelected.find((x) => x == seldate) ? 'special-date' : '';
    };
  }
  noDataEntry(event: any) {
    event.preventDefault();
  }

  removeDate(i: number) {
    this.daysSelected.splice(i, 1);
    this.daysSelected.length > 0
      ? this.form.controls['apptDatesSelected'].patchValue('Y')
      : this.form.controls['apptDatesSelected'].patchValue(null);
  }
}
