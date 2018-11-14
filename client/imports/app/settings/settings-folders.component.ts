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
	selector: 'settings-folders',
	template : './settings-folders.component.html',
	styleUrls: ['./settings-folders.component.scss']
})
@InjectUser('user')
export class SettingsFoldersComponent implements OnInit, OnDestroy {
	current: Observable<Folder[]>;
	folders: Observable<Folder[]>;
	files: Observable<Folder[]>;

	foldersSub: Subscription;
	videosSub: Subscription;
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
		this.foldersSub.unsubscribe();
		this.videosSub.unsubscribe();
	}

	initDirectory(currentFolder: string): void {
		Meteor.call('scanFolderBeginning', currentFolder, 1);

		this.currentFolder = currentFolder;

		this.foldersSub = MeteorObservable.subscribe('folders').subscribe(() => {
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

		this.videosSub = MeteorObservable.subscribe('videos').subscribe();
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
