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
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'projects/@session/src/lib/notification.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MemlookupComponent } from 'projects/@components/src/lib/memlookup/memlookup.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
@Component({
  selector: 'app-accu-massage-appt-edit',
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
  ],
  templateUrl: './accu-massage-appt-edit.component.html',
  styleUrls: ['./accu-massage-appt-edit.component.scss'],
})
export class AccuMassageApptEditComponent implements OnInit, OnDestroy {
  Ready = false;
  Busy = false;
  ptStatus = this.kalanisession.getptStatus;
  user = this.kalanisession.currentUser;
  isDialog = true;

  private destroy$ = new Subject();

  form!: FormGroup;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;

  constructor(
    @Optional() private dialogRef: MatDialogRef<AccuMassageApptEditComponent>,
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
    if (data?.id) {
      this.db.getAccuMassageAppt(data).subscribe({
        next: (json: any) => {
          // this.form.controls['id'].patchValue(json.id);
          if (!json) this.onClose();
          else {
            this.Ready = true;
            json.member = { id: json.memberId, fullName: json.MemberFullName };
            this.setupForm(json);
          }
        },
        error: (err: any) => {
          this.kalanisession.showErrorMsg(err);
          this.onClose();
        },
      });
    } else {
      if (data?.start instanceof Date) {
        rec.status = 0;
        this.Ready = true;
        rec.id = 0;
        rec.daysOfWeek = data.start.getDay();
        rec.apptDate =
          data.start.getFullYear() +
          '-' +
          ('00' + (data.start.getMonth() + 1)).slice(-2) +
          '-' +
          ('00' + data.start.getDate()).slice(-2);
        rec.apptTime =
          String(data.start.getHours()).padStart(2, '0') +
          ':' +
          String(data.start.getMinutes()).padStart(2, '0');
        if (rec.apptTime !== '00:00') {
          rec.apptDuration = this.diff_minutes(data.start, data.end);
        } else rec.apptTime = '';

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
    this.form = this.FormBuilder.group({
      id: rec?.id,
      blockTime: [rec?.blockTime],
      member: [rec?.member, Validators.required],
      daysOfWeek: rec?.daysOfWeek,
      status: [rec?.status, Validators.required],
      apptDate: [rec?.apptDate, Validators.required],
      apptTime: [rec?.apptTime, Validators.required],
      apptDuration: [rec?.apptDuration, Validators.required],
    });

    const blockTimeControl = this.form.get('blockTime');
    if (blockTimeControl) {
      blockTimeControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          if (value === true) {
            this.form.get('member')?.disable();
            this.form.get('status')?.disable();
          } else {
            this.form.get('member')?.enable();
            this.form.get('status')?.enable();
          }
        });
    }
  }

  onSave() {
    this.submitButton?.nativeElement.click();
  }
  onSubmit() {
    let value = { ...this.form.value };
    if (!value.blockTime) {
      value.memberId = value.member.id;
    }

    this.Busy = true;
    this.db.saveAccuMassageAppt(value).subscribe({
      next: (json: any) => {
        // this.form.controls['id'].patchValue(json.id);
        this.notification.notify('Appointment updated');
        this.Busy = false;
        this.onClose();
      },
      error: (err: any) => {
        this.Busy = false;
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
