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
  selector: 'app-trip-appt-edit',
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
    GooglemapurlPipe,
    MatCheckboxModule,
    MemlookupComponent,
    PhoneMaskDirective,
    MatAutocompleteModule
  ],
  templateUrl: './trip-appt-edit.component.html',
  styleUrls: ['./trip-appt-edit.component.scss'],
})
export class TripApptEditComponent implements OnInit, OnDestroy {
  Ready = false;
  isDialog = true;
  member : any;
  rideStatus = this.kalanisession.getRideStatus;
  tripreasons = this.kalanisession.tripreasons;
  private destroy$ = new Subject();

  form!: FormGroup;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;

  constructor(
    @Optional() private dialogRef: MatDialogRef<TripApptEditComponent>,
    private FormBuilder: FormBuilder,

    @Inject(MAT_DIALOG_DATA) public dialogData: any,
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

    this.db.getTrip({ id: this.dialogData.id }).subscribe({
      next: (json: any) => {
        // this.form.controls['id'].patchValue(json.id);
        if (!json) {
          this.notification.notify('Ride not found...');

          this.onClose()
        } else

        {
          this.member = { id: json.rider_id, fullName: json.name.replace(/\s\s+/g, ' ').trim() };
          this.Ready = true;
           this.setupForm(json);
  
          this.subscribeValueChanges();
        }
       
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
        this.onClose()

      },
    });
  }
  subscribeValueChanges() {
    const apptTimeControl = this.form.get('apptTime');

    if (apptTimeControl) {
      apptTimeControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.form.controls['pickupTime'].patchValue(
            this.addMinutes(value, -30)
          );
        });
    }
  }
  onMemberChanged(value: any) {

    if (typeof value === 'object' && value !== null && value !== undefined) {
      if (value?.phone) this.form.controls['phone'].patchValue(value?.phone);
      if (value?.fullAddress) this.form.controls['pickAddress'].patchValue(value?.fullAddress);
    }
  }
  onClose() {
    {
      this.dialogRef?.close();
    }
  }

  setupForm(rec: any) {
    this.Ready = true;

// If status is 5 (Cancel), show 'Cancelled' in the dropdown
  let statusValue = rec?.seStatus;
  let statusText = statusValue == 5 ? 'Cancelled' : this.rideStatus[statusValue]?.statusText || '';

    this.form = this.FormBuilder.group({
      id:  [rec?.id, Validators.required],
      // member: [rec?.member, Validators.required],
      seStatus: [rec?.seStatus, Validators.required],
      phone: [rec?.phone, [Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/),Validators.required]],
      pickupDate: [rec?.pickupDate, Validators.required],

      apptTime: [rec?.apptTime, Validators.required],

      pickupTime: [rec?.pickupTime, Validators.required],

      wheelChair: [rec?.wheelChair],
      reason: [rec?.reason],
      passengers: [1, Validators.required],

      pickAddress: [rec?.pickAddress, Validators.required],
      dropAddress: [rec?.dropAddress, Validators.required],

      instructions: [rec?.instructions],
    });
  }

getStatusIcon(statusValue: number): string {
  const status = this.rideStatus.find((s: any) => s.Status === statusValue);
  return status ? status.icon : '';
}

getStatusText(statusValue: number): string {
  const status = this.rideStatus.find((s: any) => s.Status === statusValue);
  return status ? status.StatusText : '';
}

  onSave() {
    this.submitButton?.nativeElement.click();
  }

  onDeleteRide() {
    const data = { id: this.form.value.id, action: 'delete' };
    this.db.deletingrides(data).subscribe({
      next: (res: any) => {
        this.notification.notify('Ride deleted!');
        this.onClose();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
      }
    });
  }
  onSubmit() {
    let value = { ...this.form.value };
    const pickupDate = value.pickupDate;
    value.apptDate = pickupDate + ' ' + value.apptTime;

    value.pickupDate = pickupDate + ' ' + value.pickupTime;
    // value.rider_id = value.member.id;
    // value.name = value.member.fullName;

    this.db.updateRideAppt(value).subscribe({
      next: (json: any) => {
        this.notification.notify('Appointment updated!');

        this.onClose();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
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

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
