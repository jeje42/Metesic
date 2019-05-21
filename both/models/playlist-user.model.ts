import { CollectionObject } from './collection-object.model';

export interface PlayListUser extends CollectionObject {
  user: string;
  playlist: string;
  currentPosition: number;
  active: boolean;
}
