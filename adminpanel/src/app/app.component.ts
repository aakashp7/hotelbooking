import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from 'src/app/service/user.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

export class AppComponent {

	title = 'adminpanel';
	userLoggedIn: boolean = false;
	private subscription: Subscription;
	constructor(
		private userService: UserService
	) { }

	ngOnInit() {
		if (localStorage.getItem("userName")) {
			this.userService.setUserName(localStorage.getItem("userName"));
		}
		this.subscription = this.userService.getLoggedIn().subscribe(response => {
			this.userLoggedIn = response;
		});
		this.userService.getLoggedIn();
	}
}
