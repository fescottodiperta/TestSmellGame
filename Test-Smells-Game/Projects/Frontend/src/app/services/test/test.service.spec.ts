import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';


@Injectable({
  providedIn: 'root'
})
export class TestService {
  private data: any = null;
  private localStorageKey = 'testHistory';

  constructor(private http: HttpClient) {}

  // Metodo per impostare i dati
  setData(data: any): void {
    this.data = data;
  }

  // Metodo per recuperare i dati
  getData(): any {
    return this.data;
  }

  // Salva il risultato del test localmente
  saveTestLocally(testResult: any): void {
    const testHistory = this.loadLocalTestHistory();
    testHistory.push(testResult);
    localStorage.setItem(this.localStorageKey, JSON.stringify(testHistory));
    console.log('Test salvato localmente.', testResult);
  }

  // Carica lo storico locale
  loadLocalTestHistory(): any[] {
    return JSON.parse(localStorage.getItem(this.localStorageKey) || '[]');
  }

  // Salva il risultato del test sul server
  saveTestToServer(testResult: any): Observable<any> {
    return this.http.post(environment.userServiceUrl + '/test-results/' + testResult.userId, testResult);
  }

  // Carica lo storico dal server
  loadTestHistoryFromServer(userId: number): Observable<any> {
    return this.http.get(environment.userServiceUrl + '/test-results/' + userId);
  }

  // Rimuove un test specifico dallo storico locale
  removeLocalTest(index: number): void {
    const testHistory = this.loadLocalTestHistory();
    if (index >= 0 && index < testHistory.length) {
      testHistory.splice(index, 1);
      localStorage.setItem(this.localStorageKey, JSON.stringify(testHistory));
      console.log('Test rimosso dallo storico locale.');
    }
  }

  removeTestFromServer(userId: number): Observable<any>{
    return this.http.delete<void>(environment.userServiceUrl + '/test-results/' + userId);
  }

}
