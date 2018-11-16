import { Component, OnInit, OnDestroy, Inject, ViewChild, TemplateRef  } from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material';

import 'rxjs/add/operator/combineLatest';

import { Folders } from '../../../../both/collections/folders.collection';
import { Folder } from '../../../../both/models/folder.model';
import { FoldersTreatments } from '../../../../both/collections/folder-treatment.collection';
import { FolderTreatment } from '../../../../both/models/folder-treatment.model';
import { ProgressionDialog } from './progression-dialog.component';


@Component({
	selector: 'settings-folders',
	templateUrl : './settings-folders.component.html',
	styleUrls: ['./settings-folders.component.scss']
})
@InjectUser('user')
export class SettingsFoldersComponent implements OnInit, OnDestroy {
	current: Observable<Folder[]>;
	folders: Observable<Folder[]>;
	files: Observable<Folder[]>;

	foldersSub: Subscription;
	videosSub: Subscription;
	folderTreatment: Subscription;
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

	actionsAlignment: string;
  /**
   * Config for the playlists's modal.
   */
  config: MatDialogConfig = {
    disableClose: true,
    hasBackdrop: true,
    backdropClass: '',
    width: '80%',
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
	statusTreatment: number;
	textProgression: string;
	dialogRef: any;

	@ViewChild(TemplateRef) template: TemplateRef<any>;

	constructor(public dialog: MatDialog, @Inject(DOCUMENT) doc: any){
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
		let initPath = Meteor.settings.public.pathSettings
		console.log("initPath : " + initPath)
		if(!initPath){
			initPath = "/home/jeje"
		}


		this.initModalListening()
		this.initDirectory(initPath);
	}

	ngOnDestroy() {
		this.foldersSub.unsubscribe();
		this.videosSub.unsubscribe();
	}

	initModalListening() {
		this.folderTreatment = MeteorObservable.subscribe('folderTreatment').subscribe(() => {
			let folderTreatment = FoldersTreatments.find();

			folderTreatment.subscribe(list => {
				let treatment: FolderTreatment = list[0]
				if(treatment){
					this.statusTreatment = treatment.status
					this.textProgression = treatment.currentFile
				}
				if(this.statusTreatment>0){
					this.openProgression()
				}else{
					this.closeProgression()
				}
			})
		});
	}

	initDirectory(currentFolder: string): void {
		Meteor.call('scanFolderBeginning', currentFolder, 1);

		this.currentFolder = currentFolder;

		this.foldersSub = MeteorObservable.subscribe('folders').subscribe(() => {
			this.current = Folders.find({ path: currentFolder });

			this.folders = Folders.find({ father: currentFolder, isFolder: true },{
        sort: {
          path: 1
        }
			});

			this.files = Folders.find({ father: currentFolder, isFolder: false },{
        sort: {
          path: 1
        }
			});
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

	openProgression() {
		if(!this.dialogRef){
			this.dialogRef = this.dialog.open(ProgressionDialog, this.config)
			this.dialogRef.componentInstance.actionsAlignment = this.actionsAlignment
			this.dialogRef.componentInstance.user = Meteor.user()
			this.dialogRef.componentInstance.loggedUser = this.user
		}

		this.dialogRef.componentInstance.statusTreatment = this.statusTreatment
		this.dialogRef.componentInstance.textProgression = this.textProgression
	}

	closeProgression() {
		this.dialog.closeAll()
		this.dialogRef = undefined;
	}
}
