import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";

import 'rxjs/add/operator/combineLatest';

import { Folders } from '../../../../both/collections/folders.collection';
import { Folder } from '../../../../both/models/folder.model';

@Component({
	selector: 'settings',
	templateUrl: './settings.component.html',
	styles: ['./settings.component.scss']
})
@InjectUser('user')
export class SettingsComponent implements OnInit, OnDestroy {
  tabs = [
    {
      label: 'File System',
      file:'0'
    }, {
      label: 'Categories',
      file:'1'
    }, {
      label: 'Users',
      file:'2'
    }
  ];

	ngOnInit() {
	}

	ngOnDestroy() {
	}
}
