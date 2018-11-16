import { Route } from '@angular/router';
import { Meteor } from 'meteor/meteor';

import { VideosListComponent } from './videos/videos-list.component';
import { LoginComponent } from "./auth/login.component";
import { SignupComponent } from "./auth/signup.component";
import { RecoverComponent } from "./auth/recover.component";
import { SettingsComponent } from "./settings/settings.component";

import { UsersAdmin } from "../../../both/collections/users-admin.collection";
import { UserAdmin } from "../../../both/models/user-admin.model"

import { MeteorObservable } from 'meteor-rxjs';


MeteorObservable.subscribe('userAdmin')

export const routes: Route[] = [

	{ path: '', component: VideosListComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'signup', component: SignupComponent },
	{ path: 'recover', component: RecoverComponent },
	{ path: 'settings', component: SettingsComponent, canActivate: ['canActivateForLoggedIn']}
];

export const ROUTES_PROVIDERS = [{
	provide: 'canActivateForLoggedIn',	useValue: () => !!Meteor.userId()
}];
