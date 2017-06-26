import { Meteor } from 'meteor/meteor';

export class UserCreation {
  email: string;
  username: string;

  constructor(email: string, username: string){
    this.email = email;
    this.username = username;
  }
}
