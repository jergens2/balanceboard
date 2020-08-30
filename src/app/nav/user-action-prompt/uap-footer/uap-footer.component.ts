import { Component, OnInit } from '@angular/core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../../../authentication/authentication.service';

@Component({
  selector: 'app-uap-footer',
  templateUrl: './uap-footer.component.html',
  styleUrls: ['./uap-footer.component.css']
})
export class UapFooterComponent implements OnInit {

  constructor(private authService: AuthenticationService) { }

  public readonly faArrowLeft = faArrowLeft;

  ngOnInit(): void {

  }

  public onClickLogout() {
    this.authService.logout();
  }

}
