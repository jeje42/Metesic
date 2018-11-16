import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import {MatDialog} from '@angular/material';


import 'rxjs/add/operator/combineLatest';

// import { VideosMetas } from '../../../../both/collections/video-meta.collection';
// import { VideoMeta } from '../../../../both/models/video-meta.model';


import { User } from '../../../../both/models/user.model';

@Component({
  selector: 'progression-dialog',
  styleUrls: ['./progression-dialog.component.scss'],
  templateUrl: './progression-dialog.component.html'
})
export class ProgressionDialog implements OnInit, OnDestroy{
  actionsAlignment: string;
	user: User;
	loggedUser: User;
  statusTreatment: number;

  addPlayList: FormGroup;

  constructor(public dialog: MatDialog, private formBuilder: FormBuilder) {}

  ngOnInit() {
  }

  ngOnDestroy() {
  }
}
