import {Component, OnInit, NgZone} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Meteor } from 'meteor/meteor';

@Component({
  selector: 'login-ldap',
  templateUrl: './login-ldap.component.html'
})
export class LoginLdapComponent implements OnInit {
  loginForm: FormGroup;
  error: string;

  constructor(private router: Router, private zone: NgZone, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.error = '';
  }

  routerHome():void {
    this.router.navigate(['/']);
  }

  login():void {
    if (this.loginForm.valid) {
      Meteor.loginWithLDAP(this.loginForm.value.username, this.loginForm.value.password, {
          // The dn value depends on what you want to search/auth against
          // The structure will depend on how your ldap server
          // is configured or structured.
        dn: "cn=" + this.loginForm.value.username + ",ou=appart,dc=jeje,dc=com",
          // The search value is optional. Set it if your search does not
          // work with the bind dn.
        //search: "(objectclass=*)"
      }, (err) => {
        this.zone.run(() => {
          if (err) {
            this.error = err;
          } else {
            this.router.navigate(['/']);
          }
        });
      });
    }
  }
}
