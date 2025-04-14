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

import scrollgridPlugin from '@fullcalendar/scrollgrid';

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
import { SelectVehicleComponent } from 'projects/vmtracker/src/app/select-vehicle/select-vehicle.component';


@Component({
  selector: 'app-vmttracker-dash',
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
  ],  templateUrl: './vmttracker-dash.component.html',
  styleUrls: ['./vmttracker-dash.component.scss']
})
export class VMTtrackerDashComponent implements OnInit, OnDestroy {
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
  heading: any;
  trip!: Trip;


  isMenuOpen = false;
  calendarOptions: CalendarOptions = {
    schedulerLicenseKey: '0198815652-fcs-1679503202',

    headerToolbar: false,
    eventOverlap: false,
    // dayMinWidth: 75,

    // allDaySlot: false,
    // slotMinTime: '07:00:00',
    // slotDuration: '00:15:00',
    // slotMaxTime: '18:00:00',
    // // editable: true,

    //  eventDurationEditable:true,
    plugins: [
      dayGridPlugin,
      resourceDayGridPlugin,
      multiMonthPlugin,
      interactionPlugin,
      scrollgridPlugin,
    ],

    initialView: 'resourceDayGridWeek',
        // this.isMobile 
        // ? 'dayGridWeek'
        // : 'resourceDayGridWeek',

    slotEventOverlap: false,
    eventMinWidth: 200,

    // eventMinHeight : 400,
    // initialView: 'multiMonthYear',
    resources: [
      { id: '1', title: 'Sienna' },
      { id: '2', title: 'VAN-1' },
      { id: '3', title: 'VAN-2' },
    ],
    selectable: true,
    selectMirror: true,
    navLinks: true,
    // multiMonthMaxColumns: 2,
    viewDidMount: this.handleViewDidMount.bind(this),

    weekends: false,
    // eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this),

    events: this.getVehodometer.bind(this),
  };
  @ViewChild('calendar', { static: true })
  calendarComponent!: FullCalendarComponent;
  // @ViewChild('menuTrigger') trigger: any;

  CALTOOLBARVIEW = [

    {
      name: 'Week',
      view: 'resourceDayGridWeek',
    },
    {
      name: 'Day',
      view:  'resourceDayGridDay',
    },
  ];
  // CALTOOLBARVIEW = [

  //   {
  //     name: 'Week',
  //     view: this.isMobile ? 'dayGridWeek' : 'resourceDayGridWeek',
  //   },
  //   {
  //     name: 'Day',
  //     view: this.isMobile ? 'dayGridDay' : 'resourceDayGridDay',
  //   },
  // ];
 
  ngOnInit(): void {
    const interval$ = interval(10000);
  
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
  getVehodometer(info: any, successCallback: any, failureCallback: any) {
     
    this.db.getVehodometer(info).subscribe({
      next: (json: any) => {
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


 
  handleDateSelect(selectInfo: DateSelectArg) {

  }

  changeView(view: string) {
    // if (this.currentStaff != 'All') {
    //   switch (view) {
    //     case 'resourceDayGridMonth':
    //       view = 'dayGridMonth';
    //       break;
    //     case 'resourceDayGridWeek':
    //       view = 'dayGridWeek';
    //       break;
    //     case 'resourceDayGridDay':
    //       view = 'dayGridDay';
    //   }
    // }

    this.calendarComponent.getApi().changeView(view);
    this.calendarComponent.getApi().refetchEvents();
  }

  getEventinfo(arg: any) {
    console.log(arg)
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

  }
  menuOpened(state: any) {
    this.isMenuOpen = state;
    this.changeDetectorRef.markForCheck();
  }
  VMTracker(vehicle: any) {
    const dialogRef = this.dialog.open(SelectVehicleComponent, {
      disableClose: false,
      maxWidth: '400px',
      maxHeight: '100vh',
      width: '100%',
      height: '100%',
      data: vehicle,
    });
 
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
