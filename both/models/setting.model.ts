import { CollectionObject } from './collection-object.model';


export class Setting implements CollectionObject {
	activerLdap: boolean;
	activerAuthentificationClassique: boolean;
}
