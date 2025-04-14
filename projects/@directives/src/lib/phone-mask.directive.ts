import {
  ElementRef,
  Directive,
  HostListener,
  Injector,
  OnInit,
  HostBinding,
  Renderer2,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appPhoneMask]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PhoneMaskDirective,
      multi: true,
    },
  ],
})
export class PhoneMaskDirective implements ControlValueAccessor, OnInit {
  // @HostBinding('value') inputValue! : string;

  formControl: any;
  onChange!: (value: string) => void;
  onTouched!: () => void;

  constructor(
    private el: ElementRef,
    private injector: Injector,
    private _renderer: Renderer2
  ) {}
  writeValue(obj: any): void {
    if (obj) {
      this._renderer.setProperty(
        this.el.nativeElement,
        'value',
        this.maskPhone(obj.replace(/\D/g, ''))
      );
      if (this.formControl?.value != this.el.nativeElement.value) {
        setTimeout(() => {
          this.formControl?.patchValue(this.el.nativeElement.value);
        }, 30);
      }
    }
  }
  ngAfterViewInit() {
    const model = this.injector.get(NgControl);
    this.formControl = model.control;
    if (this.formControl.value != this.el.nativeElement.value) {
      setTimeout(() => {
        this.formControl.patchValue(this.el.nativeElement.value);
      }, 30);
    }
  }
  ngOnInit(): void {}
  //     this.formControl.updateValueAndValidity()
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @HostListener('input', ['$event'])
  onInput(event: any) {
    const input = event.target;
    input.value = this.maskPhone(input.value.replace(/\D/g, ''));

    this.onChange(input.value);
    this.onTouched();
  }

  private maskPhone(phoneNumber: string) {
    const phoneLength = phoneNumber.length;

    if (phoneLength === 0) {
      return '';
    } else if (phoneLength < 4) {
      return `(${phoneNumber}`;
    } else if (phoneLength < 7) {
      return `(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(3)}`;
    } else {
      return `(${phoneNumber.substring(0, 3)}) ${phoneNumber.substring(
        3,
        6
      )}-${phoneNumber.substring(6, 10)}`;
    }
    return '';
  }
}
