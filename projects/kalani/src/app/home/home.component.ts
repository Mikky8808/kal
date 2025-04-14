import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from 'projects/@session/src/lib/session.service';
import { DbservicesService } from 'projects/@dbservices/src/lib/dbservices.service';
import { HttpClient } from '@angular/common/http';
import { BarcodereaderService } from 'projects/@session/src/lib/barcodereader.service';
import { JmcbootService } from 'projects/@jmcboot/src/public-api';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { MainNavComponent } from 'projects/@components/src/lib/main-nav/main-nav.component';
import { LoginComponent } from 'projects/@components/src/lib/login/login.component';
import { AppRoutingModule } from '../app-routing.module';
import { Router } from '@angular/router';
import { Member } from 'projects/@models/src/lib/models';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MemberQVComponent } from '../Members/member-qv/member-qv.component';
import { MatIconModule } from '@angular/material/icon';
import { MediaMatcher } from '@angular/cdk/layout';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { MatButtonModule } from '@angular/material/button';
import { MemlookupComponent } from 'projects/@components/src/lib/memlookup/memlookup.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MenuItems, menuBar } from './menu.items';
import { LockScreenComponent } from './lock-screen/lock-screen.component';
import { MatDialog } from '@angular/material/dialog';
import { MemberMenuComponent } from '../Members/member-menu/member-menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    JimgcardComponent,
    MainNavComponent,
    ReactiveFormsModule,

    LoginComponent,
    AppRoutingModule,
    MatSidenavModule,
    MemberQVComponent,
    MatIconModule,
    MatButtonModule,
    MemlookupComponent,
    MemberMenuComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  constructor(
    public jmcboot: JmcbootService,
    public session: SessionService,
    public kalaniSession: KalaniSessionService,
    private dbservices: DbservicesService,
    public _router: Router,
    private barCodeReader: BarcodereaderService,
    private changeDetectorRef: ChangeDetectorRef,
    private dialog: MatDialog,

    media: MediaMatcher
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 800px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
    this.resetActivityTime();
  }

  title = 'kalani';

  errormsg = 'Please enter your login Information';
  currentMember?: number | null;
  mobileQuery: MediaQueryList;
  @ViewChild('drawer', { static: false }) matDrawer!: MatDrawer;
  searchMember = new FormControl('');
  lastActivityTime: Date = new Date();
  menuBar = menuBar;
  MenuItems = MenuItems;
  screenLocked = false;
  member : any;
  currentUser = this.session.currentUser;
  @HostListener('document:mousemove')
  @HostListener('document:keydown')
  @HostListener('window:scroll')

  onUserActivity() {
    this.resetActivityTime();
  }

  ngOnInit(): void {

    // this.session.setupPrintIframe();
    // this.checkUserInactivity();

    this.kalaniSession.QVMember$.subscribe({
      next: (memberId) => {
        this.currentMember = null;
        this.matDrawer.close();
        this.changeDetectorRef.markForCheck();
        setTimeout(() => {
          this.currentMember = memberId;
        }, 300);
      },
    });
  }

  resetActivityTime() {
    this.lastActivityTime = new Date();
  }
  checkUserInactivity() {
    const inactivityPeriod = 3000; // 5 minutes in milliseconds

    setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsedTime = currentTime - this.lastActivityTime.getTime();

      if (
        elapsedTime > inactivityPeriod &&
        this.session.Authenticated &&
        !this.screenLocked
      ) {
        this.screenLocked = true;

        const dialogRef = this.dialog.open(LockScreenComponent, {
          disableClose: true,
          maxWidth: '100vw',
          maxHeight: '100vh',
          width: '100%',
          data: { },
          height: '100%'
        });
        dialogRef.afterClosed().subscribe((result) => {
          this.screenLocked = false;

        });
      
        
      }
    }, inactivityPeriod);
  }

  private _mobileQueryListener: () => void;

  onMemberChanged(member: any) {
    this.member = member;
    this.kalaniSession.QVMember$.next(member.id);
    // this.searchMember.patchValue('');
  }
  onSubmit(Login: any) {
    this.dbservices.loginKalani(Login).subscribe({
      next: (json: any) => {
        if (json.Authenticated) {
          this.session.bootdata = json.bootdata;
          this.jmcboot.config!.bootdata = json.bootdata;
          const user = json.bootdata.user;

          this.barCodeReader.connectBarCodeReader();
          this._router.navigate([user.startPath]);
          setTimeout(() => {
            this.session.Authenticated = true;
          }, 30);
        } else {
          this.errormsg = 'Invalid username and password combination.';
        }
      },
      error: (e) => {
        this.errormsg = e;
      },
    });
  }
}
