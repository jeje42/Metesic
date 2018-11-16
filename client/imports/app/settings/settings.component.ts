import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";

import { UsersAdmin } from '../../../../both/collections/users-admin.collection';
import { UserAdmin } from '../../../../both/models/user-admin.model';

import 'rxjs/add/operator/combineLatest';


@Component({
	selector: 'settings',
	templateUrl: './settings.component.html',
	styles: ['./settings.component.scss']
})
@InjectUser('user')
export class SettingsComponent implements OnInit, OnDestroy {
	 tabs = [
    {
      label: 'Categories',
      file:'1'
    }
  ];

	usersAdminSub: Subscription;

	isAdmin: boolean;

	ngOnInit() {
		this.usersAdminSub = MeteorObservable.subscribe('userAdmin').subscribe(() => {
				console.log("Meteor userId : " + Meteor.userId())
				let admin:UserAdmin = UsersAdmin.findOne({userId:  Meteor.userId()})
				if(admin){
					this.isAdmin = true
					this.tabs.push({
			      label: 'File System',
			      file:'0'
					})
					this.tabs.push({
			      label: 'Users',
			      file:'2'
					})
				}else{
					this.isAdmin = false
				}
		});
	}

	ngOnDestroy() {
		this.usersAdminSub.unsubscribe();
	}
}
