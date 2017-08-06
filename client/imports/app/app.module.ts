import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AccountsModule } from 'angular2-meteor-accounts-ui';
import {NgxPaginationModule} from 'ngx-pagination';
import { AgmCoreModule } from 'angular2-google-maps/core';

import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';

import { AppComponent } from './app.component';
import { routes, ROUTES_PROVIDERS } from './app.routes';
import { PARTIES_DECLARATIONS } from './parties';
import { SHARED_DECLARATIONS } from './shared';
import { VIDEOS_DECLARATIONS, VIDEOS_DECLARATIONS_MODALS } from './videos';
import { SETTINGS_DECLARATIONS, SETTINGS_DECLARATIONS_MODALS } from './settings';
// import { MaterialModule, OverlayContainer } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AUTH_DECLARATIONS } from "./auth/index";
import { FileDropModule } from "angular2-file-drop";
import {
  // CdkDataTableModule,
  FullscreenOverlayContainer,
  MdAutocompleteModule,
  MdButtonModule,
  MdButtonToggleModule,
  MdCardModule,
  MdCheckboxModule,
  MdChipsModule,
  MdCoreModule,
  MdDatepickerModule,
  MdDialogModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdMenuModule,
  MdNativeDateModule,
  MdProgressBarModule,
  MdProgressSpinnerModule,
  MdRadioModule,
  MdRippleModule,
  MdSelectModule,
  MdSidenavModule,
  MdSliderModule,
  MdSlideToggleModule,
  MdSnackBarModule,
  MdTabsModule,
  MdToolbarModule,
  MdTooltipModule,
  OverlayContainer
} from '@angular/material';

import { TRANSLATION_PROVIDERS, TranslatePipe, TranslateService }   from './translate';

/**
 * NgModule that includes all Material modules that are required to serve the demo-app.
 */
@NgModule({
  exports: [
    MdAutocompleteModule,
    MdButtonModule,
    MdButtonToggleModule,
    MdCardModule,
    MdCheckboxModule,
    MdChipsModule,
    MdDatepickerModule,
    MdDialogModule,
    MdGridListModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdMenuModule,
    MdCoreModule,
    MdProgressBarModule,
    MdProgressSpinnerModule,
    MdRadioModule,
    MdRippleModule,
    MdSelectModule,
    MdSidenavModule,
    MdSlideToggleModule,
    MdSliderModule,
    MdSnackBarModule,
    MdTabsModule,
    MdToolbarModule,
    MdTooltipModule,
    MdNativeDateModule,
    // CdkDataTableModule,
  ]
})
export class DemoMaterialModule {}

@NgModule({
	imports: [
		BrowserModule,
		DemoMaterialModule,
		FormsModule,
		BrowserAnimationsModule,
		ReactiveFormsModule,
		RouterModule.forRoot(routes),
    // RouterModule.forChild(routes),
		AccountsModule,
    NgxPaginationModule,
		AgmCoreModule.forRoot({
			apiKey: 'AIzaSyAWoBdZHCNh5R-hB5S5ZZ2oeoYyfdDgniA'
		}),
		// MaterialModule.forRoot(),
		FileDropModule,

		VgCoreModule,
		VgControlsModule,
		VgOverlayPlayModule,
		VgBufferingModule
	],
	declarations: [
		AppComponent,
		...SHARED_DECLARATIONS,
		...AUTH_DECLARATIONS,
		...VIDEOS_DECLARATIONS,
		...SETTINGS_DECLARATIONS,
    ...SETTINGS_DECLARATIONS_MODALS,
    ...VIDEOS_DECLARATIONS_MODALS,
    TranslatePipe
	],
	providers: [
		...ROUTES_PROVIDERS,
    TRANSLATION_PROVIDERS,
    TranslateService
	],
  entryComponents: [
    ...SETTINGS_DECLARATIONS_MODALS,
    ...VIDEOS_DECLARATIONS_MODALS
  ],
	bootstrap: [
		AppComponent
	]
})
export class AppModule { }
