import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FullCalendarModule,
  FullCalendarComponent,
} from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventClickArg,
  DateSelectArg,
  ViewMountArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { MatIconModule } from '@angular/material/icon';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { SessionService } from 'projects/@session/src/public-api';
import { Subject, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatBadgeModule } from '@angular/material/badge';
import { ActivatedRoute } from '@angular/router';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { BarcodereaderService } from 'projects/@session/src/lib/barcodereader.service';
import { DialogConfirmComponent } from '../../dialog/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-member-checkin-dash',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FullCalendarModule,
    JimgcardComponent,
    MatButtonModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
    MatIconModule,
    MatBadgeModule,
  ],
  templateUrl: './member-checkin-dash.component.html',
  styleUrls: ['./member-checkin-dash.component.scss'],
})
export class MemberCheckinDashComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    public db: DbservicesService,
    public session: SessionService,
    public kalanisession: KalaniSessionService,
    private dialog: MatDialog,
    public changeDetectorRef: ChangeDetectorRef,
    public route: ActivatedRoute,
    private barcodeReader: BarcodereaderService
  ) {
    this.checkinType = this.route.snapshot.paramMap.get('type');
  }
  dataSource: any;
  private destroy$ = new Subject();
  intervalAmt = 3000;
  checkinType: string | null = 'K';
  Ready = false;
  Print = false;
  ptStatus = this.kalanisession.getlunchstatus;
  heading: any;
  isMenuOpen = false;
  BarCodeDL$: any;
  BarCodeMemberId$: any;
  lastCheckinMember: any = null;

  // For scan message
  scanMessage: string = '';
  scanSuccess: boolean = true;

  calendarOptions: CalendarOptions = {
    headerToolbar: false,
    eventOverlap: false,
    plugins: [
      timeGridPlugin,
      dayGridPlugin,
      multiMonthPlugin,
      interactionPlugin,
    ],
    initialView: 'dayGridWeek',
    selectable: true,
    selectMirror: true,
    navLinks: true,
    viewDidMount: this.handleViewDidMount.bind(this),
    weekends: false,
    events: this.getAppts.bind(this),
  };

  @ViewChild('calendar', { static: true })
  calendarComponent!: FullCalendarComponent;
  @ViewChild('menuTrigger') trigger: any;
  @ViewChild('hiddenMemberIdInput') hiddenMemberIdInput!: ElementRef<HTMLInputElement>;

  CALTOOLBARVIEW = [
    { name: 'Year', view: 'multiMonthYear' },
    { name: 'Month', view: 'dayGridMonth' },
    { name: 'Week', view: 'dayGridWeek' },
    { name: 'Day', view: 'dayGridDay' },
  ];

  ngOnInit(): void {
    this.session.sideNaveState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calendarComponent.getApi().updateSize();
      });

    // Listen for barcode scanner member ID
    this.BarCodeMemberId$ = this.barcodeReader.BarCodeDMemberId$.subscribe(
      (member: any) => {
        this.manualCheckIn(Number(member));
      }
    );
    // Listen for barcode scanner DL
    this.BarCodeDL$ = this.barcodeReader.BarCodeDL$.subscribe(
      (driverLicense: any) => {
        this.db
          .checkInMember({ DL: driverLicense.DL, type: this.checkinType })
          .subscribe({
            next: (json: any) => {
              this.lastCheckinMember = json;
            },
            error: (err) => {
              this.showScanMessage('❌ ' + (err?.error?.error || 'Check-in failed'), false);
            },
          });
      }
    );

    const interval$ = interval(this.intervalAmt);
    interval$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.isMenuOpen) return;
      let now = new Date();
      let activeEnd = this.calendarComponent.getApi().view.activeEnd;
      if (
        document.visibilityState === 'visible' &&
        activeEnd.getTime() > now.getTime()
      ) {
        this.calendarComponent.getApi().refetchEvents();
      }
    });
  }

  ngAfterViewInit() {
    // Focus the hidden input so barcode scanner types into it
    if (this.hiddenMemberIdInput) {
      this.hiddenMemberIdInput.nativeElement.focus();
    }
  }

  onBarcodeScanned(memberId: string) {
    if (memberId) {
      this.manualCheckIn(Number(memberId));
      this.hiddenMemberIdInput.nativeElement.value = '';
      // Refocus for next scan
      this.hiddenMemberIdInput.nativeElement.focus();
    }
  }

  manualCheckIn(memberId: number) {
    if (!memberId) return;
    this.db
      .directMemberCheckIn({ memberId, type: this.checkinType })
      .subscribe({
        next: (json: any) => {
          this.showScanMessage(`✅ Member ${json.memberId || memberId} checked in`, true);
        },
        error: (err) => {
          this.showScanMessage('❌ ' + (err?.error?.error || 'Check-in failed'), false);
        },
      });
  }

  showScanMessage(msg: string, success: boolean) {
    this.scanMessage = msg;
    this.scanSuccess = success;
    setTimeout(() => {
      this.scanMessage = '';
    }, 2000);
  }

  getAppts(info: any, successCallback: any, failureCallback: any) {
    info.type = this.checkinType;
    this.db.getAllcheckInMembers(info).subscribe({
      next: (json: any) => {
        this.dataSource = json;
        this.Ready = true;
        this.changeDetectorRef.markForCheck();
        successCallback(json);
      },
      error: (err: any) => {
        this.Ready = true;
        failureCallback(err);
      },
    });
  }

  handleViewDidMount(info: ViewMountArg) {
    setTimeout(() => {
      this.heading = this.calendarComponent.getApi().view;
      this.changeDetectorRef.markForCheck();
    }, 1);
  }
  handleEventClick(clickInfo: EventClickArg) {}

  onDelete(id: number) {
    this.isMenuOpen = false;
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { title: 'Confirm to Delete...' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.db.deleteCheckInMember({ id: id }).subscribe({
          next: () => {
            this.calendarComponent.getApi().refetchEvents();
          },
          error: (err: any) => {
            this.session.showErrorMsg(err);
          },
        });
      }
    });
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    selectInfo.view.calendar.unselect();
    // ...existing code for date select...
  }
  changeView(view: string) {
    this.calendarComponent.getApi().changeView(view);
    this.calendarComponent.getApi().refetchEvents();
  }

  updateStatus(data: any) {
    this.db.saveLunchAppt(data).subscribe({
      next: () => {
        this.calendarComponent.getApi().refetchEvents();
      },
      error: (err) => {
        this.session.showErrorMsg(err);
      },
    });
  }
  getEventinfo(arg: any) {
    return {
      data: {
        isFuture: arg.isFuture,
        isToday: arg.isToday,
        isPast: arg.isPast,
        name: arg.event.title,
        timeText: arg.timeText,
        memberId: arg.event.extendedProps.memberId,
        id: arg.event.extendedProps.apptsID,
      },
    };
  }
  menuOpened(state: any) {
    this.isMenuOpen = state;
  }
  stopPropogation(e: any) {
    e.stopPropagation();
  }
  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
    this.BarCodeMemberId$.unsubscribe();
    this.BarCodeDL$.unsubscribe();
  }
}