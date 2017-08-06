//Following https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination
import { Component, OnInit, OnDestroy, NgZone, Inject, ViewChild, TemplateRef } from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { Observable, Subject, Subscription, BehaviorSubject } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MdDialog, MdDialogRef, MdDialogConfig, MD_DIALOG_DATA} from '@angular/material';


import 'rxjs/add/operator/combineLatest';

import { VideosMetas } from '../../../../both/collections/video-meta.collection';
import { PlayLists } from '../../../../both/collections/playlists.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { PlayListsUsers } from '../../../../both/collections/playlists-users.collection';

import { PlayListUser } from '../../../../both/models/playlist-user.model';
import { VideoMeta } from '../../../../both/models/video-meta.model';
import { Category } from '../../../../both/models/category.model';
import { PlayList } from '../../../../both/models/playlist.model';

import { PlayListsAddChooseDialog } from './playlists-add-choose-dialog.component';

import template from './videos-list.component.html';
import style from './videos-list.component.scss';

@Component({
  selector: 'videos-list',
  template,
  styles: [ style ]
})
@InjectUser('user')
export class VideosListComponent implements OnInit, OnDestroy {
  nbVideosMetas: number;
  videosMetas: Observable<VideoMeta[]>;
  categories: Observable<Category[]>;
  currentPlayListUser: Observable<PlayListUser[]>;

  disabledCategories: string[];

  searchRegEx: any;

  /**
   * The current playlist for the logged user.
   */
  currentPlaylist: string;

  user: Meteor.User;

  videosMetasSub: Subscription;
  videosSubs: Subscription;
  categoriesSub: Subscription;
  playListsSub: Subscription;
  playListsUsersSub: Subscription;

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

  /**
   * For the pagination to work.
   */
  p: number = 1;
  nbVideosMeta: number;
  /**
   * End For the pagination to work.
   */

  @ViewChild(TemplateRef) template: TemplateRef<any>;

  constructor(public dialog: MdDialog, @Inject(DOCUMENT) doc: any) {
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
    this.disabledCategories = [];

    this.searchRegEx = {
      '$regex': '',
      '$options': 'i'
    };

    this.categoriesSub = MeteorObservable.subscribe('categories').subscribe(() => {
      this.categories = Categories.find({},{
        sort: {
					name: 0
				}
      }).zone();


    });

    this.videosSubs = MeteorObservable.subscribe('videos').subscribe();

    this.videosMetasSub = MeteorObservable.subscribe('videosMetas').subscribe(() => {
      this.updateListedVideos();
	  });

	  this.playListsSub = MeteorObservable.subscribe('playLists', {}).subscribe();

    this.playListsUsersSub = MeteorObservable.subscribe('playlistsUsers').subscribe(() => {
      // let currentPlayListObject = PlayListsUsers.findOne({user: this.user._id});
      // if(currentPlayListObject != undefined){
      //   this.currentPlaylist = currentPlayListObject.currentPlaylist;
      // }
      this.currentPlayListUser = PlayListsUsers.find({user: this.user._id});

      this.currentPlayListUser.subscribe(listPlayListUser => {
        let playlistUser: PlayListUser = listPlayListUser[0];
        if(playlistUser === undefined){
          return;
        }
        if(this.currentPlaylist != playlistUser.currentPlaylist){
          this.currentPlaylist = playlistUser.currentPlaylist;
        }
      });
    });
  }

  removeVideo(video: VideoMeta): void {
    Meteor.call('removeVideo',video);
  }

  isOwner(video: VideoMeta): boolean {
    return this.user && this.user._id === video.owner;
  }

  addToCurrentPlayList(videoMeta: VideoMeta): void {
    console.log("currentPlaylist before addToCurrentPlayList : " + this.currentPlaylist);
    if(this.currentPlaylist === undefined || this.currentPlaylist === null){
      let playListUser: PlayListUser = PlayListsUsers.findOne({user: this.user._id});


      // console.log("addToCurrentPlayList before : " + this.currentPlaylist + " ; " + playListUser + " ; " + playListUser.currentPlaylist);
      if(playListUser === undefined || playListUser === null || playListUser.currentPlaylist === undefined || playListUser.currentPlaylist === null){
        console.log("addToCurrentPlayList inserting playlist !");
        Meteor.call('addPlayList',
        new PlayList(this.user.username + "'s playlist'", "Default playlist for user " + this.user.username, this.user._id, false, [videoMeta._id]),
        true);
        // PlayLists.find({owner: this.user._id}).subscribe(list => {
        //   if(list === undefined){
        //     return;
        //   }
        //   for(let i=0; i<list.length; i++){
        //     if(("Default playlist for user " + this.user.username) === list[i].description){
        //       this.currentPlaylist = list[i]._id;
        //       Meteor.call("setPlayListToPlayListUser", this.currentPlaylist);
        //       Meteor.call("addVideoToPlaylist", this.currentPlaylist, videoMeta._id);
        //     }
        //   }
        // });
      } else {
        this.currentPlaylist = playListUser.currentPlaylist;
        Meteor.call("addVideoToPlaylist", this.currentPlaylist, videoMeta._id);
      }
    }else{
      Meteor.call("addVideoToPlaylist", this.currentPlaylist, videoMeta._id);
    }
  }

  deleteVideo(videoMeta: VideoMeta) : void {
    Meteor.call('deleteVideo', videoMeta);
  }

  search(newValue: string): void{
    this.searchRegEx = {
      '$regex': newValue,
      '$options': 'i'
    };

    this.updateListedVideos();
  }

  changeCategory(category: Category) : void {
    if(this.disabledCategories.indexOf(category._id) === -1){
      this.disabledCategories.push(category._id);
    }else{
      this.disabledCategories.splice(this.disabledCategories.indexOf(category._id),1);
    }
    this.updateListedVideos();
  }

  updateListedVideos(): void {
    MeteorObservable.call('countVideosMeta', this.searchRegEx, this.disabledCategories).subscribe((videosMetasCount: number) => {
      var objectResearch = [];
			objectResearch.push({name: this.searchRegEx});
			if(!this.disabledCategories){
				objectResearch.push({categories: {$elemMatch: {$in : this.disabledCategories}}});
			}
      this.nbVideosMeta = videosMetasCount;
      this.videosMetas = VideosMetas.find({$and: objectResearch});
    });
  }

  ngOnDestroy() {
    this.videosMetasSub.unsubscribe();
  	this.videosSubs.unsubscribe();
  	this.playListsSub.unsubscribe();
    this.playListsUsersSub.unsubscribe();
    this.categoriesSub.unsubscribe();
  }

  openEditPlayLists(video: VideoMeta) {
    let dialogRef = this.dialog.open(PlayListsAddChooseDialog, this.config);
    // dialogRef.componentInstance.actionsAlignment = this.actionsAlignment;
		dialogRef.componentInstance.user = Meteor.user();
		dialogRef.componentInstance.loggedUser = this.user;
    dialogRef.componentInstance.videoToAdd = video;
	}
}
