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
import { SessionService } from 'projects/@session/src/public-api';
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
import { GooglemapurlPipe } from 'projects/@pipes/src/lib/googlemapurl.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MemlookupComponent } from 'projects/@components/src/lib/memlookup/memlookup.component';
import { PhoneMaskDirective } from 'projects/@directives/src/lib/phone-mask.directive';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-trip-appt-create',
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
    GooglemapurlPipe,
    MatCheckboxModule,
    MemlookupComponent,
    PhoneMaskDirective,
    MatAutocompleteModule
  ],
  templateUrl: './trip-appt-create.component.html',
  styleUrls: ['./trip-appt-create.component.scss'],
})
export class TripApptCreateComponent implements OnInit, OnDestroy {
  Ready = true;
  Busy=false;
  isDialog = true;
  PTStaff = this.kalanisession.PTStaff;
  ptReasons = this.kalanisession.ptReasons;
  tripreasons = this.kalanisession.tripreasons;
  startAt = new Date();

  selectedDate: any;
  daysSelected: any[] = [];
  private destroy$ = new Subject();

  form!: FormGroup;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;

  constructor(
    @Optional() private dialogRef: MatDialogRef<TripApptCreateComponent>,
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
  onMemberChanged(value: any) {
    if (typeof value === 'object' && value !== null) {
      this.form.controls['phone'].patchValue(value?.phone);
      this.form.controls['pickAddress'].patchValue(value?.fullAddress);
    }
  }
  ngOnInit(): void {
    var rec: any = {};

    if (this.dialogRef === null) {
      this.isDialog = false;

    } else {
      var data = { ...this.dialogData.data };
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
        if (rec.apptTime !== '00:00') {
          rec.apptDuration = this.diff_minutes(data.start, data.end);
          rec.ridePickupTime = this.addMinutes(rec.apptTime, -30);
          rec.rideDropTime = this.addMinutes(rec.apptTime, 90);
        } else rec.apptTime = '';
      }
    }
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
      // rider_id: [rec?.rider_id, Validators.required],
      member: [rec?.member, Validators.required],

      roundTrip: [rec?.roundTrip, Validators.required],
      phone: [rec?.phone, [Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),Validators.required]],

      apptTime: [rec?.apptTime, Validators.required],

      ridePickupTime: [rec?.ridePickupTime, Validators.required],
      rideDropTime: [
        { value: rec?.rideDropTime, disabled: true },
        Validators.required,
      ],
      wheelChair: [0],
      reason: [''],
      passengers: [1, Validators.required],

      pickAddress: [rec?.pickAddress, Validators.required],
      dropAddress: [
        '7872 Walker Street, La Palma, CA 90623',
        Validators.required,
      ],

      apptDatesSelected: [rec?.apptDatesSelected, Validators.required],

      instructions: [''],
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
            this.addMinutes(value, 90)
          );
        });
    }

    const reserveRideControl = this.form.get('roundTrip');
    if (reserveRideControl) {
      reserveRideControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          if (value == '0') {
            this.form.get('rideDropTime')?.enable();
          } else {
            this.form.get('rideDropTime')?.disable();
          }
        });
    }
  }

  onSave() {
    this.submitButton?.nativeElement.click();
  }
  onSubmit() {
    let value = { ...this.form.value };
    value.rider_id = value.member.id;
    value.name = value.member.fullName;
    value.daysSelected = [...this.daysSelected];
    this.Busy=true;
    this.db.createRideAppt(value).subscribe({
      next: (json: any) => {
        this.setupForm({});
        this.Ready = false;
        this.Busy=false;
        setTimeout(() => {
          this.Ready = true;
        }, 50);
        this.notification.notify('Appointment Created');
        this.daysSelected = [];
        this.onClose();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
        this.Busy=false;
      },
    });
  }


  onSelectDate(event: any, calendar: any) {
    // if (event.getDay()==0 || event.getDay()==6) return;
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
      // if (date.getDay()==0 || date.getDay()==6) {
      //   return 'hide-date';}

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
  swapAddress(event: any) {
    event.preventDefault();
    let sfrom, sto;
    [sfrom, sto] = [
      this.form.value['dropAddress'],
      this.form.value['pickAddress'],
    ];
    this.form.controls['pickAddress'].patchValue(sfrom);
    this.form.controls['dropAddress'].patchValue(sto);
  }
  removeDate(i: number) {
    this.daysSelected.splice(i, 1);
    this.daysSelected.length > 0
      ? this.form.controls['apptDatesSelected'].patchValue('Y')
      : this.form.controls['apptDatesSelected'].patchValue(null);
  }
  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
