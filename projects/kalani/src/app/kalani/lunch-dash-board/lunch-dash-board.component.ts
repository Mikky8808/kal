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
import { LunchEditApptComponent } from './lunch-edit-appt/lunch-edit-appt.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LunchPrintComponent } from './lunch-print/lunch-print.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { getTime } from 'date-fns';
import { LunchTypesComponent } from './lunch-types/lunch-types.component';
import { DialogConfirmComponent } from '../../dialog/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-lunch-dash-board',
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
    MatTooltipModule,
    LunchPrintComponent,
  ],
  templateUrl: './lunch-dash-board.component.html',
  styleUrls: ['./lunch-dash-board.component.scss'],
})
export class LunchDashBoardComponent implements OnInit, OnDestroy {
  constructor(
    public db: DbservicesService,
    public session: SessionService,
    public kalanisession: KalaniSessionService,
    private dialog: MatDialog,
    public changeDetectorRef: ChangeDetectorRef
  ) {}
  isMobile = /Mobile/i.test(navigator.userAgent);

  dataSource: any;
  private destroy$ = new Subject();
  isMenuOpen = false;
  intervalAmt = 30000;
  Ready = false;
  Print = false;
  ptStatus = this.kalanisession.getlunchstatus;
  heading: any;
  calendarOptions: CalendarOptions = {
    headerToolbar: false,
    eventOverlap: false,
    slotMinTime: '00:00:00',
    slotDuration: '00:10:00',
    slotMaxTime: '00:00:00',
    // editable: true,
    //  eventDurationEditable:true,
    plugins: [
      timeGridPlugin,
      dayGridPlugin,

      multiMonthPlugin,
      interactionPlugin,
    ],
    // initialView: 'timeGridDay',
    // initialView: 'timeGridWeek',
    initialView: 'dayGridWeek',
    // initialView: 'multiMonthYear',
    hiddenDays: [1, 5],
    selectable: true,
    selectMirror: true,
    navLinks: true,
    navLinkDayClick: this.handleNavLinkDayClick.bind(this),

    viewDidMount: this.handleViewDidMount.bind(this),

    weekends: false,
    // eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this),

    events: this.getAppts.bind(this),
  };
  @ViewChild('calendar', { static: true })
  calendarComponent!: FullCalendarComponent;
  // @ViewChild('menuTrigger') trigger: any;

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

    const interval$ = interval(this.intervalAmt);
    interval$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (this.isMenuOpen) return;

      if (document.visibilityState === 'visible') {
        let now = new Date();
        let activeEnd = this.calendarComponent.getApi().view.activeEnd;
        let activeStart = this.calendarComponent.getApi().view.activeStart;

        if (
          activeEnd.getTime() > now.getTime() &&
          activeStart.getTime() <= now.getTime()
        ) {
          this.calendarComponent.getApi().refetchEvents();
        }
      }
    });
  }
  getAppts(info: any, successCallback: any, failureCallback: any) {
    this.db.getAllLunchAppt(info).subscribe({
      next: (json: any) => {
        this.dataSource = json;
        this.Ready = true;

        successCallback(json);
      },
      error: (err: any) => {
        this.Ready = true;

        failureCallback(err);
      },
    });
  }
  handleNavLinkDayClick(date: any, jsEvent: any) {
    this.calendarComponent.getApi().gotoDate(date);
    this.changeView('dayGridDay');
    this.changeDetectorRef.markForCheck();
  }

  handleViewDidMount(info: ViewMountArg) {
    setTimeout(() => {
      this.heading = this.calendarComponent.getApi().view;
      this.changeDetectorRef.markForCheck();
    }, 1);
  }

  onDelete(id: number) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { title: 'Confirm to Delete...' },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.db.deleteLunchAppt({ id: id }).subscribe({
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

  onLunchMenuType() {
    const dialogRef = this.dialog.open(LunchTypesComponent, {
      disableClose: true,
      maxWidth: '800px',
      maxHeight: '600px',
      width: '100%',
      height: '100%',
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.calendarComponent.getApi().refetchEvents();
    });
  }

  openLunchDialog(data: any) {
    const dialogRef = this.dialog.open(LunchEditApptComponent, {
      disableClose: true,
      maxWidth: this.isMobile ? '100vw' : '800px',
      maxHeight: this.isMobile ? '100vh' : '600px',

      width: this.isMobile ? '100vw' : 'auto',
      height: this.isMobile ? '100vh' : 'auto',
      data: { ...data },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.calendarComponent.getApi().refetchEvents();
    }); // calendarApi.unselect(); // clear date selection
  }

  handleEventClick(clickInfo: EventClickArg) {
    if (clickInfo.event.extendedProps['status'] == 99) {
      const data = {
        start: clickInfo.event.start,
        end: clickInfo.event.end,
      };
      this.openLunchDialog(data);
    }
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const data = {
      start: selectInfo.start,
      end: selectInfo.end,
    };
    selectInfo.view.calendar.unselect();
    if (selectInfo.view.type != 'timeGridDay') {
      this.openLunchDialog(data);
    }
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
        status: arg.event.extendedProps.status,
        statusIcon: arg.event.extendedProps.statusIcon,
        id: arg.event.extendedProps.apptsID,
        memberId: arg.event.extendedProps.memberId,
        lunchData: { ...arg.event.extendedProps },
      },
    };
  }

  stopPropogation(e: any) {
    e.stopPropagation();
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
