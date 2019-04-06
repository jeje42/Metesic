import { UsersAdmin } from '../../../both/collections/users-admin.collection';

export function initAdmin(){
  if(UsersAdmin.find().cursor.count() === 0) {
    var returnValue:string = Accounts.createUser({
        email: "admin@admin.fr",
        username: "admin",
        password: "doudou"
      });

      UsersAdmin.insert({userId: returnValue});

      logger.info("Admin created !" + returnValue);

  }
  else{
    logger.info("Admin already created");
  }
}

//TOSEE : https://stackoverflow.com/questions/36368457/is-it-possible-to-set-another-users-password-in-meteor-if-you-have-admin-privil
