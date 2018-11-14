import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { MeteorObservable } from 'meteor-rxjs';
import { InjectUser } from "angular2-meteor-accounts-ui";

import 'rxjs/add/operator/combineLatest';

import { Categories } from '../../../../both/collections/categories.collection';
import { Category } from '../../../../both/models/category.model';

@Component({
	selector: 'settings-categories',
	templateUrl : './settings-categories.component.html',
	styleUrls: ['./settings-categories.component.scss']
})
@InjectUser('user')
export class SettingsCategoriesComponent implements OnInit, OnDestroy {
	addCategory: FormGroup;
	categories: Observable<Category[]>;

	CategoriesSub: Subscription;
	user: Meteor.User;

	constructor(
    private formBuilder: FormBuilder
  ) {}

	ngOnInit() {
		this.CategoriesSub = MeteorObservable.subscribe('categories').subscribe(() => {
			this.categories = Categories.find({}, {
				sort: {
					name: 0
				}
			}).zone();
		});

		this.addCategory = this.formBuilder.group({
      name: ['', Validators.required]
		});
	}

	ngOnDestroy() {
		this.CategoriesSub.unsubscribe();
	}

	addCategoryFunction(): void {
		if(this.addCategory.valid){
			Meteor.call('addCategory', this.addCategory.value.name);
		}
		this.addCategory.reset();
	}

	deleteCategory(category: Category): void {
		Meteor.call('deleteCategory', category._id, 1);
	}
}
