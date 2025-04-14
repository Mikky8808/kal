import { Component, OnInit, ViewChild,  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MemberEditComponent } from '../member-edit/member-edit.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MemberUploadPicComponent } from '../member-upload-pic/member-upload-pic.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MemberShipRenewalComponent } from '../member-ship-renewal/member-ship-renewal.component';
import { MemberPurchPointsComponent } from '../member-purch-points/member-purch-points.component';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MemberEarnPointsComponent } from '../member-earn-points/member-earn-points.component';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { MemberQVComponent } from '../member-qv/member-qv.component';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-memberlist',
  standalone: true,
  imports: [
    CommonModule,
    JimgcardComponent,
    MatTableModule,
    MatSortModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatSidenavModule,
    MemberQVComponent
  ],
  templateUrl: './memberlist.component.html',
  styleUrls: ['./memberlist.component.scss'],
})
export class MemberlistComponent implements OnInit {

  @ViewChild('drawer', { static: true }) matDrawer!: MatDrawer

  constructor(
    public db: DbservicesService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private kalanisession: KalaniSessionService,
    media: MediaMatcher

  ) {
    this.mobileQuery = media.matchMedia('(max-width: 800px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.getMembers();
  }
  mobileQuery: MediaQueryList;

  checkinMember: any = {};
  dataSource: any;
  filterValue = new FormControl('', { nonNullable: true });
  Ready = false;
  currentMember : number = 0;
  allowedCheckin=['M','C','P']
  displayedColumns: string[] = [
    // 'action',
    'id',
    'avatar',
    'fullName',
    'trips',
    'DOB',
    'phone',
    'email',
    'legalSex',
    'DL', 
  ];
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {    this.matDrawer.open();
  }
  private _mobileQueryListener: () => void;

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  onAddMember(id: number) {
    const dialogRef = this.dialog.open(MemberEditComponent, {
      disableClose: true,
      maxWidth: '100vw',
      maxHeight: '100vh',
      width: '100%',
      height: '100%',
      data: { id: id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.getMembers();
    });
  }
  jsencodeURI(str: string) {
    return encodeURI(str);
  }

  profileImage(avatar: string) {
    return `background-image: url(${encodeURI(avatar)});
background-size: cover;"`;
  }
  openUploadDialog(member: any) {
    const dialogRef = this.dialog.open(MemberUploadPicComponent, {
      disableClose: true,
      maxWidth: '100vw',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
      data: {
        id: member.id,
        name: member.fullName,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getMembers();
    }); // calendarApi.unselect(); // clear date selection
  }
  openRenewalDialog(member: any) {
    const dialogRef = this.dialog.open(MemberShipRenewalComponent, {
      disableClose: true,
      // maxWidth: '100%',
      // maxHeight: '100%',
      width: '100%',
      height: '100%',
      data: member
      
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.getMembers();
    }); // calendarApi.unselect(); // clear date selection
  }
  openPurchsePointDialog(member: any) {
    const dialogRef = this.dialog.open(MemberPurchPointsComponent, {
      disableClose: true,
      // maxWidth: '100%',
      // maxHeight: '100%',
      width: '100%',
      height: '100%',
      data: member
      
    });

  }
  openEarnPointDialog(member: any) {
    const dialogRef = this.dialog.open(MemberEarnPointsComponent, {
      disableClose: true,
      // maxWidth: '100%',
      // maxHeight: '100%',
      width: '100%',
      height: '100%',
      data: member
      
    });

  }
  

  onCheckin(type: string, data: any) {
    this.checkinMember = data;

    this.db.checkInMember({ memberId: data.id, type: type }).subscribe({
      next: (json: any) => {
        this.getMembers();
        setTimeout(() => {
          this.checkinMember = {};
        }, 1000);
      },
      error: (err) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }
  getMembers() {
    this.db.getAllMembers().subscribe({
      next: (json: any) => {
        this.dataSource = new MatTableDataSource(json);
        this.applyFilter(this.filterValue.value);
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }
}
