import { Component, OnInit, OnDestroy, NgZone, Inject, ViewChild, TemplateRef } from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MdDialog, MdDialogRef, MdDialogConfig, MD_DIALOG_DATA} from '@angular/material';


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

import { PlayListsDialog } from './playlists-dialog.component';

import template from './player.component.html';
import style from './player.component.scss';
import templatePopup from './playlists-dialog.component.html'

@Component({
  selector: 'player',
  template,
  styles: [ style ]
})
@InjectUser('user')
export class PlayerComponent implements OnInit, OnDestroy {
  listVideosPlayList: Observable<VideoMeta[]>;
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

  constVideoMetaId: string;

  actionsAlignment: string;
  /**
   * Config for the playlists's modal.
   */
  config: MdDialogConfig = {
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

  constructor(private zone: NgZone,	private formBuilder: FormBuilder,public dialog: MdDialog, @Inject(DOCUMENT) doc: any) {
    // Possible useful example for the open and closeAll events.
    // Adding a class to the body if a dialog opens and
    // removing it after all open dialogs are closed
    dialog.afterOpen.subscribe((ref: MdDialogRef<any>) => {
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
    this.constVideoMetaId = "playlist";

	  this.videosSubs = MeteorObservable.subscribe('videos').subscribe();

    this.videosMetaSubs = MeteorObservable.subscribe('videoMeta').subscribe();

    this.currentPlayListSubs = MeteorObservable.subscribe('playlistsUsers').subscribe(() => {
      if(this.user === undefined){
        return;
      }
      this.currentPlayListUser = PlayListsUsers.find({user: this.user._id});

      this.currentPlayListUser.subscribe(listPlayListUser => this.initVideosPlayListId(listPlayListUser));

    });

	  this.playListsSub = MeteorObservable.subscribe('playLists', {}).subscribe();
  }

	ngOnDestroy() {
		this.playListsSub.unsubscribe();
		this.videosSubs.unsubscribe();
    this.videosMetaSubs.unsubscribe();
	}

  initVideosPlayListId(playListId: PlayListUser[]){
    console.log("initVideosPlayListId : " + playListId[0].currentPlaylist);
    if(playListId === undefined || playListId.length === 0){
      return;
    }
    this.currentPlaylistId = playListId[0].currentPlaylist;
    this.currentPlaylist = PlayLists.find({_id: this.currentPlaylistId}).zone();

    this.currentPlaylist.subscribe(listPlayList => this.initVideosPlaylistObject(listPlayList));
  }



  /**
   * initVideosPlaylistObject - description
   *
   * @param  {type} playLists: PlayList[] description
   * @return {type}                       description
   */
  initVideosPlaylistObject(playLists: PlayList[]){
    if(playLists[0] === undefined || playLists[0]._id != this.currentPlaylistId){
      return;
    }
    var videosMetaIds = playLists[0].list;
    this.listVideosPlayList = VideosMetas.find({_id: {$in : videosMetaIds}}).zone();
  }

  setIdVideoPlaylist(video: VideoMeta){
    return this.constVideoMetaId + video._id;
  }

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

    let videoContainer = document.getElementById("videoContainer");
    let videoTag = document.getElementById("singleVideo");
    if(videoTag === undefined || videoTag === null){
      videoTag = document.createElement("video");
      videoTag.setAttribute('controls', "true");
      videoTag.setAttribute('autoplay', "true");
      videoTag.setAttribute('id',"singleVideo");
      videoTag.setAttribute('type',"video/mp4");

      videoContainer.appendChild(videoTag);
    }

	  videoTag.setAttribute('src', found.url);

    this.setStyleListVideoPlaying(video, true);
}

  setStyleListVideoPlaying(video: VideoMeta, styleOn: boolean){
    const style = "videoPlaying";
    let videoListContainer = document.getElementById(this.constVideoMetaId + video._id);
    if(styleOn) {
      videoListContainer.setAttribute("class", videoListContainer.getAttribute("class") + " " + style);
      if(this.videoReading != undefined){
        this.setStyleListVideoPlaying(this.videoReading, false);
      }
      this.videoReading = video;
    } else {
      let oldAttribute = videoListContainer.getAttribute("class");
      let before = oldAttribute.substring(0, oldAttribute.indexOf(style));
      let after = oldAttribute.substring(oldAttribute.indexOf(style) + style.length, oldAttribute.length);
      let newClass = before + " " + after;
      videoListContainer.setAttribute("class", newClass);
    }
  }

  removeVideoPlaylist(videoMeta: VideoMeta, playList: PlayList):void {
    PlayLists.update({_id: playList._id}, {$pull: {list: videoMeta._id}});
  }

  deleteCurrentPlayList(playlist: PlayList){
    Meteor.call('removePlayList', playlist._id);
  }

  openEditPlayLists() {
    let dialogRef = this.dialog.open(PlayListsDialog, this.config);
    dialogRef.componentInstance.actionsAlignment = this.actionsAlignment;
		dialogRef.componentInstance.user = Meteor.user();
		dialogRef.componentInstance.loggedUser = this.user;
	}
}
