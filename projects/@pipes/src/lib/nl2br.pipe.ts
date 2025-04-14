import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'nl2br',
  standalone: true
  
})
export class Nl2brPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(value: string): any {
    if (value) {
      return  value.replace(/\n/g, '<br>')
    }
    return '';

  }
 
}
