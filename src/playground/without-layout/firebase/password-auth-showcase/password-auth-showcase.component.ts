import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { NbAuthService, NbAuthToken } from '@nebular/auth';

@Component({
  selector: 'nb-password-auth-showcase',
  templateUrl: './password-auth-showcase.component.html',
  styleUrls: ['./password-auth-showcase.component.scss'],
  standalone: false,
})
export class PasswordAuthShowcaseComponent {
  userToken$: Observable<NbAuthToken>;
  isAuthenticated$: Observable<boolean>;
  data$: Observable<any>;

  constructor(private authService: NbAuthService, private router: Router, private route: ActivatedRoute) {
    this.userToken$ = this.authService.onTokenChange();
    this.isAuthenticated$ = this.authService.isAuthenticated();
  }

  logout() {
    this.router.navigate(['../logout'], { relativeTo: this.route });
  }

  login() {
    this.router.navigate(['../login'], { relativeTo: this.route });
  }

  resetPassword() {
    this.router.navigate(['../reset-password'], { relativeTo: this.route });
  }
}
