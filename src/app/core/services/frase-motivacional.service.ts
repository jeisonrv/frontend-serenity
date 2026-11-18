import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface FraseMotivacional {
    frase: string;
    autor: string;
    religiosa: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class FraseMotivacionalService {

    constructor(private http: HttpClient) {}

    obtenerFraseDelDia(): Observable<FraseMotivacional> {
        return this.http.get<FraseMotivacional>(
            `${environment.apiUrl}/frases/motivacional`
        );
    }
}