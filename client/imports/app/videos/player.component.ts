import { Component, OnInit, OnDestroy, NgZone, Inject, ViewChild, TemplateRef } from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { interval } from 'rxjs';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MatDialog, MatDialogRef, MatDialogConfig} from '@angular/material';


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
import { VideoPlayList } from '../../../../both/models/video-playlist.model';

import { PlayListsDialog } from './playlists-dialog.component';

@Component({
  selector: 'player',
  templateUrl: './player.component.html',
  styles: [ './player.component.scss' ]
})
@InjectUser('user')
export class PlayerComponent implements OnInit, OnDestroy {
  listVideosPlayList: VideoPlayList[];
  currentPlaylist: Observable<PlayList[]>;
  currentPlayListUser: Observable<PlayListUser[]>;

  currentPlaylistId: string;

  user: Meteor.User;
  videoReading: VideoMeta;
  displayPlayer: boolean;
  displayVideo: boolean;

  playListsSub: Subscription;
  videosSubs: Subscription;
  videosMetaSubs: Subscription;
  currentPlayListSubs: Subscription;

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
    this.displayPlayer = false;
    this.displayVideo = false;
    this.videoReading = undefined;
    if(!this.user){
      return;
    }

	  this.videosSubs = MeteorObservable.subscribe('videos').subscribe();

    this.videosMetaSubs = MeteorObservable.subscribe('videoMeta').subscribe();

    this.currentPlayListSubs = MeteorObservable.subscribe('playlistsUsers').subscribe(() => {
      if(this.user === undefined){
        return;
      }
      this.currentPlayListUser = PlayListsUsers.find({user: this.user._id});

      this.currentPlayListUser.subscribe(listPlayListUser => {
        this.initVideosPlayListId(listPlayListUser);

        var playListUser: PlayListUser = PlayListsUsers.findOne({user: this.user._id});
          if(playListUser === undefined){
            return;
          }
            this.readVideo(VideosMetas.findOne({_id: playListUser.currentVideo}));
      });
    });

	  this.playListsSub = MeteorObservable.subscribe('playLists', {}).subscribe();

    // if(Meteor.isClient){
    //   setInterval(() => {
    //     var videoTag = document.getElementById("singleVideo");
    //     if(videoTag != undefined){
    //       console.log('setCurrentTime' +  videoTag.currentTime)
    //       // PlayListsUsers.update({_id: this.currentPlayListUser._id}, {$set : {currentTime: videoTag.currentTime}});
    //       Meteor.call('setCurrentTime', videoTag.currentTime);
    //     }
    //   }, 5000);
    // }

    var counter = interval(1000)
    counter.subscribe(
      data => {
        var videoTag = document.getElementById("singleVideo");
        if(videoTag != undefined){
          Meteor.call('setCurrentTime', videoTag.currentTime);
        }
      }
    );
  }

	ngOnDestroy() {
    if(this.user){
      this.playListsSub.unsubscribe();
  		this.videosSubs.unsubscribe();
      this.videosMetaSubs.unsubscribe();
    }
	}

  // counter() {
  //   // return Observable.
  //   return Observable.interval(10000).flatMap(() => {
  //     return "u";
  //   });
  // }

  /**
   * initVideosPlayListId - called when the client receives the PlayListsUsers data.
   *
   * @param  {type} playListId: PlayListUser[] description
   * @return {type}                            description
   */
  initVideosPlayListId(playListId: PlayListUser[]){
    if(playListId === undefined || playListId.length === 0){
      return;
    }
    this.currentPlaylistId = playListId[0].currentPlaylist;
    this.currentPlaylist = PlayLists.find({_id: this.currentPlaylistId});

    this.currentPlaylist.subscribe(listPlayList => this.initVideosPlaylistObject(listPlayList));
  }



  /**
   * initVideosPlaylistObject - called when the client receives the PlayList data.
   *
   * @param  {type} playLists: PlayList[] description
   * @return {type}                       description
   */
  initVideosPlaylistObject(playLists: PlayList[]){
    if(playLists[0] === undefined || playLists[0]._id != this.currentPlaylistId){
      return;
    }
    this.listVideosPlayList = playLists[0].list;
  }

  videoPlayListToVideoMeta(videoPlayList: VideoPlayList){
    if(videoPlayList && videoPlayList.id_videoMeta){
      return VideosMetas.findOne({_id: videoPlayList.id_videoMeta});
    }
  }


	/**
	 * Called when the PlayListsUsers data changes.
	 */
	readVideo(video: VideoMeta): void {
		if (!video) {
      return;
    }

    const found = Videos.findOne(video.video);

    if (found === undefined) {
      return; //TODO : log error message
    }

    this.displayPlayer = true;
    this.displayVideo = true;

    // let videoContainer = document.getElementById("videoContainer");
    let videoTag = document.getElementById("singleVideo");
    // if(!videoTag){
    //   videoTag = document.createElement("video");
    //   videoTag.setAttribute('width', "800");
    //   videoTag.setAttribute('height', "450");
    //   videoTag.setAttribute('controls', "true");
    //   videoTag.setAttribute('autoplay', "true");
    //   videoTag.setAttribute('id',"singleVideo");
    //   videoTag.setAttribute('type',"video/mp4");
    //   videoTag.setAttribute('src', found.url);
    //   var playListUser:PlayListUser = PlayListsUsers.findOne({user: this.user._id});
    //   if(playListUser && playListUser.currentTime){
    //     videoTag.currentTime = playListUser.currentTime;
    //   }
    //   videoContainer.appendChild(videoTag);
    //   videoTag.pause();
    // }else{
    if(found.url != videoTag.getAttribute('src')){
      videoTag.setAttribute('src', found.url);
      var playListUser:PlayListUser = PlayListsUsers.findOne({user: Meteor.user()._id});
      if(playListUser){
        videoTag.currentTime = 0.000000;
      }
      videoTag.pause();
    }
    // }
}

  deleteCurrentPlayList(playlist: PlayList){
    let videoContainer = document.getElementById("videoContainer");
    if(videoContainer){
      // videoContainer.innerHTML = "";
      let playListsUsers: PlayListUser =  PlayListsUsers.findOne({user: Meteor.userId()});
      PlayListsUsers.update({_id: playListsUsers._id}, {$set : {currentVideo: null, currentTime: 0}}).subscribe(number => {
        console.error("PlayListsUsers update : " + number)
      });
    }
    var playlist: PlayList = PlayLists.findOne({_id: playlist._id});
		var playListUser = PlayListsUsers.findOne({user: Meteor.user()._id});
		if(playListUser && playlist && playListUser.currentPlaylist === playlist._id){
			PlayListsUsers.update({_id: playListUser._id}, {$set : {currentPlaylist: null}}).subscribe((number) => {
				console.error("Modifs : " + number)
			})
		}
		PlayLists.remove(playlist._id);
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
		dialogRef.componentInstance.loggedUser = this.user;
	}
}
