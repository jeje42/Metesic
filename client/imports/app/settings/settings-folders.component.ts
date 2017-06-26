import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";

import 'rxjs/add/operator/combineLatest';

import { Folders } from '../../../../both/collections/folders.collection';
import { Folder } from '../../../../both/models/folder.model';

import template from './settings-folders.component.html';
import style from './settings-folders.component.scss';

@Component({
	selector: 'settings-folders',
	template,
	styles: [style]
})
@InjectUser('user')
export class SettingsFoldersComponent implements OnInit, OnDestroy {
	current: Observable<Folder[]>;
	folders: Observable<Folder[]>;
	files: Observable<Folder[]>;

	FoldersSub: Subscription;
	user: Meteor.User;
	currentFolder: string;

  tabs = [
    {
      label: 'Folders',
      folder: true
    }, {
      label: 'Files',
      folder: false,
    }
  ];

	ngOnInit() {
		var initPath = "/home/jeje";
		this.initDirectory(initPath);
	}

	ngOnDestroy() {
		this.FoldersSub.unsubscribe();
	}

	initDirectory(currentFolder: string): void {
		Meteor.call('scanFolderBeginning', currentFolder, 1);

		this.currentFolder = currentFolder;

		this.FoldersSub = MeteorObservable.subscribe('folders').subscribe(() => {
			this.current = Folders.find({ path: currentFolder }).zone();

			this.folders = Folders.find({ father: currentFolder, isFolder: true },{
        sort: {
          path: 1
        }
			}).zone();

			this.files = Folders.find({ father: currentFolder, isFolder: false },{
        sort: {
          path: 1
        }
			}).zone();
		});
	}

	cdInto(newPath: string): void {
		this.initDirectory(newPath);
	}

	cdBack(): void {
		this.cdInto(Folder.createFatherPath(this.currentFolder));
	}

	setInCollection(folder: Folder, checked: boolean): void {
		Meteor.call('changeCollectionFolder', folder, checked);
	}

	synchroniseCurrent(): void {
		this.initDirectory(this.currentFolder);
	}
}
