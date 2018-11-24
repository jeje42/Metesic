import {Component, ViewEncapsulation, ElementRef, OnInit} from '@angular/core';
import { Router } from '@angular/router'
// import template from './app.component.html';
// import style from './app.component.scss';
import {InjectUser} from "angular2-meteor-accounts-ui";
// import { ROUTER_DIRECTIVES } from '@angular/router';
import { TranslateService } from './translate';
import { MeteorObservable } from 'meteor-rxjs';
import { Subscription} from 'rxjs';
import { Settings } from '../../../both/collections/settings.collection';

import { Setting } from '../../../both/models/setting.model';


@Component({
	// moduleId: module.id,
  selector: 'app',
  templateUrl: './app.component.html',
	// directives: [ROUTER_DIRECTIVES], //here,
  // styles: [ style ],
	styleUrls: ['./app.component.scss'],
  // encapsulation: ViewEncapsulation.None,
	// host: {
  //   '[class.unicorn-dark-theme]': 'dark',
  // },
})
@InjectUser('user')
export class AppComponent implements OnInit {
	navItems = [
			{name: 'Home', route: ''},
      {name: 'Settings', route: 'settings'}
	];

  settingsSub: Subscription

  loginNormal: boolean
  loginLdap: boolean

	public translatedText: string;
	public supportedLanguages: any[];


	constructor(private _element: ElementRef, private _router: Router, private _translate: TranslateService) {

    }

		ngOnInit() {
      this.loginNormal = true
      this.loginLdap = false

      this.settingsSub = MeteorObservable.subscribe('settings').subscribe(() => {
  			let settings = Settings.find()
  			settings.subscribe(list => {
  				let settingObject:Setting = list[0]

          this.loginNormal = settingObject.activerAuthentificationClassique
          this.loginLdap = settingObject.activerLdap
  			})
  		});

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
    Meteor.logout(() => {
      this._router.navigate([''])
    });
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
