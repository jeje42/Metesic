import { Settings } from '../../../both/collections/settings.collection';
import { Setting } from '../../../both/models/setting.model';

export function initSettings() {
  const settings: Setting = {
    activerLdap: false,
    activerAuthentificationClassique: true
  }

  var alreadyThere:Setting = Settings.findOne();
  console.log("initSettings : " + alreadyThere.activerLdap)
  if(!alreadyThere){
    console.log("Inserting " + settings)
    Settings.insert(settings)
  }
}
