import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { MatDialog } from '@angular/material/dialog';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    JimgcardComponent,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,MatIconModule,MatButtonModule,
    FormsModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent {
  constructor(
    public db: DbservicesService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    public kalanisession: KalaniSessionService
  ) {}
  dataSource: any;
  displayColumns = [
    'username',
    'fullName',
    'email',
    'startPath',
    'isActive',
    'isAdmin',
    'isDriver',
    'isPT',
    'isLa_Lmt',
    'ptColor',
  ];

  ngOnInit(): void {
    this.getUserList();
  }
  valueChanged(user: any, event: any) {
    let field, value,data: any = {username:user.username};
    if (event instanceof MatCheckboxChange) {
      field  = event.source.name;
      value = event.checked;
    } else {
      field = event.target.name;
      value = event.target.value;
      console.log(event);
    }
     data[field] = value;
    this.db.UpdateUser(data).subscribe({
      next: (json: any) => {
      },
      error: (err) => {
        this.kalanisession.showErrorMsg(err);
      },
    });

  }

  getUserList() {
    this.db.getUserList({}).subscribe({
      next: (json: any) => {
        this.dataSource = json;
      },
      error: (err) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }
}
