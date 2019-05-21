import { Component, OnInit, OnDestroy, NgZone, Inject, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material';


import 'rxjs/add/operator/combineLatest';

import { PlayLists } from '../../../../both/collections/playlists.collection';
import { PlayListsUsers } from '../../../../both/collections/playlists-users.collection';

import { PlayList } from '../../../../both/models/playlist.model';
import { PlayListUser } from '../../../../both/models/playlist-user.model';
import { VideoMeta } from '../../../../both/models/video-meta.model';

import { User } from '../../../../both/models/user.model';

@Component({
  selector: 'playlists-add-choose-dialog',
  templateUrl: './playlists-add-choose-dialog.component.html'
})
export class PlayListsAddChooseDialog implements OnInit, OnDestroy{
  actionsAlignment: string;
	user: User;
	loggedUser: User;

  playlistsUsers: Observable<PlayList[]>;

  currentPlayListId: string;

  playListSubs: Subscription;
  playListUsersSub: Subscription;

  selectPlayList: FormGroup;
  videoToAdd: VideoMeta;

  constructor(public dialog: MatDialog, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.playListSubs = MeteorObservable.subscribe('playLists', {}).subscribe(() => {
      this.playlistsUsers = PlayLists.find({owner : this.user._id});
    });

    this.playListUsersSub = MeteorObservable.subscribe('playlistsUsers', {}).subscribe(() => {
      PlayListsUsers.find({user: this.user._id, active: true}).subscribe(list => {
        if(list === undefined){
          return;
        }

        let playUser: PlayListUser = list[0];

        if(playUser === undefined){
          return;
        }
        this.currentPlayListId = playUser.playlist;
      });
    });

    this.selectPlayList = this.formBuilder.group({
      playlist: ['', Validators.required]
		});
  }

  ngOnDestroy() {
    this.playListSubs.unsubscribe();
    this.playListUsersSub.unsubscribe();
  }

  selectPlayListFunction(): void {
		if(this.selectPlayList.valid){
      Meteor.call("addVideosToPlaylist", this.currentPlayListId, this.videoToAdd._id);
		}
	}
}
