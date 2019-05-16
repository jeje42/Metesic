import { Component, OnInit, OnDestroy, NgZone, Inject, ViewChild, TemplateRef } from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MatDialog, MatDialogRef, MatDialogConfig} from '@angular/material';


import 'rxjs/add/operator/combineLatest';

import { PlayLists } from '../../../../both/collections/playlists.collection';
import { PlayListsUsers } from '../../../../both/collections/playlists-users.collection';

import { PlayList } from '../../../../both/models/playlist.model';
import { PlayListUser } from '../../../../both/models/playlist-user.model';
import { VideoMeta } from '../../../../both/models/video-meta.model';

import { PlayListsDialog } from './playlists-dialog.component';

import { DisplayVideoPlayListPipe } from '../shared/display-video-playlist.pipe';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styles: [ './player.component.scss' ]
})
@InjectUser('user')
export class PlayerComponent implements OnInit, OnDestroy {
  currentPlaylist: Observable<PlayList[]>;
  currentPlayListUser: Observable<PlayListUser[]>;

  currentPlaylistId: string;
  currentPlaylistUserId: string;

  user: Meteor.User;
  videoReading: VideoMeta;
  playlistSelected: boolean;

  playListsSub: Subscription;
  videosSubs: Subscription;
  videosMetaSubs: Subscription;
  currentPlayListSubs: Subscription;
  videosUsersSub: Subscription

  actionsAlignment: string;
  /**
   * Config for the playlists's modal.
   */
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

  biasWidth: number = 50

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
    this.playlistSelected = false;
    this.videoReading = undefined;
    if(!Meteor.user()){
      return;
    }

	  this.videosSubs = MeteorObservable.subscribe('videos').subscribe();

    this.videosMetaSubs = MeteorObservable.subscribe('videoMeta').subscribe();

    this.videosUsersSub = MeteorObservable.subscribe('videosUsers', {}).subscribe();

    this.playListsSub = MeteorObservable.subscribe('playLists', {}).subscribe();

    this.currentPlayListSubs = MeteorObservable.subscribe('playlistsUsers').subscribe(() => {
      if(Meteor.user() === undefined){
        return;
      }
      this.currentPlayListUser = PlayListsUsers.find({user: Meteor.user()._id});

      this.currentPlayListUser.subscribe(listPlayListUser => {
        this.initVideosPlayListId(listPlayListUser)

          var playListUser: PlayListUser = PlayListsUsers.findOne({user: Meteor.user()._id});
          if(playListUser === undefined){
            return;
          }
      });
    });
  }

	ngOnDestroy() {
    if(Meteor.user()){
      this.playListsSub.unsubscribe()
  		this.videosSubs.unsubscribe()
      this.videosMetaSubs.unsubscribe()
      this.currentPlayListSubs.unsubscribe();
      this.videosUsersSub.unsubscribe();
    }
	}

  /**
   * initVideosPlayListId - called when the client receives the PlayListsUsers data.
   *
   * @param  {type} playListId: PlayListUser[] description
   * @return {type}                            description
   */
  initVideosPlayListId(playListId: PlayListUser[]){
    if(playListId === undefined || playListId.length === 0){
      return false;
    }
    let playlistChanged:boolean = (this.currentPlaylistId != playListId[0].currentPlaylist)

    this.currentPlaylistUserId = playListId[0]._id
    this.currentPlaylistId = playListId[0].currentPlaylist;

    this.currentPlaylist = PlayLists.find({_id: this.currentPlaylistId})
    this.currentPlaylist.subscribe(list => {
      if(list.length >0){
        this.playlistSelected = true;
      }else{
        this.playlistSelected = false;
      }
    });


    return playlistChanged
  }

  deleteCurrentPlayList(playlist: PlayList){
    let videoContainer = document.getElementById("videoContainer");
    if(videoContainer){
      let playListsUsers: PlayListUser =  PlayListsUsers.findOne({user: Meteor.userId()});
      PlayListsUsers.update({_id: playListsUsers._id}, {$set : {currentVideo: null, currentTime: 0}}).subscribe(number => {
        console.error("PlayListsUsers update : " + number)
      });
    }
		var playListUser = PlayListsUsers.findOne({user: Meteor.user()._id});
		if(playListUser && playlist && playListUser.currentPlaylist === playlist._id){
			PlayListsUsers.update({_id: playListUser._id}, {$set : {currentPlaylist: null}}).subscribe((number) => {
				console.error("Modifs : " + number)
			})
		}
		PlayLists.remove(playlist._id);
  }

  clearCurrentPlayList(playlist: PlayList){
    PlayLists.update(playlist._id, {$set: {list: []}});
  }


  /**
   * openEditPlayLists - Opens the playlist editor popup.
   *
   * @return {type}  description
   */
  openEditPlayLists() {
    let dialogRef = this.dialog.open(PlayListsDialog, this.config);
    dialogRef.componentInstance.actionsAlignment = this.actionsAlignment;
		dialogRef.componentInstance.user = Meteor.user();
		dialogRef.componentInstance.loggedUser = Meteor.user();
	}

  enlargerPlayer(){
    this.commonReduceEnlarge(false)
  }

  reducePlayer(){
    this.commonReduceEnlarge(true)
  }

  commonReduceEnlarge(reduce:boolean){
    let videoTag = document.getElementById("singleVideo")
    let width:number = Number(videoTag.width) + (reduce?-1:1) * this.biasWidth
    let height:number = this.getHeightFromWidth(width)

    videoTag.width = width
    videoTag.height = height
  }

  getHeightFromWidth(width:number){
    return width*9/16
  }
}
