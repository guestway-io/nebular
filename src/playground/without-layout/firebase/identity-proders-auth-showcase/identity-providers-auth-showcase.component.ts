import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { NbAuthResult, NbAuthService, NbAuthToken } from '@nebular/auth';

@Component({
  selector: 'app-google-auth-showcase',
  templateUrl: './identity-providers-auth-showcase.component.html',
  styleUrls: ['./identity-providers-auth-showcase.component.scss'],
  standalone: false,
})
export class IdentityProvidersAuthShowcaseComponent {
  userToken$: Observable<NbAuthToken>;
  isAuthenticated$: Observable<boolean>;
  data$: Observable<any>;

  constructor(private authService: NbAuthService) {
    this.userToken$ = this.authService.onTokenChange();
    this.isAuthenticated$ = this.authService.onAuthenticationChange();
  }

  logout() {
    this.authService
      .logout('google')
      .pipe(take(1))
      .subscribe((authResult: NbAuthResult) => {});
  }

  loginWithGoogle() {
    this.authService
      .authenticate('google')
      .pipe(take(1))
      .subscribe((authResult: NbAuthResult) => {});
  }
}
