import { CollectionObject } from './collection-object.model';

export interface PlayListUser extends CollectionObject {
  user: string;
  currentPlaylist: string;
}
