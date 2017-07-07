import { Categories } from '../../../both/collections/categories.collection';
import { Category } from '../../../both/models/category.model';

export function loadCategories() {
  const categories: Category[] = [{
    name: 'Action',
    },{
      name: 'Animation',
    },{
      name: 'Aventure',
    },{
      name: 'Fantastique',
    },{
      name: 'Film Catastrophe',
    },{
      name: 'Guerre',
    },{
      name: 'James Bond',
    },{
      name: 'Mac Gyver',
    },{
      name: 'Marvel',
    },{
      name: 'Policier',
    },{
      name: 'Policier, Thriller',
    },{
      name: 'Péplum',
    },{
      name: 'Rambo',
    },{
      name: 'Rocky',
    },{
      name: 'Science Fiction',
    },{
      name: 'Star Wars',
    },{
      name: 'Séries',
    },{
      name: 'Western',
    },{
      name: 'Épouvante-Horreur',
    },{
      name: 'Anciens Français',
    },{
      name: 'Animation',
    },{
      name: 'Belmondo',
    },{
      name: 'Bourvil',
    },{
      name: 'C\'EST PAS SORCIER',
    },{
      name: 'Comédie',
    },{
      name: 'Comédie Dramatique',
    },{
      name: 'Corée Du Nord',
    },{
      name: 'Documentaire',
    },{
      name: 'Drame',
    },{
      name: 'Francais',
    },{
      name: 'Groland',
    },{
      name: 'GUY MONTAGNE',
    },{
      name: 'Jean-Jacques Annaud',
    },{
      name: 'Lino Ventura',
    },{
      name: 'Louis de Funès',
    },{
      name: 'Mickael Jackson',
    },{
      name: 'oss117',
    },{
      name: 'polémique',
    },{
      name: 'Politique-Histoire',
    },{
      name: 'Post-Apocalyptique',
    },{
      name: 'Sketchs',
    },{
      name: 'Spectacle Comique',
    },{
      name: 'Taxi',
    },{
      name: 'Terminator',
    },{
      name: 'Thriller',
    },{
      name: 'Vegan',
    },{
      name: 'American Pie',
    },{
      name: 'Astérix et Obélix',
    },{
      name: 'Camping',
    },{
      name: 'Depardieu',
    },{
      name: 'GUIGNOLS DE L\'INFO',
    },{
      name: 'La 7e compagnie',
    },{
      name: 'les bronzés',
    },{
      name: 'Les Visiteurs',
    },{
      name: 'Pierre Richard',
    },{
      name: 'REMI GAILLARD',
    },{
      name: 'Apocalypse',
    },{
      name: 'CameraCafe',
    },{
      name: 'Kaamelott',
    },{
      name: 'Jérémy Ferrari',
    },{
      name: 'Apocalypse',
    },{
      name: 'Apocalypse',
    }];

  categories.forEach((category: Category) => {
    var alreadyThere:Category = Categories.findOne({name: category.name});
    if(alreadyThere === undefined){
      Categories.insert(category);
    }
  });
}
