import { Component, OnInit } from '@angular/core';
import { TestService } from 'src/app/services/test/test.service.spec';
import {UserService} from "../../services/user/user.service";
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-test-summary',
  templateUrl: './test-summary.component.html',
  styleUrls: ['./test-summary.component.css']
})
export class TestSummaryComponent implements OnInit{
  exerciseName: string = '';
  correctAnswersList: any[] = [];
  wrongAnswersList: any[] = [];
  completedExercisesList: any[] = [];
  time: Date = new Date();
  type: string = '';

  maxScore: number = 9;
  refactoringResults: any[] = [];

  bonusScore: number = 0;
  totalScoreCheck: any = 0;
  totalScoreRef: any = 0;

  currentUserId: number = this.userService.user.getValue().userId;

  constructor( 
    private testService: TestService,
    private userService: UserService,
    private http: HttpClient,
  ){}

  ngOnInit(): void {
    const summary = this.testService.getData();


    if (summary) {
      this.exerciseName = summary.exerciseName || '';
      this.correctAnswersList = summary.correctAnswersList || [];
      this.wrongAnswersList = summary.wrongAnswersList || [];
      this.completedExercisesList = summary.completedExercisesList;
      this.time = summary.completionTime || null;
      this.type = summary.type;
      //console.log('Dati ricevuti nel sommario:', summary);

      this.totalScoreCheck = this.calculateScore() + this.calculateBonus();
      //this.bonusScore = this.calculateBonus();
      //this.totalScoreCheck += this.bonusScore;
      this.totalScoreRef = this.calculateRefactoringScore(this.completedExercisesList);

      this.saveTest();
    } else {
      console.error('Nessun dato ricevuto');
    }
  }

  normalizeExerciseId(exerciseName: string): string {
    return exerciseName.replace(/_\d+$/, "");
  }
  
  
  calculateScore(): number {
   return this.correctAnswersList.reduce((total,exercise) => {
    console.log('Elaborazione esercizio:', exercise);
    let points = 1;
      if(exercise.level === 2) points = 2;
      if(exercise.level === 3) points = 3;
      return total + points;}
   , 0);
  }


  /*calculateRefactoringScore(exercises: any[]): number {
    return exercises.reduce((total, exercise) => {
      if (exercise.type === 'refactoring-game') {
        const data = exercise.data;
  
        let score = 0;
        score += data.refactoringResult ? 10 : 0;
  
        const coverageDifference = data.originalCoverage - data.refactoredCoverage;
        score += data.refactoredCoverage >= data.originalCoverage
          ? 5
          : Math.max(0, 5 - Math.floor(coverageDifference / 20));
  
        const smellsReduced = data.smellsAllowed - data.smellNumber;
        score += smellsReduced >= 0 ? smellsReduced : 0;
  
        return total + score;
      }
      return total;
    }, 0);
  }
    */

  calculateRefactoringScore(exercises: any[]): number {
    return exercises.reduce((total, exercise) => {
      if (exercise.type === 'refactoring-game') {
        const data = exercise.data;
  
        // Se il refactoring non è stato fatto, nessun punteggio
        if (!data.refactoringResult) {
          console.log(`Nessun punteggio per ${exercise.exerciseId} perché il refactoring non è stato fatto.`);
          return total;
        }
  
        let score = 0;
  
        // Punti per comportamento preservato
        score += 5;
  
        // Punti per copertura del codice
        const coverageDifference = data.originalCoverage - data.refactoredCoverage;
        if (data.refactoredCoverage > data.originalCoverage) {
          score += 5;
        } else if (data.refactoredCoverage === data.originalCoverage) {
          score += 5; // Copertura mantenuta
        } else {
          score += Math.max(0, 5 - Math.floor(coverageDifference / 20));
        }
  
        // Punti per riduzione degli odori
        const smellsReduced = data.smellsAllowed - data.smellNumber;
        score += smellsReduced > 0 ? smellsReduced : 0;
  
        return total + score;
      }
      return total;
    }, 0);
  }
  
  

  
  calculateLevelScore(level: number): number {
    return this.correctAnswersList
      .filter(answer => answer.level === level)
      .reduce((total, answer) => total + level, 0); // Il punteggio è pari al livello
  }

  calculateBonus(): number {
    let bonus = 0;
    let streak = 0;
  
    this.correctAnswersList.forEach(() => {
      streak++;
      if (streak === 2) bonus += 1; // +1 punto al raggiungimento di 2 risposte corrette consecutive
      if (streak > 2) bonus += 2;  // +2 punti per ogni risposta oltre la seconda
    });
  
    this.wrongAnswersList.forEach(() => {
      streak = 0; // Reset della streak per risposte errate
    });
  
    return bonus;
  }
  
  

  saveTest(): void {
    const testResult = {
        testId: this.generateUniqueId(),
        userId: this.currentUserId, // Identificativo dell'utente corrente
        checkScore: this.totalScoreCheck, // Usa il metodo già esistente per calcolare il punteggio
        refactoringScore: this.totalScoreRef,
        correctAnswers: this.correctAnswersList.length,
        wrongAnswers: this.wrongAnswersList.length,
        completionTime: this.time, // Calcolo del tempo (può essere passato al componente)
        date: new Date().toISOString(),
        totalScore: (this.totalScoreCheck + this.totalScoreRef)
    };

    // Salva i risultati in localStorage
    this.testService.saveTestLocally(testResult);

    // Salva i risultati sul server
    this.testService.saveTestToServer(testResult).subscribe({
      next: (response) => console.log('Test salvato sul server:', response),
      error: (error) => console.error('Errore durante il salvataggio sul server:', error)
    });
  }
  


// Salvataggio in localStorage
saveTestLocally(testResult: any): void {
    const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
    testHistory.push(testResult);
    localStorage.setItem('testHistory', JSON.stringify(testHistory));
    console.log('Test salvato localmente.');
}



// Generazione di un ID univoco
generateUniqueId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}



viewTestHistory(): void {
  const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
  if (testHistory.length === 0) {
    alert('Non ci sono test completati.');
  } else {
    const historyString = testHistory.map((test: any) => `
      Data: ${new Date(test.date).toLocaleString()}
      Livello: ${test.level}
      Punteggio: ${test.score}
      Risposte Corrette: ${test.correctAnswers}
      Risposte Errate: ${test.wrongAnswers}
      Tempo di Completamento: ${test.completionTime}
    `).join('\n\n');
    alert(`Storico dei Test:\n\n${historyString}`);
  }
}

}

