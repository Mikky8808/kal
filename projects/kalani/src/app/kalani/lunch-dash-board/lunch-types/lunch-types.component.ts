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
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

@Component({
  selector: 'app-lunch-types',
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
  templateUrl: './lunch-types.component.html',
  styleUrls: ['./lunch-types.component.scss'],
})
export class LunchTypesComponent implements OnInit, OnDestroy {
  Ready = true;
  isDialog = true;
  PTStaff = this.kalanisession.PTStaff;
  ptReasons = this.kalanisession.ptReasons;

  selectedDate: any;
  daysSelected: any[] = [];
  private destroy$ = new Subject();

  form!: FormGroup;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;

  constructor(
    @Optional() private dialogRef: MatDialogRef<LunchTypesComponent>,
    private FormBuilder: FormBuilder,

    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public kalanisession: KalaniSessionService,

    private db: DbservicesService,
    private dialog: MatDialog,
    // private _snackBar: MatSnackBar,
    private notification: NotificationService
  ) {}


  onMemberChanged(value: any) {
 
  }
  ngOnInit(): void {
    var rec: any = {};

    if (this.dialogRef === null) {
      this.isDialog = false;
      // String(date.getHours()).padStart(2, '0') +
      // ':' +
      // String(date.getMinutes()).padStart(2, '0')
    } else {
      var data = { ...this.dialogData.data };
      if (data?.start instanceof Date) {
        this.daysSelected = [
          data.start.getFullYear() +
            '-' +
            ('00' + (data.start.getMonth() + 1)).slice(-2) +
            '-' +
            ('00' + data.start.getDate()).slice(-2),
        ];
        rec.apptDatesSelected = 'Y';

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
      desc: [rec?.desc, Validators.required],
      apptDatesSelected: [rec?.apptDatesSelected, Validators.required],


    });


  }

  onSave() {
    this.submitButton?.nativeElement.click();
  }
  onSubmit() {
    let value = { ...this.form.value };
    value.daysSelected = [...this.daysSelected];
    this.db.createLunchTypes(value).subscribe({
      next: (json: any) => {
        this.setupForm({});
        this.Ready = false;
        setTimeout(() => {
          this.Ready = true;
        }, 50);
        this.notification.notify(`Lunch Types Created`);
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
    if (event.getDay()<2 || event.getDay()>4) {
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
      event.getFullYear() +
      '-' +
      ('00' + (event.getMonth() + 1)).slice(-2) +
      '-' +
      ('00' + event.getDate()).slice(-2);
    return this.daysSelected.find((x) => x == date) ? 'selected' : '';
  };

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses => {
      if (date.getDay()<2 || date.getDay()>4) {
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
