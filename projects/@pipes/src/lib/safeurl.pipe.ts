import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeURL',
  standalone: true
  
})
export class safeURL implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(url: string): any {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);

  }
 
}
