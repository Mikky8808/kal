import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  OnInit,
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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { interval } from 'rxjs';
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
export class MemberCheckinDashComponent implements OnInit, OnDestroy {
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
  calendarOptions: CalendarOptions = {
    headerToolbar: false,
    eventOverlap: false,
    // slotMinTime: '00:00:00',
    // slotDuration: '00:10:00',
    // slotMaxTime: '00:00:00',
    // editable: true,

    //  eventDurationEditable:true,
    plugins: [
      timeGridPlugin,
      dayGridPlugin,
      multiMonthPlugin,
      interactionPlugin,
    ],
    // initialView: 'timeGridDay',
    initialView: 'dayGridWeek',

    // initialView: 'multiMonthYear',
    // hiddenDays: [1, 5],
    selectable: true,
    selectMirror: true,
    navLinks: true,
    // resources: [
    //   { id: 'H', title: 'Health Spring' },
    //   { id: 'K', title: 'Kalani' },
    // ],
    viewDidMount: this.handleViewDidMount.bind(this),

    weekends: false,
    // eventClick: this.handleEventClick.bind(this),
    // select: this.handleDateSelect.bind(this),

    events: this.getAppts.bind(this),
  };
  @ViewChild('calendar', { static: true })
  calendarComponent!: FullCalendarComponent;
  @ViewChild('menuTrigger') trigger: any;

  CALTOOLBARVIEW = [
    {
      name: 'Year',
      // nav: this.calendarComponent.getApi().changeView('')
      view: 'multiMonthYear',
    },

    {
      name: 'Month',
      // nav: this.calendarComponent.getApi().changeView('')
      view: 'dayGridMonth',
    },
    {
      name: 'Week',
      // nav: this.calendarComponent.getApi().changeView('')
      view: 'dayGridWeek',
    },
    {
      name: 'Day',
      // nav: this.calendarComponent.getApi().changeView('timeGridDay')
      view: 'dayGridDay',
    },
  ];
  ngOnInit(): void {
    this.session.sideNaveState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.calendarComponent.getApi().updateSize();
      });

    this.BarCodeMemberId$ = this.barcodeReader.BarCodeDMemberId$.subscribe(
      (member: any) => {
        this.db
          .checkInMember({ memberId: member, type: this.checkinType })
          .subscribe({
            next: (json: any) => {
              if (json) {
                this.lastCheckinMember = json;
                setTimeout(() => {
                  this.lastCheckinMember = null;
                }, 4000);
              }
            },
            error: (err) => {
              this.kalanisession.showErrorMsg(err);
            },
          });
      }
    );
    this.BarCodeDL$ = this.barcodeReader.BarCodeDL$.subscribe(
      (driverLicense: any) => {
        this.db
          .checkInMember({ DL: driverLicense.DL, type: this.checkinType })
          .subscribe({
            next: (json: any) => {
              if (json) {
                this.lastCheckinMember = json;
              }
            },
            error: (err) => {
              this.kalanisession.showErrorMsg(err);
            },
          });
      }
    );

    const interval$ = interval(this.intervalAmt);
    interval$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
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
  getAppts(info: any, successCallback: any, failureCallback: any) {
    info.type = this.checkinType;
    this.db.getAllcheckInMembers(info).subscribe({
      next: (json: any) => {
        this.dataSource = json;
        this.Ready = true;
        this.changeDetectorRef.markForCheck();
        console.log(json);

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
          next: (json: any) => {
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
    const data = {
      start: selectInfo.start,
      end: selectInfo.end,
    };
    selectInfo.view.calendar.unselect();
    // if (selectInfo.view.type != 'timeGridDay') {
    //   const calendarApi = selectInfo.view.calendar;
    //   const dialogRef = this.dialog.open(LunchEditApptComponent, {
    //     disableClose: true,
    //     maxWidth: '800px',
    //     maxHeight: '600px',
    //     width: '100%',
    //     height: '100%',
    //     data: { data },
    //   });
    //   dialogRef.afterClosed().subscribe((result) => {
    //     this.calendarComponent.getApi().refetchEvents();
    //   }); // calendarApi.unselect(); // clear date selection
    // }
  }
  changeView(view: string) {
    this.calendarComponent.getApi().changeView(view);
    this.calendarComponent.getApi().refetchEvents();
  }

  updateStatus(data: any) {
    this.db.saveLunchAppt(data).subscribe({
      next: (json: any) => {
        this.calendarComponent.getApi().refetchEvents();
      },
      error: (err: any) => {
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
