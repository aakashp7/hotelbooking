import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError, Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Response } from 'src/app/model/response';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable({
	providedIn: 'root'
})
export class UserService {

	private userLoggedIn = new BehaviorSubject(false);
	private userName = new BehaviorSubject<string>("");
	constructor(
		private http: HttpClient,
		private toastrService: ToastrService
	) { }


	getUserName(): Observable<string> {
		this.userLoggedIn.next(!!localStorage.getItem("userName"));
		return this.userName.asObservable();
	}

	setUserName(name: string): void {
		this.userName.next(name);
	}

	setLoggedIn(value: boolean): void {
		this.userLoggedIn.next(value);
	}

	getLoggedIn(): Observable<boolean> {
		this.userLoggedIn.next(!!localStorage.getItem("id"));
		return this.userLoggedIn.asObservable();
	}

	getUserId(): string {
		return localStorage.getItem("id");
	}
	isLoggin(): boolean {
		return !!localStorage.getItem("id");
	}

	logout(): void {		
		this.setLoggedIn(false);
		localStorage.clear();
	}

	adminLogin(form: any): Observable<Response> {
		return this.http.post(environment.API_URL + "adminLogin", form).pipe(catchError(this.handleError));
	}

	getUserList(): Observable<Response> {
		return this.http.get(environment.API_URL + "getUserList").pipe(catchError(this.handleError));
	}

	
	addNewUser(form): Observable<Response> {
		return this.http.post(environment.API_URL + "addNewUser",form).pipe(catchError(this.handleError));
	}

	deleteUserById(form): Observable<Response> {
		return this.http.post(environment.API_URL + "deleteUserById",form).pipe(catchError(this.handleError));
	}

	getTotalUser(): Observable<Response> {
		return this.http.get(environment.API_URL + "getTotalUser").pipe(catchError(this.handleError));
	}
	
	checkEmailIdExist(email: string, id: number = null): Observable<Response> {
		var form = { "email": email, "id": id };
		return this.http.post(environment.API_URL + "checkEmailIdExist", form).pipe(catchError(this.handleError));
	}
	
	/* Hotel List */
	addNewHotel(file:FormData): Observable<Response> {
		return this.http.post(environment.API_URL + "addNewHotel",file).pipe(catchError(this.handleError));
	//	return this.http.post(environment.API_URL + "addNewStateProviceCode",file).pipe(catchError(this.handleError));
	}
		
	getHotelList(): Observable<Response> {
		return this.http.get(environment.API_URL + "getHotelList").pipe(catchError(this.handleError));
	}

	
	showSuccessMessage(message: string): void {
		this.toastrService.success(message, "Success!");
	}

	showErrorMessage(message: string): void {
		this.toastrService.error(message, "Error!");
	}


	private handleError(error: HttpErrorResponse) {
		if (error.error instanceof ErrorEvent) {
			console.error('An error occurred:', error.error.message);
		} else {
			console.error(
				`Backend returned code ${error.status}, ` +
				`body was: ${error.error}`);
		}
		return throwError('Something bad happened; please try again later.');
	}
}
