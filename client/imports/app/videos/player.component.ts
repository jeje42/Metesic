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
import { VideosUsers } from 'both/collections/videos-users.collection';
import { VideoUser } from 'both/models/video-user.model';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styles: [ './player.component.scss' ]
})
@InjectUser('user')
export class PlayerComponent implements OnInit, OnDestroy {
  currentPlaylist: PlayList;

  user: Meteor.User;
  videoReading: VideoMeta;
  playlistSelected: boolean;

  playListsSub: Subscription;
  videosSubs: Subscription;
  videosMetaSubs: Subscription;
  currentPlayListSubs: Subscription;
  videosUsersSub: Subscription

  playListUser: PlayListUser

  actionsAlignment: string;

  displaySkipPrevious: boolean;
  displaySkipNext: boolean;
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

      PlayListsUsers.find({user: Meteor.user()._id, active: true}).subscribe(listPlayListUser => {
        this.initVideosPlayListId(listPlayListUser)
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
  initVideosPlayListId(playListUserIds: PlayListUser[]): void{
    this.playListUser = playListUserIds[0]

    if(this.playListUser){
      this.initNavButtons()
    }


  }

  initNavButtons(): void{
    if(this.playListUser == undefined){
      return
    }

    PlayLists.find({_id: this.playListUser.playlist}).subscribe(list => {
      if(!list || list.length ==0 || list[0]._id !== this.playListUser.playlist){
        return
      }

      this.currentPlaylist = list[0]

      if(!this.currentPlaylist || this.playListUser.currentPosition == 0){
        this.displaySkipPrevious = false
      }else{
        this.displaySkipPrevious = true
      }

      if(this.currentPlaylist && this.playListUser.currentPosition < this.currentPlaylist.list.length-1){
        this.displaySkipNext = true
      }else{
        this.displaySkipNext = false
      }
    })
  }

  deleteCurrentPlayList(playlist: PlayList){
		var playListUser = PlayListsUsers.findOne({user: Meteor.user()._id, active: true});
		if(playListUser && playlist && playListUser.playlist === playlist._id){
			PlayListsUsers.remove({_id: playListUser._id})
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

  nextVideo(): void{
    const playListUser: PlayListUser = PlayListsUsers.findOne({user: Meteor.user()._id, active: true})

    const playlist = PlayLists.findOne({_id: playListUser.playlist})
    if(playListUser.currentPosition < playlist.list.length-1){
      const videoUser: VideoUser = VideosUsers.findOne({playListUserId: playListUser._id})
      VideosUsers.update({_id: videoUser._id},{$set : {currentTime: 0.000000}}).subscribe(() => {
        PlayListsUsers.update({_id: playListUser._id}, {$set: {currentPosition: playListUser.currentPosition+1}})
      })
    }
  }

  previousVideo(): void {
    const playListUser: PlayListUser = PlayListsUsers.findOne({user: Meteor.user()._id, active: true})

    const playlist = PlayLists.findOne({_id: playListUser.playlist})
    if(playListUser.currentPosition > 0){
      const videoUser: VideoUser = VideosUsers.findOne({playListUserId: playListUser._id})
      VideosUsers.update({_id: videoUser._id},{$set : {currentTime: 0.000000}}).subscribe(() => {
        PlayListsUsers.update({_id: playListUser._id}, {$set: {currentPosition: playListUser.currentPosition-1}})
      })
    }
  }
}
