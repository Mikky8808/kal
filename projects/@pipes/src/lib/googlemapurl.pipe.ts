import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'googlemapurl',
  standalone: true

})
export class GooglemapurlPipe implements PipeTransform {
  transform(value: string | undefined): string {
    return 'http://maps.google.com/maps?q=' + value;
  }
}
