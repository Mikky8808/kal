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
  MatCalendar,
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
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-lunch-edit-appt',
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
  ],
  templateUrl: './lunch-edit-appt.component.html',
  styleUrls: ['./lunch-edit-appt.component.scss'],
})
export class LunchEditApptComponent implements OnInit, OnDestroy {
  Ready = false;
  isDialog = true;
  lunchstatus = this.kalanisession.getlunchstatus;
  AddMode = false;
  selectedDate: any;
  daysSelected: any[] = [];
  heading = 'Lunch Reservation';
  startAt = new Date();
  private destroy$ = new Subject();

  form!: FormGroup;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;
  @ViewChild('calendar', { static: false }) public calendar!: MatCalendar<Date>;

  constructor(
    @Optional() private dialogRef: MatDialogRef<LunchEditApptComponent>,
    private FormBuilder: FormBuilder,

    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public kalanisession: KalaniSessionService,

    private db: DbservicesService,
    private dialog: MatDialog,
    // private _snackBar: MatSnackBar,
    private notification: NotificationService
  ) {}

  onMemberChanged(value: any) {}
  ngAfterViewInit() {
  }
  ngOnInit(): void {
    var rec: any = {};

    this.AddMode = this.dialogData?.id > 0 ? false : true;

    if (this.dialogData?.id > 0) {
      this.db.getLunch({id: this.dialogData?.id}).subscribe({
        next: (json: any) => {
          if (!json) this.onClose()
          else {
          json.apptDatesSelected = 'Y';
          json.member = {memberid: json.memberId,fullName : json.fullName}

          this.setupForm(json);
        }
        },
        error: (err: any) => {
          this.kalanisession.showErrorMsg(err);
          this.onClose();
        },
      });

    } else {
   
        var data = { ...this.dialogData };

        if (data?.start instanceof Date) {
          this.startAt = data.start;

          this.daysSelected = [
            format(data.start,'yyyy-MM-dd'),
          ];
          rec.apptDatesSelected = 'Y';
          this.setupForm(rec);
       
        

        }
      
    }

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
      id: [rec?.id ? rec.id : 0],
      member: [rec?.member, Validators.required],
      apptDatesSelected: [rec?.apptDatesSelected, Validators.required],
      date: [
        { value: rec?.date, disabled: this.AddMode ? true : false },
        Validators.required,
      ],

      status: [
        { value: rec?.status, disabled: this.AddMode ? true : false },
        Validators.required,
      ],
      guests: [rec?.guests ? rec.guests : 0],
      guestNames: [rec?.guestNames ? rec.guestNames : ''],
    });
  
  }

  onSave() {
    this.submitButton?.nativeElement.click();
  }
  onSubmit() {
    let value = { ...this.form.value };
    value.daysSelected = [...this.daysSelected];
    value.memberId = value.member.id;
    this.db.createLunchAppt(value).subscribe({
      next: (json: any) => {

        this.notification.notify(
          `Lunch Resrvations Created for member: ${value?.member.fullName}`
        );
        this.daysSelected = [];
        this.onClose();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }

  onSelectDate(event: any, calendar: any) {
    // if (event.getDay()==0 || event.getDay()==6) return;
    this.selectedDate = event;
    if (event.getDay() < 2 || event.getDay() > 4) {
      return;
    }
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
    format(event,'yyyy-MM-dd');
  
    return this.daysSelected.find((x) => x == date) ? 'selected' : '';
  };

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      if (date.getDay() < 2 || date.getDay() > 4) {
        return 'hide-date';
      }

      const seldate =
      format(date,'yyyy-MM-dd');
     

      return this.daysSelected.find((x) => x == seldate) ? 'special-date' : '';
    };
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
