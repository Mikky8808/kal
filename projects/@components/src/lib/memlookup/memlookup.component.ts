import { Component, Input, OnInit, EventEmitter, Output,  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { SessionService } from 'projects/@session/src/public-api';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Member } from 'projects/@models/src/lib/models';
import { Observable, startWith, map, debounceTime } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MemberEditComponent } from 'projects/kalani/src/app/Members/member-edit/member-edit.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MemberMenuComponent } from 'projects/kalani/src/app/Members/member-menu/member-menu.component';

@Component({
  selector: 'lib-memlookup',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatDividerModule,
    MatCardModule,
    MatFormFieldModule,
  ],
  templateUrl: './memlookup.component.html',
  styleUrls: ['./memlookup.component.css'],
})
export class MemlookupComponent implements OnInit {
  members: Member[] = [];
  @Input() control: any;
  @Input() required: boolean = true;
  @Input() addAllowed: boolean = true;
  @Input() prefixIcon: string = '';
  @Input() addMenu : boolean = false;
  @Input() membertype : string = '';
  @Output() memberChanged = new EventEmitter<object>();

  // @Input()
  // form!: FormGroup;
  myControl = new FormControl<string | Member>('');
  filteredOptions!: Observable<Member[]>;
  Ready = false;

  constructor(
    private db: DbservicesService,
    private session: SessionService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,

  ) {
  }
  allowAdd(value: any) {
    if (typeof value === 'string' && value.trim() > '') return '';

    return 'hidden';
  }

  ngOnInit() {
    this.getMembers();

    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(this.control.value),
      // debounceTime(300),

      map((value: any) => {
        if (typeof value === 'string') {
          if (this.required) this.control.setErrors({ required: true });
        }
        if (typeof value === 'object') {
          this.memberChanged.emit(value);
        }
        const name = typeof value === 'string' ? value : value?.fullName;
        return name ? this._filter(name as string) : this.members.slice();
      })
    );
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

  private _filter(name: string): Member[] {
    const filterValue = name.toLowerCase().replace(/ /g,'');
    return this.members.filter((member) => 
      member.fullName?.replace(/ /g,'').toLowerCase().trim().includes(filterValue.trim())
     
    );
  }
  displayFn(user: Member): string {
    return user && user.fullName ? user.fullName : user?.toString();
  }
  jsencodeURI(str: string) {
    return encodeURI(str);
  }
  getMembers() {
    console.log('this is member type',this.membertype)
    this.db.getAllMembers(({ membertype: this.membertype })).subscribe({
      next: (json: any) => {
        this.members = json;
        this.Ready = true;
        this.control.patchValue(this.control.value);
        this.changeDetectorRef.markForCheck();
      },
      error: (err: any) => {
        this.session.showErrorMsg(err);
      },
    });
  }
}
