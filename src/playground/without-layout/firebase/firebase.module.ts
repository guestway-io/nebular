import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NbAuthModule } from '@nebular/auth';
import { NbFirebaseAuthModule, NbFirebasePasswordStrategy, NbFirebaseGoogleStrategy } from '@nebular/firebase-auth';

import { FirebasePlaygroundComponent } from './firebase-playground.component';
import { FirebasePlaygroundRoutingModule } from './firebase-routing.module';
import { IdentityProvidersAuthShowcaseComponent } from './identity-proders-auth-showcase/identity-providers-auth-showcase.component';
import { PasswordAuthShowcaseComponent } from './password-auth-showcase/password-auth-showcase.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

@NgModule({
  imports: [
    CommonModule,
    FirebasePlaygroundRoutingModule,
    NbFirebaseAuthModule,
    NbAuthModule.forRoot({
      forms: {
        login: {
          strategy: 'password',
          rememberMe: true,
          socialLinks: [],
        },
        register: {
          strategy: 'password',
          terms: true,
          socialLinks: [],
        },
        logout: {
          strategy: 'password',
        },
        requestPassword: {
          strategy: 'password',
          socialLinks: [],
        },
        resetPassword: {
          strategy: 'password',
          socialLinks: [],
        },
        validation: {
          password: {
            required: true,
            minLength: 6,
            maxLength: 50,
          },
          email: {
            required: true,
          },
          fullName: {
            required: false,
            minLength: 4,
            maxLength: 50,
          },
        },
      },
      strategies: [
        NbFirebasePasswordStrategy.setup({
          name: 'password',
          login: {
            redirect: {
              success: 'example/firebase/password-showcase',
            },
          },
          register: {
            redirect: {
              success: 'example/firebase/password-showcase',
            },
          },
          logout: {
            redirect: {
              success: 'example/firebase/login',
            },
          },
          requestPassword: {
            redirect: {
              success: 'example/firebase/login',
            },
          },
          resetPassword: {
            redirect: {
              success: 'example/firebase/login',
            },
          },
        }),
        NbFirebaseGoogleStrategy.setup({
          name: 'google',
        }),
      ],
    }),
  ],
  declarations: [FirebasePlaygroundComponent, PasswordAuthShowcaseComponent, IdentityProvidersAuthShowcaseComponent],
  providers: [
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      }),
    ),
    provideAuth(() => getAuth()),
  ],
})
export class FirebasePlaygroundModule {}
