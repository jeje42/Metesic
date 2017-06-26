import {Component, ViewEncapsulation, ElementRef} from '@angular/core';

import template from './app.component.html';
import style from './app.component.scss';
import {InjectUser} from "angular2-meteor-accounts-ui";

@Component({
	moduleId: module.id,
  selector: 'app',
  template,
  styles: [ style ],
  encapsulation: ViewEncapsulation.None,
	host: {
    '[class.unicorn-dark-theme]': 'dark',
  },
})
@InjectUser('user')
export class AppComponent {
	navItems = [
    	{name: 'Player', route: 'player'},
      {name: 'Settings', route: 'settings'}
	];


	constructor(private _element: ElementRef) {

    }

  logout() {
    Meteor.logout();
  }

  toggleFullscreen() {
    let elem = this._element.nativeElement.querySelector('.metesic-content');
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullScreen) {
      elem.webkitRequestFullScreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullScreen) {
      elem.msRequestFullScreen();
    }
  }
}
