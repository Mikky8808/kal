import {
  Component,
  ChangeDetectorRef,
  ViewChild,
  OnInit,
  ElementRef,
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
import { Trip } from 'projects/@models/src/lib/models';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PtApptEditComponent } from '../../../healthspring/pt-appt-edit/pt-appt-edit.component';
import { PtAppointmentComponent } from '../../../healthspring/pt-appointment/pt-appointment.component';
import { ViewTripComponent } from '../view-trip/view-trip.component';
import { TripApptCreateComponent } from '../trip-appt-create/trip-appt-create.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

 
@Component({
  selector: 'app-tripdash',
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    MatIconModule,
    JimgcardComponent,
    MatButtonModule,
    MatButtonToggleModule,
    MatMenuModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
  ],  templateUrl: './tripdash.component.html',
  styleUrls: ['./tripdash.component.scss']
})
export class TripdashComponent implements OnInit, OnDestroy {
  constructor(
    public db: DbservicesService,
    public session: SessionService,
    public kalanisession: KalaniSessionService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private destroy$ = new Subject();
  ptStatus = this.kalanisession.getptStatus;
  heading: any;
  trip!: Trip;
  calendarOptions: CalendarOptions = {
    headerToolbar: false,
    // headerToolbar: {
    //   left: '',
    //   center: 'title',
    //   right:
    //     'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,prev,next today',
    // },
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotDuration: '00:15:00',
    slotMaxTime: '18:00:00',
    //editable: true,

    //  eventDurationEditable:true,
    plugins: [
      timeGridPlugin,
      dayGridPlugin,

      multiMonthPlugin,
      interactionPlugin,
    ],
    // initialView: 'timeGridDay',
    // initialView: 'timeGridWeek',
    initialView: 'timeGridWeek',

    // initialView: 'multiMonthYear',

    selectable: true,
    selectMirror: true,
    navLinks: true,

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
      view: 'timeGridWeek',
    },
    {
      name: 'Day',
      // nav: this.calendarComponent.getApi().changeView('timeGridDay')
      view: 'timeGridDay',
    },
  ];
  ngOnInit(): void {
    //     const interval$ = interval(3000);
    //     interval$
    //     .pipe(takeUntil(this.destroy$))
    //     .subscribe((value) => {
    //  this.calendarComponent.getApi().refetchEvents();

    //     });

    this.session.sideNaveState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.calendarComponent.getApi().updateSize();
      });
  }
  getAppts(info: any, successCallback: any, failureCallback: any) {
    this.db.getAllRidesCal(info).subscribe({
      next: (json: any) => {
        successCallback(json);
        //this.calendarComponent.getApi().addEventSource
        //this.calendarComponent.getApi().render()
      },
      error: (err: any) => {
        failureCallback(err);
      },
    });
  }

  diff_minutes(dt2: Date, dt1: Date) {
    var diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
  }
  handleViewDidMount(info: ViewMountArg) {
    setTimeout(() => {
      this.heading = this.calendarComponent.getApi().view;
      this.changeDetectorRef.markForCheck();

    }, 1);
  }
  handleEventClick(clickInfo: EventClickArg) {}

  editAppt(data: any) {
     const dialogRef = this.dialog.open(ViewTripComponent, {
      disableClose: true,

      width: '800px',
      // height: '100%',
      data: { ...data },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.calendarComponent.getApi().refetchEvents();
    });
  }
  handleDateSelect(selectInfo: DateSelectArg) {
    const data = {
      start: selectInfo.start,
      end: selectInfo.end,
    };
    const calendarApi = selectInfo.view.calendar;
    const dialogRef = this.dialog.open(TripApptCreateComponent, {
      disableClose: true,
      // maxWidth: '100vw',
      // maxHeight: '100vh',
      width: '100%',
      height: '100%',
      data: { data },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.calendarComponent.getApi().refetchEvents();
    }); // calendarApi.unselect(); // clear date selection
  }
  changeView(view: string) {
    this.calendarComponent.getApi().changeView(view);
    this.calendarComponent.getApi().refetchEvents();
  }

  updateStatus(data: any) {
    this.db.updatePTApptStatus(data).subscribe({
      next: (json: any) => {
        this.calendarComponent.getApi().refetchEvents();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }
  getEventinfo(arg: any) {
     return {
      data: {
        isFuture:  arg.isFuture,
  
        name: arg.event.title,
        timeText: arg.timeText,
        status: arg.event.extendedProps.status,
        statusIcon: arg.event.extendedProps.Icon,
        id: arg.event.extendedProps.tripsId,
      },
    };
  }
  menuOpened(state: any) {
  }
  stopPropogation(e: any) {
    e.stopPropagation();
  }
  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
