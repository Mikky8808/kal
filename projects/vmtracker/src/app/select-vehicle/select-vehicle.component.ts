import {
  Component,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
  Optional,
  Inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { JimgcardComponent } from 'projects/@components/src/lib/jimgcard/jimgcard.component';
import { NotificationService } from 'projects/@session/src/lib/notification.service';
import { DbservicesService } from 'projects/@dbservices/src/public-api';
import { KalaniSessionService } from 'projects/@session/src/lib/kalani.session.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-select-vehicle',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    JimgcardComponent,
    MatFormFieldModule,
    MatOptionModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './select-vehicle.component.html',
  styleUrls: ['./select-vehicle.component.scss'],
})
export class SelectVehicleComponent implements OnInit, OnDestroy {
  constructor(
    private notification: NotificationService,
    @Optional() public dialogRef: MatDialogRef<SelectVehicleComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public dialogData: any,

    private db: DbservicesService,
    private FormBuilder: FormBuilder,
    private kalanisession: KalaniSessionService,
    public route: ActivatedRoute,
    public router: Router,

    private changeDetectorRef: ChangeDetectorRef
  ) {}

  form!: FormGroup;
  vehicles: any[] = this.kalanisession.vehicles;
  Ready = false;
  isDialog = true;

  Busy = false;
  user = this.kalanisession.currentUser;
  tripreasons = [
    'Patient Pickup/ Drop-off',
    'Food Pickup',
    'Excursion',
    'Vehicle Maintenance',
    'Shopping',
    'Personal',
  ];
  ngOnInit(): void {
    var Request = {
      vid: this.dialogData?.vid ?  this.dialogData?.vid :  this.route.snapshot.paramMap.get('vid'), 
      id: this.dialogData?.id
    }


    if (Request) {
      this.db.getLastVehodometer(Request).subscribe({
        next: (json: any) => {
          this.Busy = false;
          this.setupForm(json);
        },
        error: (err: any) => {
          console.log(err);
          this.Busy = false;
          this.kalanisession.showErrorMsg(err);
        },
      });
    } else {
      this.setupForm({ });
    }
  }

  setupForm(rec: any) {
    this.Ready = true;
    this.form = this.FormBuilder.nonNullable.group({
      id: rec?.id,
      driver: rec?.driver ? rec?.driver : this.user.username  ,

      vehicle_id: [rec?.vehicle_id, Validators.required],
      vehicle: [rec?.vehicle],

      reason: [rec?.reason, Validators.required],
      location: [rec?.location, Validators.required],

      odometer: [rec?.odometer, Validators.required],
      notes: [rec?.notes],
    });
  }
  onSubmit() {
    this.Busy = true;
    this.changeDetectorRef.markForCheck();

    this.db.saveVehodometer(this.form.value).subscribe({
      next: (json: any) => {
        this.Busy = false;
        this.kalanisession.notify(
          `Odometer for ${this.form.value.vehicle} updated`
        );
         if (this.dialogRef) this.dialogRef.close(this.form.value);
        else this.router.navigate(['close']);
      },
      error: (err: any) => {
        this.Busy = false;
        this.kalanisession.showErrorMsg(err);
      },
    });
  }

  ngOnDestroy(): void {}
}
