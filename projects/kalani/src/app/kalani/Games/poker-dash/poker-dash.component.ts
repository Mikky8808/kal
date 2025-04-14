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
import resourceDayGridPlugin from '@fullcalendar/resource-daygrid';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';

import scrollgridPlugin from '@fullcalendar/scrollgrid';

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
import { MatTooltipModule } from '@angular/material/tooltip';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';


@Component({
  selector: 'app-poker-dash',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    MatTooltipModule,
  ],
  templateUrl: './poker-dash.component.html',
  styleUrls: ['./poker-dash.component.scss']
})
export class PokerDashComponent implements OnInit, OnDestroy {
  constructor(
    public db: DbservicesService,
    public session: SessionService,
    public kalanisession: KalaniSessionService,

    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) {

  }
  isMobile = /Mobile/i.test(navigator.userAgent);
  private destroy$ = new Subject();
  ptStatus = this.kalanisession.getptStatus;
  PTStaff = this.kalanisession.PTStaff;
  currentStaff: string = 'All';
  heading: any;
  trip!: Trip;
  Print = false;
  printMember = 0;

  isMenuOpen = false;
  calendarOptions: CalendarOptions = {
    schedulerLicenseKey: '0198815652-fcs-1679503202',

    headerToolbar: false,
    eventOverlap: false,
    // dayMinWidth: 75,

    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotDuration: '00:15:00',
    slotMaxTime: '18:00:00',
    // editable: true,

    //  eventDurationEditable:true,
    plugins: [
      resourceTimeGridPlugin,

      timeGridPlugin,
      dayGridPlugin,
      resourceDayGridPlugin,
      multiMonthPlugin,
      interactionPlugin,
      scrollgridPlugin,
    ],
    
    initialView:   'resourceDayGridWeek',
    slotEventOverlap: false,
    eventMinWidth: 200,
    hiddenDays: [1,2, 4],
    resources: [
      { id: 'Jenny', title: 'Game 1' },
      { id: 'Rita', title: 'Game 2' },
      { id: 'Willy', title: 'Game 3' },
    ],
    selectable: true,
    selectMirror: true,
    navLinks: true,
    // multiMonthMaxColumns: 2,
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
      name: 'Month',
      // nav: this.calendarComponent.getApi().changeView('')
      view:   'resourceDayGridMonth',
     },

    {
      name: 'Week',
       view: 'resourceDayGridWeek',
    },
    {
      name: 'Day',
            view: 'resourceDayGridDay',
    },
    
  ];
 
  ngOnInit(): void {
- 
    this.session.sideNaveState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.calendarComponent.getApi().updateSize();
      });
  }
  setCalWidth() {
    this.calendarComponent?.getApi()?.updateSize();

    if (this.calendarComponent?.getApi()?.view.type == 'timeGridDay')
      return 'cal-width-max-none';

    return 'cal-width-max';
  }
  getAppts(info: any, successCallback: any, failureCallback: any) {
    info.staff = this.currentStaff;
     
    this.db.getAllPTAppt(info).subscribe({
      next: (json: any) => {
        if (this.currentStaff == 'All')
          json.forEach((element: any) => {
            if (element.PTStaffAssistant > '') {
              let newElem = { ...element };
              newElem.resourceId = newElem.PTStaffAssistant;
              json.push({ ...newElem });
            }
          });
        successCallback(json);
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
    // const dialogRef = this.dialog.open(PtApptEditComponent, {
    //   disableClose: true,
    //   maxWidth: '750px',
    //   maxHeight: '100vh',
    //   width: '100%',
    //   data: { data },
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   this.calendarComponent.getApi().refetchEvents();
    // });
  }
  onSelectStaff(staff: any) {
    let view = this.calendarComponent.getApi().view.type;

    if (staff != 'All') {
      switch (view) {
        case 'resourceDayGridMonth':
          view = 'dayGridMonth';
          break;
        case 'resourceTimeGridWeek':
          view = 'timeGridWeek';
          break;
        case 'resourceTimeGridDay':
          view = 'timeGridDay';
      }
    } else {
      if (!this.isMobile) {
        switch (view) {
          case 'dayGridMonth':
            view = 'resourceDayGridMonth';
            break;
          case 'timeGridWeek':
            view = 'resourceTimeGridWeek';
            break;
          case 'timeGridDay':
            view = 'resourceTimeGridDay';
        }
      }
    }

    if (view != this.calendarComponent.getApi().view.type) {
      this.calendarComponent.getApi().changeView(view);
    }

    this.currentStaff = staff;
    this.calendarComponent.getApi().refetchEvents();
  }
  handleDateSelect(selectInfo: DateSelectArg) {
    // const data = {
    //   start: selectInfo.start,
    //   end: selectInfo.end,
    //   PTStaff:
    //     this.currentStaff != 'All'
    //       ? this.currentStaff
    //       : selectInfo?.resource?.id,
    // };
    // const calendarApi = selectInfo.view.calendar;
    // const dialogRef = this.dialog.open(PtAppointmentComponent, {
    //   disableClose: true,
    //   maxWidth: '950px',
    //   maxHeight: '100vh',
    //   width: '100%',
    //   // height: '100%',
    //   data: { data },
    // });
    // dialogRef.afterClosed().subscribe((result) => {
    //   this.calendarComponent.getApi().refetchEvents();
    // }); // calendarApi.unselect(); // clear date selection
  }
  changeView(view: string) {
    if (this.currentStaff != 'All') {
      switch (view) {
        case 'resourceDayGridMonth':
          view = 'dayGridMonth';
          break;
        case 'resourceDayGridWeek':
          view = 'dayGridWeek';
          break;
        case 'resourceDayGridDay':
          view = 'dayGridDay';
      }
    }

    this.calendarComponent.getApi().changeView(view);
    this.calendarComponent.getApi().refetchEvents();
  }

  updateStatus(data: any) {
    this.db.updatePTApptStatus(data).subscribe({
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
      },
    };
  }
  onDelete(blockid: number) {
    // const dialogRef = this.dialog.open(DialogConfirmComponent, {
    //   data: { title: 'Confirm to Delete...' },
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.db.deletePTAppt({ blockid: blockid }).subscribe({
    //       next: (json: any) => {
    //         // this.form.controls['id'].patchValue(json.id);
    //         this.calendarComponent.getApi().refetchEvents();
    //       },

    //       error: (err: any) => {
    //         this.kalanisession.showErrorMsg(err);
    //       },
    //     });
    //   }
    // });
  }
  menuOpened(state: any) {
    this.isMenuOpen = state;
    this.changeDetectorRef.markForCheck();
  }
 
  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
