import { Component, OnInit, OnDestroy, NgZone, Inject, ViewChild, TemplateRef } from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MatDialog, MatDialogRef, MatDialogConfig, MAT_DIALOG_DATA} from '@angular/material';


import 'rxjs/add/operator/combineLatest';

// import { VideosMetas } from '../../../../both/collections/video-meta.collection';
// import { VideoMeta } from '../../../../both/models/video-meta.model';
import { PlayLists } from '../../../../both/collections/playlists.collection';
import { Videos } from '../../../../both/collections/videos.collection';
import { VideosMetas } from '../../../../both/collections/video-meta.collection';
import { PlayListsUsers } from '../../../../both/collections/playlists-users.collection';

import { PlayList } from '../../../../both/models/playlist.model';
import { PlayListUser } from '../../../../both/models/playlist-user.model';
import { VideoMeta } from '../../../../both/models/video-meta.model';
import { Video } from '../../../../both/models/video.model';

import { User } from '../../../../both/models/user.model';

@Component({
  selector: 'playlists-add-choose-dialog',
  styles: ['./playlists-dialog.component.scss'],
  templateUrl: './playlists-add-choose-dialog.component.html'
})
export class PlayListsAddChooseDialog implements OnInit, OnDestroy{
  actionsAlignment: string;
	user: User;
	loggedUser: User;

  playlistsUsers: Observable<PlayList[]>;
  currentPlayListUser: Observable<PlayListUser[]>;

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
      this.currentPlayListUser = PlayListsUsers.find({user: this.user._id});

      this.currentPlayListUser.subscribe(list => {
        if(list === undefined){
          return;
        }

        let playUser: PlayListUser = list[0];

        if(playUser === undefined){
          return;
        }
        this.currentPlayListId = playUser.currentPlaylist;
      });
    });

    this.selectPlayList = this.formBuilder.group({
      playlist: ['', Validators.required]
		});

    // this.addForm = this.formBuilder.group({
    //   name: ['', Validators.required],
    //   description: [],
    //   location: ['', Validators.required],
    //   public: [false]
    // });
  }

  ngOnDestroy() {
    this.playListSubs.unsubscribe();
    this.playListUsersSub.unsubscribe();
  }

  selectPlayListFunction(): void {
		if(this.selectPlayList.valid){
      Meteor.call("addVideoToPlaylist", this.currentPlayListId, this.videoToAdd._id);
		}
	}
}
