import { SettingsComponent } from "./settings.component";
import { SettingsFoldersComponent } from "./settings-folders.component";
import { SettingsCategoriesComponent } from './settings-categories.component';
import { SettingsUsersComponent, ContentElementDialog } from './settings-users.component';
import { ProgressionDialog } from './progression-dialog.component';

export const SETTINGS_DECLARATIONS = [
	SettingsComponent,
	SettingsFoldersComponent,
	SettingsCategoriesComponent,
	SettingsUsersComponent
];

export const SETTINGS_DECLARATIONS_MODALS = [
	ContentElementDialog,
	ProgressionDialog
];
