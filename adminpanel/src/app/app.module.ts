import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


/* Component list */
import {ComponentsModule} from './components/components.module';
import {LayoutModule} from './components/layout/layout.module';

/* Service list */
import {FormValidatorService} from 'src/app/service/form-validator.service'; 
import {UserService} from 'src/app/service/user.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ComponentsModule,
    LayoutModule,
    ToastrModule.forRoot(),
    HttpClientModule,
    BrowserAnimationsModule,
  ],
  providers: [UserService,FormValidatorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
