import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VideosMetas } from '../../../../both/collections/video-meta.collection';
import { InjectUser } from "angular2-meteor-accounts-ui";
import template from './videos-form.component.html';
import style from './videos-form.component.scss';

@Component({
	selector: 'videos-form',
	template,
	styles: [ style ]
})
@InjectUser("user")
export class VideosFormComponent implements OnInit {
	addForm: FormGroup;
	video: string = "";

	constructor(
		private formBuilder: FormBuilder
	) {}

	ngOnInit() {
		this.addForm = this.formBuilder.group({
			name: ['', Validators.required],
			description: [],
			location: ['', Validators.required],
			public: [false]
		});
	}

  addVideo(): void {
	console.log("Call to addVideo");
    if (!Meteor.userId()) {
		alert('Please log in to add a video');
		return;
    }

    // if (this.addForm.valid) {
		// console.log("owner : " + Meteor.userId());
		// VideosMetas.insert({
		// 	name: this.addForm.value.name,
		// 	description: this.addForm.value.description,
		// 	video: this.video,
		// 	public: this.addForm.value.public,
		// 	owner: Meteor.userId()
		// });

		this.addForm.reset();
    // }
}

	onVideo(videoId: string) {
		console.log("Call to onVideo");
		this.video = videoId;
	}
}
