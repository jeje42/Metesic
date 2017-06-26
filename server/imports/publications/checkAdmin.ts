import { UserAdmin } from '../../../both/models/user-admin.model';
import { UsersAdmin } from '../../../both/collections/users-admin.collection';



/**
 * loggedIsAdmin - checks if userId is admin
 *
 * @param  {type} userId: string description
 * @return {type}                true only if the userId is admin.
 */
export function loggedIsAdmin(userId: string){
  let isAdmin:UserAdmin = UsersAdmin.findOne({userId: userId});

  return isAdmin != undefined;
}
