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
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatStepperModule,
} from '@angular/material';
import {CdkTableModule} from '@angular/cdk/table';

import { TRANSLATION_PROVIDERS, TranslatePipe, TranslateService }   from './translate';

/**
 * NgModule that includes all Material modules that are required to serve the demo-app.
 */
@NgModule({
  exports: [
    CdkTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
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
