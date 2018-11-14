import { Component, OnInit, OnDestroy, NgZone, Inject, ViewChild, TemplateRef } from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Accounts } from 'meteor/accounts-base';
import { Subscription, Subject, Observable } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MatInputModule,MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material';

import 'rxjs/add/operator/combineLatest';

import { Users } from '../../../../both/collections/users.collection';
import { UsersAdmin } from '../../../../both/collections/users-admin.collection';

import { UserAdmin } from '../../../../both/models/user-admin.model';
import { User } from '../../../../both/models/user.model';
import { UserCreation } from '../../../../both/models/user-creation.model';


/**
 * Follow https://docs.meteor.com/api/passwords.html#Accounts-createUser and call the method on server side
 */
@Component({
	selector: 'settings-users',
	templateUrl: './settings-users.component.html',
	styleUrls: ['./settings-users.component.scss']
})
@InjectUser('user')
export class SettingsUsersComponent implements OnInit, OnDestroy {
	addUser: FormGroup;

	users: Observable<User[]>;
	adminUsers: Observable<User[]>;
	usersAdmin: Observable<UserAdmin[]>;
	error: string;

	usersSub: Subscription;
	usersAdminSub: Subscription;
	user: Meteor.User;

	actionsAlignment: string;
	config: MatDialogConfig = {
    disableClose: false,
    hasBackdrop: true,
    backdropClass: '',
    width: '',
    height: '',
    position: {
      top: '',
      bottom: '',
      left: '',
      right: ''
    },
    data: {
      message: 'Akadok'
    }
  };

	@ViewChild(TemplateRef) template: TemplateRef<any>;

  constructor(private zone: NgZone,	private formBuilder: FormBuilder,public dialog: MatDialog, @Inject(DOCUMENT) doc: any) {
    // Possible useful example for the open and closeAll events.
    // Adding a class to the body if a dialog opens and
    // removing it after all open dialogs are closed
    dialog.afterOpen.subscribe((ref: MatDialogRef<any>) => {
      if (!doc.body.classList.contains('no-scroll')) {
        doc.body.classList.add('no-scroll');
      }
    });
    dialog.afterAllClosed.subscribe(() => {
      doc.body.classList.remove('no-scroll');
    });
  }

	ngOnInit() {
		this.usersSub = MeteorObservable.subscribe('userData').subscribe(() => {
				// this.users = Users.find().zone();
		});

		this.usersAdminSub = MeteorObservable.subscribe('userAdmin').subscribe(() => {
				this.usersAdmin = UsersAdmin.find().zone();

				this.usersAdmin.subscribe(usersAdmin => {
					if(usersAdmin.length === 1){
						this.usersAdmin = Users.find({_id: usersAdmin[0].userId});
						this.users = Users.find({_id: {
							$ne: usersAdmin[0].userId
						}}).zone();
					}else if(usersAdmin.length === 0){
						this.users = Users.find().zone();
					}else{
						console.log("Error : there must not have several admins.");
					}
				});
		});

		this.addUser = this.formBuilder.group({
      username: ['', Validators.required],
			email: ['', Validators.required]
		});
	}

	ngOnDestroy() {
		this.usersSub.unsubscribe();
	}

	addUserFunction():void {
		if (this.addUser.valid) {
			var userInCreation:string = undefined;
			Meteor.call('addUserWithoutLogin', new UserCreation(this.addUser.value.email, this.addUser.value.username), function(error, result){
			  if(error){
			    alert(error.reason);
			    return;
			  }
			});
		}
	}

	deleteUser(user: User): void {
		Meteor.call('deleteUser', user._id , function(error, result){
			if(error){
				alert(error.reason);
				return;
			}
			alert("User " + user.username + " # " + user.emails[0] + " has been successfully deleted." + result.value);
		});
	}

	setAdmin(user: User): void{
		Meteor.call('setAdminAlone', user._id, this.user._id, function(error, result){
			if(error){
				alert(error.reason);
				return;
			}
		});
	}

	checkAdmin(user: User){
		console.log("checkAdmin for " + user._id);
		let isAdmin:UserAdmin = UsersAdmin.findOne({userId: user._id});
		if(isAdmin != undefined){
			console.log("checkAdmin is undefined");
			return false;
		}
		console.log(user._id + " is admin !");
		return true;
	}

	openEditUser(user: User) {
    let dialogRef = this.dialog.open(ContentElementDialog, this.config);
    dialogRef.componentInstance.actionsAlignment = this.actionsAlignment;
		dialogRef.componentInstance.user = user;
		dialogRef.componentInstance.loggedUser = this.user;
	}
}

@Component({
  selector: 'demo-content-element-dialog',
  styles: [
    `img {
      max-width: 100%;
    }`
  ],
  template: `
    <h2 md-dialog-title>Neptune</h2>

    <mat-dialog-content>
		<form [formGroup]="changePasswordUser" (ngSubmit)="changeUserPasswordFunction();">
			<mat-form-field>
				<input mdInput formControlName="password" type="password" placeholder="Nouveau mot de passe"/>
			</mat-form-field>
			<button color="primary" md-raised-button type="submit">Change it !</button>
		</form>
    </mat-dialog-content>
  `
})
export class ContentElementDialog {
  actionsAlignment: string;
	user: User;
	loggedUser: User;

	changePasswordUser: FormGroup;

  constructor(public dialog: MatDialog, private formBuilder: FormBuilder) {
		this.changePasswordUser = this.formBuilder.group({
      password: ['', Validators.required]
		});
	}

	changeUserPasswordFunction() {
		console.log("user : " + this.user + " ; " + this.loggedUser);
			if (this.changePasswordUser.valid) {
				Meteor.call('changePasswordWithoutLogin', this.user._id, this.changePasswordUser.value.password, this.loggedUser._id, function(error, result){
					if(error){
						alert(error.reason);
						return;
					}
				});
			}
			this.changePasswordUser.reset();
	}

  // showInStackedDialog() {
  //   this.dialog.open(IFrameDialog);
  // }
}
