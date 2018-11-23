import { Observable } from 'rxjs/Observable';

import { VideosStore } from '../collections/videos.collection';
import { Users } from '../collections/users.collection'
import { UsersAdmin } from '../collections/users-admin.collection'

import { UserCreation } from '../models/user-creation.model';
import { User } from '../models/user.model';
import { UserAdmin } from '../models/user-admin.model'

Meteor.methods({
  addUserWithoutLogin(userCreation: UserCreation){
    if(Meteor.isServer){
      // var future = new Future();

      var returnValue:string = Accounts.createUser({
          email: userCreation.email,
  				username: userCreation.username
        });
        // , (err) => {
        //   if (err) {
        //     this.zone.run(() => {
        //       this.error = err;
        //     });
        //   } else {
        //     //logger.info(this.addUser.value.Semail + " created !");
        //   }
        // });
      // future["return"](returnValue);
      // console.log("Wait to return value : " + returnValue);
      // return future.wait();
      // console.log("#addUserWithoutLogin returnValue : " + returnValue);
      return {value: returnValue};
    }
  },
  deleteUser(userId:string){
    if(Meteor.isServer){
      let value = Meteor.users.remove({_id: userId});
      return {value: value};
    }
  },
  setAdminAlone(userId:string, loggedUserId:string){
    if(Meteor.isServer){
      //logger.info("#setAdminAlone ; for " + userId + " with logged user " + loggedUserId);

      let isLoggedadmin:UserAdmin = UsersAdmin.findOne({userId: loggedUserId});
      if(isLoggedadmin === undefined){
        //logger.info("setAdminAlone ; user " + loggedUserId + " is not already an admin");
        setTimeout(function() {
            throw new Meteor.Error( 403, 'The logged user is not an admin !' );
        }, 0);
      }else{
        let removeOk : Observable<number> = UsersAdmin.remove({userId: loggedUserId});
        removeOk.subscribe(number => {
          console.log("After remove : " + number);
          if(number === 1){
            console.log("insert + " + userId + " as admin.");
            UsersAdmin.insert({userId: userId});
          }else{
            setTimeout(function() {
                throw new Meteor.Error( 403, 'Cannot remove the previous admin from the database !' );
            }, 0);
          }
        })

      }
    }
  },
  changePasswordWithoutLogin(userId:string, password:string, loggedUserId: string){
    if(Meteor.isServer){
      let admin:UserAdmin = UsersAdmin.findOne({userId: loggedUserId});
      if(admin === undefined){
        throw new Meteor.Error('403', 'The loggedIn user is not admin !');
      }
      Accounts.setPassword(userId, password);
    }
  }
});
