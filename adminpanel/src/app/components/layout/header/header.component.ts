import { Component, OnInit } from '@angular/core';
import { NavigationEnd ,Router} from '@angular/router';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  currentUrl:string = "";
  constructor(
    private router:Router
  ) { }

  ngOnInit() {
    this.currentUrl = this.router.url;
    this.router.events.subscribe((event:any) => {
			if(event instanceof NavigationEnd){
        this.currentUrl = event.url;
  		}
		});
  }
}
