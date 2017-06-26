import { UsersAdmin } from '../../../both/collections/users-admin.collection';
import { UserAdmin } from '../../../both/models/user-admin.model';

export function initAdmin(){
  var vari = UsersAdmin.find().cursor.count() ;
  console.log("vari : " + vari);
  if(UsersAdmin.find().cursor.count() === 0) {
    console.log("Before");
    var returnValue:string = Accounts.createUser({
        email: "admin@admin.fr",
        username: "admin",
        password: "doudou"
      });

      UsersAdmin.insert({userId: returnValue});

      console.log("Admin created !" + returnValue);

  }
  else{
    console.log("Admin already created");
  }
}

//TOSEE : https://stackoverflow.com/questions/36368457/is-it-possible-to-set-another-users-password-in-meteor-if-you-have-admin-privil
