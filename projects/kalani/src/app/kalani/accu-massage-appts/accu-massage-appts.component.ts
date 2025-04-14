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
import { Trip } from 'projects/@models/src/lib/models';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AccuMassageApptEditComponent } from './accu-massage-appt-edit/accu-massage-appt-edit.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { DialogConfirmComponent } from '../../dialog/dialog-confirm/dialog-confirm.component';

@Component({
  selector: 'app-accu-massage-appts',
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
  ],
  templateUrl: './accu-massage-appts.component.html',
  styleUrls: ['./accu-massage-appts.component.scss'],
})
export class AccuMassageApptsComponent implements OnInit, OnDestroy {
  constructor(
    public db: DbservicesService,
    public session: SessionService,
    public kalanisession: KalaniSessionService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  private destroy$ = new Subject();
  ptStatus = this.kalanisession.getptStatus;
  user = this.kalanisession.currentUser;
  heading: any;
  isMenuOpen = false;

  calendarOptions: CalendarOptions = {
    headerToolbar: false,
    // headerToolbar: {
    //   left: '',
    //   center: 'title',
    //   right:
    //     'multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,prev,next today',
    // },
    allDaySlot: false,
    slotMinTime: '08:30:00',
    slotDuration: '00:10:00',
    slotMaxTime: '18:00:00',
    // editable: true,

    //  eventDurationEditable:true,
    plugins: [
      timeGridPlugin,
      dayGridPlugin,

      multiMonthPlugin,
      interactionPlugin,
    ],
    // initialView: 'timeGridDay',
    initialView: this.user.isLa_Lmt ? 'timeGridDay' : 'timeGridWeek',
    // initialView: 'multiMonthYear',
    hiddenDays: [2, 5],
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
    const interval$ = interval(3000);
    interval$.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      if (this.isMenuOpen) return;
      let now = new Date();
      let activeEnd = this.calendarComponent.getApi().view.activeEnd;
      let activeStart = this.calendarComponent.getApi().view.activeStart;

      if (
        activeEnd.getTime() > now.getTime() &&
        activeStart.getTime() <= now.getTime()
      ) {
        this.calendarComponent.getApi().refetchEvents();
      }
    });

    this.session.sideNaveState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.calendarComponent.getApi().updateSize();
      });
  }
  getAppts(info: any, successCallback: any, failureCallback: any) {
    this.db.getAllAccuMassageAppt(info).subscribe({
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

  handleEventClick(clickInfo: EventClickArg) {
    const data = { ...clickInfo.event.extendedProps };

    if (!this.user.isAdmin || !data['blocked']) {
      return;
    }
    const startTime = clickInfo.event.startStr.substring(11, 16);
    const endTime = clickInfo.event.endStr.substring(11, 16);


    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      // disableClose: true,
      // maxHeight: '600px',
      // width: '300px',
      // height: '100%',
      data: {
        title: `Confirm to Delete ${clickInfo.event.title} ${startTime} - ${endTime} `,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.db.DeleteAccuMassageAppt(data).subscribe({
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
  onDeleteBlocked (data:any){

    if (!this.user.isAdmin || !data['blocked']) {
      return;
    }

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      // disableClose: true,
      // maxHeight: '600px',
      // width: '300px',
      // height: '100%',
      data: {
        title: `Confirm to Delete ${data.name} ${data.timeText} `,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.db.DeleteAccuMassageAppt(data).subscribe({
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

  editAppt(data: any) {
    const dialogRef = this.dialog.open(AccuMassageApptEditComponent, {
      disableClose: true,
      maxWidth: '800px',
      // maxHeight: '600px',
      width: '100%',
      // height: '100%',
      data: { data },
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
    selectInfo.view.calendar.unselect();
    
      const calendarApi = selectInfo.view.calendar;
      const dialogRef = this.dialog.open(AccuMassageApptEditComponent, {
        disableClose: true,
        maxWidth: '800px',
        // maxHeight: '600px',
        width: '100%',
        // height: '100%',  
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

  delteAppt(id: number) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      // disableClose: true,
      // maxHeight: '600px',
      // width: '300px',
      // height: '100%',
      data: { title: 'Confirm to Delete...' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.db.DeleteAccuMassageAppt({ id: id }).subscribe({
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
  
  
  updateStatus(data: any) {
    this.db.saveAccuMassageAppt(data).subscribe({
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
        ...arg.event.extendedProps,
      
        id: arg.event.extendedProps.apptsID,
       
      },
    };
  }
  menuOpened(state: any) {}
  stopPropogation(e: any) {
    e.stopPropagation();
  }
  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
