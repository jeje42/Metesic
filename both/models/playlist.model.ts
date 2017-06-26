import { CollectionObject } from './collection-object.model';
import { VideoMeta } from './video-meta.model';

export class PlayList implements CollectionObject {
  name: string;
  description: string;
  owner?: string;
  public: boolean;
  list?: string[];

  // constructor(name: string, description: string, isPublic: boolean){
  //   this.name = name;
  //   this.description = description;
  //   this.public = isPublic;
  // }

  constructor(name: string, description: string, owner: string, isPublic: boolean, list: string[]){
    this.name = name;
    this.description = description;
    this.owner = owner;
    this.public = isPublic;
    this.list = list;
  }
}
