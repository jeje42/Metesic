//Following https://angular-meteor.com/tutorials/whatsapp2/ionic/filter-and-pagination
import { Component, OnInit, OnDestroy, Inject, ViewChild, TemplateRef } from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";
import {MatDialog, MatDialogRef, MatDialogConfig} from '@angular/material';


import 'rxjs/add/operator/combineLatest';

import { VideosMetas } from '../../../../both/collections/video-meta.collection';
import { Categories } from '../../../../both/collections/categories.collection';
import { PlayListsUsers } from '../../../../both/collections/playlists-users.collection';

import { PlayListUser } from '../../../../both/models/playlist-user.model';
import { VideoMeta } from '../../../../both/models/video-meta.model';
import { Category } from '../../../../both/models/category.model';
import { PlayList } from '../../../../both/models/playlist.model';
import { VideoPlayList } from '../../../../both/models/video-playlist.model';


import { PlayListsAddChooseDialog } from './playlists-add-choose-dialog.component';

@Component({
  selector: 'videos-list',
  templateUrl: './videos-list.component.html',
  styleUrls:  [ './videos-list.component.scss' ]
})
@InjectUser('user')
export class VideosListComponent implements OnInit, OnDestroy {
  nbVideosMetas: number;
  isSearch: boolean;
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

  subscriptionsDone: boolean

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

  /**
   * For the pagination to work.
   */
  p: number = 1;
  nbVideosMeta: number;
  /**
   * End For the pagination to work.
   */

  @ViewChild(TemplateRef) template: TemplateRef<any>;

  constructor(public dialog: MatDialog, @Inject(DOCUMENT) doc: any) {
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
    if(!Meteor.userId()){
      this.subscriptionsDone = false
      return
    }else{
      this.subscriptionsDone = true
    }
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
      });


    });


    this.videosSubs = MeteorObservable.subscribe('videos').subscribe();

    this.videosMetasSub = MeteorObservable.subscribe('videosMetas').subscribe(() => {
      this.updateListedVideos();
	  });

	  this.playListsSub = MeteorObservable.subscribe('playLists', {}).subscribe();

    this.playListsUsersSub = MeteorObservable.subscribe('playlistsUsers').subscribe(() => {
      this.currentPlayListUser = PlayListsUsers.find({user: Meteor.user()._id});

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

  addToCurrentPlayList(videoMetaId: string): void {
    let lVideoMetaId: string[] = [videoMetaId]
    this.addListToCurrentPlayList(lVideoMetaId)
  }

  addVideosOnPage(){
    let lVideoMetaId: string[] = []

    Array.from(document.getElementsByClassName("idVideoOnPage")).forEach(function(item) {
       lVideoMetaId.push(item.value)
    });

    this.addListToCurrentPlayList(lVideoMetaId)
  }

  addListToCurrentPlayList(lVideoMetaId: string[]): void {
    if(this.currentPlaylist === undefined || this.currentPlaylist === null){
      let playListUser: PlayListUser = PlayListsUsers.findOne({user: this.user._id});

      if(playListUser === undefined || playListUser === null || playListUser.currentPlaylist === undefined || playListUser.currentPlaylist === null){
        let lVideoPlayList: VideoPlayList[] = []
        lVideoMetaId.forEach(videoMetaId => {
          lVideoPlayList.push({
            id_videoMeta: videoMetaId,
            date : new Date()
          })
        })

        Meteor.call('addPlayList',
          new PlayList(this.user.username + "'s playlist'",
            "Default playlist for user " + this.user.username,
            this.user._id,
            false,
            lVideoPlayList
          ),
        true);
      } else {
        this.currentPlaylist = playListUser.currentPlaylist;
        Meteor.call("addVideosToPlaylist", this.currentPlaylist, lVideoMetaId);
      }
    }else{
      Meteor.call("addVideosToPlaylist", this.currentPlaylist, lVideoMetaId);
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
      var objectResearch = []
      objectResearch.push({name: this.searchRegEx})

      this.isSearch = false

      if(this.searchRegEx.$regex && this.searchRegEx.$regex != ""){
        this.isSearch = true
      }

			if(this.disabledCategories != undefined && this.disabledCategories.length > 0){
				objectResearch.push({categories: {$elemMatch: {$in : this.disabledCategories}}})
        this.isSearch = true


			}

      if(this.isSearch){
        this.videosMetas = VideosMetas.find({$and: objectResearch})
      }else{
        this.videosMetas = VideosMetas.find({$and: objectResearch}, {limit: 10})
      }

      this.videosMetas.subscribe(list => {
        this.nbVideosMeta = list.length
      })
    });
  }

  ngOnDestroy() {
    if(this.subscriptionsDone){
      this.videosMetasSub.unsubscribe();
    	this.videosSubs.unsubscribe();
    	this.playListsSub.unsubscribe();
      this.playListsUsersSub.unsubscribe();
      this.categoriesSub.unsubscribe();
    }
  }

  openEditPlayLists(video: VideoMeta) {
    let dialogRef = this.dialog.open(PlayListsAddChooseDialog, this.config);
    // dialogRef.componentInstance.actionsAlignment = this.actionsAlignment;
		dialogRef.componentInstance.user = Meteor.user();
		dialogRef.componentInstance.loggedUser = this.user;
    dialogRef.componentInstance.videoToAdd = video;
	}
}
