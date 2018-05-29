import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class HomeService {

  timeViewSubject: Subject<string> = new Subject<string>();
  private timeView: string = 'month';

  constructor() { }
  
  setView(selectedView: string){
    this.timeView = selectedView;
    this.timeViewSubject.next(this.timeView);
  }

  getView(): string{
    return this.timeView;
  }

}
