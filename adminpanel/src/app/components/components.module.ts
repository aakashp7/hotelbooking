import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { LayoutModule } from './layout/layout.module';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';
import { ModalModule } from 'ngb-modal';
import { HotelComponent } from './hotel/hotel.component';


const routes: Routes = [
	{ path: '', component: LoginComponent },
	{ path: 'home', component: HomeComponent },
	{ path: 'user', component: UserComponent }, 
	{ path: 'hotel', component: HotelComponent }
];

@NgModule({
  declarations: [HomeComponent, LoginComponent, UserComponent, HotelComponent],
  imports: [
    CommonModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class ComponentsModule { }
