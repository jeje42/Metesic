import {Component, ViewEncapsulation, ElementRef, OnInit} from '@angular/core';

import template from './app.component.html';
import style from './app.component.scss';
import {InjectUser} from "angular2-meteor-accounts-ui";
import { ROUTER_DIRECTIVES } from '@angular/router';
import { TranslateService } from './translate';


@Component({
	moduleId: module.id,
  selector: 'app',
  template,
	directives: [ROUTER_DIRECTIVES], //here,
  styles: [ style ],
  encapsulation: ViewEncapsulation.None,
	host: {
    '[class.unicorn-dark-theme]': 'dark',
  },
})
@InjectUser('user')
export class AppComponent implements OnInit {
	navItems = [
    	{name: 'Player', route: 'player'},
      {name: 'Settings', route: 'settings'}
	];

	public translatedText: string;
	public supportedLanguages: any[];


	constructor(private _element: ElementRef, private _translate: TranslateService) {

    }

		ngOnInit() {
        // standing data
        this.supportedLanguages = [
        { display: 'English', value: 'en' },
        { display: 'Francais', value: 'fr' },
        ];

        // set current langage
        this.selectLang('en');
    }

		isCurrentLang(lang: string) {
        // check if the selected lang is current lang
        return lang === this._translate.currentLang;
    }

		isCurrentLangStyle(lang: string) {
			if(this.isCurrentLang(lang)) {
				return "warn";
			}
			return "primary";
		}

    selectLang(lang: string) {
        // set current lang;
        this._translate.use(lang);
        this.refreshText();
    }

    refreshText() {
        // refresh translation when language change
        this.translatedText = this._translate.instant('Name');
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
