import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule, MatCheckboxChange } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    JimgcardComponent,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
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
    'delete',
  ];

  ngOnInit(): void {
    this.getUserList();
  }

  valueChanged(user: any, event: any) {
    let data: any = { username: user.username };
    if (event instanceof MatCheckboxChange) {
      const field = event.source.name;
      if (field) {
        const value = event.checked;
        data[field] = value;
        this.db.UpdateUser(data).subscribe({
          next: () => {
            this.getUserList();
          },
          error: (err: any) => {
            this.kalanisession.showErrorMsg(err);
          },
        });
      }
    }
  }

  getUserList() {
    this.db.getUserList({}).subscribe({
      next: (users: any) => {
        this.dataSource = users;
        this.changeDetectorRef.markForCheck();
      },
      error: (err: any) => {
        this.kalanisession.showErrorMsg(err);
      },
    });
  }

  deleteUser(user: any) {
    if (
      confirm(
        `Are you sure you want to permanently delete user "${user.username}"?`
      )
    ) {
      this.db.DeleteUser({ username: user.username }).subscribe({
        next: () => {
          this.getUserList();
        },
        error: (err: any) => {
          this.kalanisession.showErrorMsg(err);
        },
      });
    }
  }
}