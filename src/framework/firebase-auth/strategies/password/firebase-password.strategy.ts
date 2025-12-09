/*
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import { Injectable, runInInjectionContext } from '@angular/core';
import { Observable, of as observableOf, from } from 'rxjs';
import { catchError, map, switchMap, first, filter, timeout, take } from 'rxjs/operators';
import { NbAuthStrategyOptions, NbAuthStrategyClass, NbAuthResult } from '@nebular/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  User,
  updatePassword,
  authState,
} from '@angular/fire/auth';

import { NbFirebaseBaseStrategy } from '../base/firebase-base.strategy';
import {
  firebasePasswordStrategyOptions,
  NbFirebasePasswordStrategyOptions,
} from './firebase-password-strategy.options';

@Injectable()
export class NbFirebasePasswordStrategy extends NbFirebaseBaseStrategy {
  protected defaultOptions: NbFirebasePasswordStrategyOptions = firebasePasswordStrategyOptions;

  static setup(options: NbFirebasePasswordStrategyOptions): [NbAuthStrategyClass, NbAuthStrategyOptions] {
    return [NbFirebasePasswordStrategy, options];
  }

  authenticate({ email, password }: any): Observable<NbAuthResult> {
    const module = 'login';
    return from(
      runInInjectionContext(this.injector, () => signInWithEmailAndPassword(this.auth, email, password)),
    ).pipe(
      switchMap((res) => this.processSuccess(res, module)),
      catchError((error) => this.processFailure(error, module)),
    );
  }

  refreshToken(data?: any): Observable<NbAuthResult> {
    const module = 'refreshToken';

    // First, try to get the current user synchronously - Firebase keeps this in memory
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      return this.refreshIdToken(currentUser, module);
    }

    // If no current user in memory, wait for auth state restoration (with timeout)
    return runInInjectionContext(this.injector, () => authState(this.auth)).pipe(
      filter((user): user is User => user !== null),
      timeout(3000), // Wait up to 3 seconds for auth state restoration
      take(1),
      switchMap((user) => this.refreshIdToken(user, module)),
      catchError((error) => {
        // If timeout or no user found, return failure result
        return observableOf(
          new NbAuthResult(false, error, this.getOption(`${module}.redirect.failure`), [
            "There is no logged in user so refresh of id token isn't possible",
          ]),
        );
      }),
    );
  }

  register({ email, password }: any): Observable<NbAuthResult> {
    const module = 'register';
    return from(
      runInInjectionContext(this.injector, () => createUserWithEmailAndPassword(this.auth, email, password)),
    ).pipe(
      switchMap((res) => this.processSuccess(res, module)),
      catchError((error) => this.processFailure(error, module)),
    );
  }

  requestPassword({ email }: any): Observable<NbAuthResult> {
    const module = 'requestPassword';
    return from(runInInjectionContext(this.injector, () => sendPasswordResetEmail(this.auth, email))).pipe(
      map(() => {
        return new NbAuthResult(
          true,
          null,
          this.getOption(`${module}.redirect.success`),
          [],
          this.getOption(`${module}.defaultMessages`),
        );
      }),
      catchError((error) => this.processFailure(error, module)),
    );
  }

  resetPassword({ code, password }): Observable<NbAuthResult> {
    const module = 'resetPassword';
    return from(runInInjectionContext(this.injector, () => confirmPasswordReset(this.auth, code, password))).pipe(
      map(() => {
        return new NbAuthResult(
          true,
          null,
          this.getOption(`${module}.redirect.success`),
          [],
          this.getOption(`${module}.defaultMessages`),
        );
      }),
      catchError((error) => this.processFailure(error, module)),
    );
  }

  protected updatePassword(user: User, password: string, module: string) {
    return from(runInInjectionContext(this.injector, () => updatePassword(user, password))).pipe(
      map((token) => {
        return new NbAuthResult(
          true,
          null,
          this.getOption(`${module}.redirect.success`),
          [],
          this.getOption(`${module}.defaultMessages`),
          this.createToken(token),
        );
      }),
      catchError((error) => this.processFailure(error, module)),
    );
  }

  protected refreshIdToken(user: User, module: string): Observable<NbAuthResult> {
    return from(user.getIdToken(true)).pipe(
      map((token) => {
        return new NbAuthResult(
          true,
          null,
          this.getOption(`${module}.redirect.success`),
          [],
          this.getOption(`${module}.defaultMessages`),
          this.createToken(token),
        );
      }),
      catchError((error) => this.processFailure(error, module)),
    );
  }
}
