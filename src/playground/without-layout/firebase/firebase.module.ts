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
        apiKey: 'AIzaSyDeiie7jrSPkG9G_MzCg_5gAoibzcR5vh8',
        authDomain: 'guestway-io-development.firebaseapp.com',
        projectId: 'guestway-io-development',
        storageBucket: 'guestway-io-development.appspot.com',
        messagingSenderId: '890374380412',
        appId: '1:890374380412:web:f499389a33a992c47e62f9',
      }),
    ),
    provideAuth(() => getAuth()),
  ],
})
export class FirebasePlaygroundModule {}
