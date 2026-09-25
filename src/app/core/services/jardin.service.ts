import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegistroJardin } from '../models/jardin.model';

@Injectable({ providedIn: 'root' })
export class JardinService {
  constructor(private http: HttpClient) {}

  // RF10: progreso del jardín virtual
  obtenerJardin(): Observable<RegistroJardin[]> {
    return this.http.get<RegistroJardin[]>(`${environment.apiUrl}/jardin`);
  }
}
