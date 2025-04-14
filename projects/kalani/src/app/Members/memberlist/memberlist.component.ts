import { MediaMatcher } from '@angular/cdk/layout';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { MemberEditComponent } from '../member-edit/member-edit.component';
import { MemberMenuComponent } from '../member-menu/member-menu.component';
import { MemberQVComponent } from '../member-qv/member-qv.component';

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
    MemberQVComponent,
    MatButtonToggleModule,
    NgOptimizedImage,
    MemberMenuComponent
  ],
  templateUrl: './memberlist.component.html',
  styleUrls: ['./memberlist.component.scss'],
})
export class MemberlistComponent implements OnInit {
  @ViewChild('drawer', { static: true }) matDrawer!: MatDrawer;

  constructor(
    public db: DbservicesService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    public kalanisession: KalaniSessionService,
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
  currentMember: number = 0;
  membertypes: any[] = this.kalanisession.membertypes;
  currentMemberType: string = '';
  allowedCheckin = ['M', 'C', 'P'];

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

  ngOnInit(): void {}
  private _mobileQueryListener: () => void;

  applyFilter(filterValue: any) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  onSelectMemberType(type: string) {
    this.currentMemberType = type;
    this.getMembers();
  }
  onAddMember(id: number) {
    const dialogRef = this.dialog.open(MemberEditComponent, {
      disableClose: true,
      maxWidth: '800px',
      // maxHeight: '100vh',
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



  getMembers() {
    this.db.getAllMembers({ membertype: this.currentMemberType }).subscribe({
      next: (json: any) => {
        this.dataSource = new MatTableDataSource(json);
        this.applyFilter(this.filterValue.value);
        this.dataSource.sort = this.sort;
        console.log(json)
      },
      error: (err) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }
}
