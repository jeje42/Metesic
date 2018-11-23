import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { VideosListComponent } from './videos/videos-list.component';
import { LoginComponent } from "./auth/login.component";
import { LoginLdapComponent } from "./auth/login-ldap.component";
import { SignupComponent } from "./auth/signup.component";
import { RecoverComponent } from "./auth/recover.component";
import { SettingsComponent } from "./settings/settings.component";

import { MeteorObservable } from 'meteor-rxjs';


MeteorObservable.subscribe('userAdmin')

export const routes: Route[] = [

	{ path: '', component: VideosListComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'login-ldap', component: LoginLdapComponent },
	{ path: 'signup', component: SignupComponent },
	{ path: 'recover', component: RecoverComponent },
	{ path: 'settings', component: SettingsComponent, canActivate: ['canActivateForLoggedIn']}
];

export const ROUTES_PROVIDERS = [{
	provide: 'canActivateForLoggedIn',	useValue: () => !!Meteor.userId()
}];
