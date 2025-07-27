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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'projects/@session/src/lib/notification.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MemlookupComponent } from 'projects/@components/src/lib/memlookup/memlookup.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

@Component({
  selector: 'app-accu-massage-appt-edit',
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
  templateUrl: './accu-massage-appt-edit.component.html',
  styleUrls: ['./accu-massage-appt-edit.component.scss'],
})
export class AccuMassageApptEditComponent implements OnInit, OnDestroy {
  Ready = false;
  Busy = false;
  user = this.kalanisession.currentUser;
  isDialog = true;

  private destroy$ = new Subject();

  form!: FormGroup;
  @ViewChild('submitButton', { read: ElementRef }) submitButton?: ElementRef;

  daysSelected: string[] = [];
  startAt: Date = new Date();

  statusOptions = [
    { value: 0, label: 'Pending', icon: 'schedule' },
    { value: 10, label: 'Checked in', icon: 'how_to_reg' },
    { value: 20, label: 'Done', icon: 'done' },
    { value: 30, label: 'No Show', icon: 'voice_over_off' },
    { value: 90, label: 'Cancel', icon: 'cancel' }
  ];

  constructor(
    @Optional() private dialogRef: MatDialogRef<AccuMassageApptEditComponent>,
    private FormBuilder: FormBuilder,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public kalanisession: KalaniSessionService,
    private db: DbservicesService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    let rec: any = {};
    let data = { ...this.dialogData?.data };
    if (data?.id) {
      this.db.getAccuMassageAppt(data).subscribe({
        next: (json: any) => {
          if (!json) this.onClose();
          else {
            this.Ready = true;
            json.member = {
              id: json.memberId,
              fullName: json.MemberFullName,
              insurancetype: json.insurancetype || '',
            };
            json.insurance = json.insurancetype || '';
            this.setupForm(json);

            if (json.member?.insurancetype) {
              this.form.get('insurance')?.setValue(json.member.insurancetype);
            }
            if (json.coverage) {
              this.form.get('coverage')?.setValue(json.coverage);
            }
            if (json.daysSelected && Array.isArray(json.daysSelected)) {
              this.daysSelected = [...json.daysSelected];
            }
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
        rec.apptDate = data.start.toISOString().slice(0, 10);
        rec.apptTime = data.start.toTimeString().slice(0, 5);
        if (rec.apptTime !== '00:00') {
          rec.apptDuration = this.diff_minutes(data.start, data.end);
        } else rec.apptTime = '';
        rec.insurance = '';
        this.setupForm(rec);
      }
    }
  }

  setupForm(rec: any) {
    this.form = this.FormBuilder.group({
      id: rec?.id,
      blockTime: [rec?.blockTime],
      member: [rec?.member, Validators.required],
      daysOfWeek: rec?.daysOfWeek,
      status: [rec?.status ?? 0, Validators.required],
      apptDate: [rec?.apptDate, Validators.required],
      apptTime: [rec?.apptTime, Validators.required],
      apptDuration: [rec?.apptDuration, Validators.required],
      insurance: [rec?.insurance || ''],
      coverage: [rec?.coverage || ''],
      multiDays: [rec?.multiDays || ''],
    });

    this.form
      .get('member')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((member) => {
        this.form.get('insurance')?.setValue(member?.insurancetype || '');
      });

    const blockTimeControl = this.form.get('blockTime');
    if (blockTimeControl) {
      blockTimeControl
        .valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          this.form.get('member')?.[value ? 'disable' : 'enable']?.();
          this.form.get('status')?.[value ? 'disable' : 'enable']?.();
        });
    }
  }

  dateClass() {
    return (date: Date): string => {
      const dateStr = date.toISOString().slice(0, 10);
      return this.daysSelected.includes(dateStr) ? 'custom-selected-date' : '';
    };
  }

  onSelectDate(date: Date | null, calendar: any) {
    if (!date) return;
    const dateStr = date.toISOString().slice(0, 10);
    const idx = this.daysSelected.indexOf(dateStr);
    if (idx === -1) this.daysSelected.push(dateStr);
    else this.daysSelected.splice(idx, 1);

    this.form.get('multiDays')?.setValue(this.daysSelected.join(','));
    if (calendar?.updateTodaysDate) calendar.updateTodaysDate();
  }

  removeDate(i: number) {
    this.daysSelected.splice(i, 1);
    this.form.get('multiDays')?.setValue(this.daysSelected.join(','));
  }

  onMemberSelected(member: any) {
    this.form.get('insurance')?.setValue(member?.insurancetype || '');
  }

  onSave() {
    this.submitButton?.nativeElement.click();
  }

  diff_minutes(start: Date, end: Date) {
    let diff = (end.getTime() - start.getTime()) / 1000 / 60;
    return Math.abs(Math.round(diff > 1400 ? 30 : diff));
  }

  onSubmit() {
    this.form.get('status')?.enable();
    this.form.get('coverage')?.enable();

    let value = { ...this.form.value };
    if (!value.blockTime) {
      value.memberId = value.member.id;
    }
    value.daysSelected = this.daysSelected;

    this.Busy = true;

    this.db.saveAccuMassageAppt(value).subscribe({
      next: () => {
        this.notification.notify('Appointment updated!');
        this.onClose(); // Use the same onClose pattern as TripApptEditComponent

        // Optionally, run directsubmit in the background
        this.db.directsubmit({
          id: value.id,
          status: value.status,
          coverage: value.coverage,
        }).subscribe({
          next: () => console.log('directsubmit completed'),
          error: (err) => console.error('directsubmit error', err),
          complete: () => {
            this.Busy = false;
          },
        });
      },
      error: (err) => {
        this.Busy = false;
        this.kalanisession.showErrorMsg(err);
      },
    });
  }

  onClose() {
    this.dialogRef?.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  noDataEntry(event: any) {
    event.preventDefault();
  }
}