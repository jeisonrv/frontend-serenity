
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PreferenciaRecordatorios {
    activo: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class RecordatoriosService {
    private readonly http = inject(HttpClient);
    private readonly url = `${environment.apiUrl}/usuarios/me/recordatorios`;

    consultar(): Observable<PreferenciaRecordatorios> {
        return this.http.get<PreferenciaRecordatorios>(this.url);
    }

    actualizar(
        activo: boolean
    ): Observable<PreferenciaRecordatorios> {
        return this.http.put<PreferenciaRecordatorios>(
            this.url,
            { activo }
        );
    }
}
