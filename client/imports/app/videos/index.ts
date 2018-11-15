import { VideosListComponent } from './videos-list.component';
// import { PartyDetailsComponent } from './party-details.component';
import { PlayerComponent } from "./player.component";
import { PlayerCurrentListComponent } from "./player-current-list.component";
import { PlayListsDialog } from './playlists-dialog.component';
import { PlayListsAddChooseDialog } from './playlists-add-choose-dialog.component';

export const VIDEOS_DECLARATIONS = [
  VideosListComponent,
  PlayerComponent,
  PlayerCurrentListComponent
];

export const VIDEOS_DECLARATIONS_MODALS = [
	PlayListsDialog,
  PlayListsAddChooseDialog
];

// TODO : enlever le videoFormComponent
