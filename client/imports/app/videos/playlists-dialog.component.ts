import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import {MatDialog} from '@angular/material';


import 'rxjs/add/operator/combineLatest';

import { PlayLists } from '../../../../both/collections/playlists.collection';
import { PlayListsUsers } from '../../../../both/collections/playlists-users.collection';

import { PlayList } from '../../../../both/models/playlist.model';
import { PlayListUser } from '../../../../both/models/playlist-user.model';

import { User } from '../../../../both/models/user.model';

@Component({
  selector: 'playlists-dialog',
  styleUrls: ['./playlists-dialog.component.scss'],
  templateUrl: './playlists-dialog.component.html'
})
export class PlayListsDialog implements OnInit, OnDestroy{
  actionsAlignment: string;
	user: User;
	loggedUser: User;

  playlistsUsers: Observable<PlayList[]>;

  currentPlayListId: string;

  playListSubs: Subscription;
  playListUsersSub: Subscription;

  addPlayList: FormGroup;

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

    this.addPlayList = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      public: [false]
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

  selectPlayListFunction(){
    Meteor.call('setPlayListToPlayListUser', this.currentPlayListId);
  }

  addPlayListFunction(): void {
		if(this.addPlayList.valid){
			Meteor.call('addPlayList', new PlayList(
        this.addPlayList.value.name,
        this.addPlayList.value.description,
        this.user._id,
        this.addPlayList.value.public,
        []), false);
		}
		this.addPlayList.reset();
	}
}
