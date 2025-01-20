import { Component, OnInit, ViewChild } from '@angular/core';
import { ExerciseService } from 'src/app/services/exercise/exercise.service';
import { ChangeDetectorRef } from '@angular/core';
import { TestService } from 'src/app/services/test/test.service.spec';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-test-game',
  templateUrl: './test-game.component.html',
  styleUrls: ['./test-game.component.css']
})
export class TestGameComponent implements OnInit {

  @ViewChild('refactoringGameCore')
  refactoringGameCore: any;

  exercises: any[] = [];
  currentExerciseIndex = 0;
  currentLevel: number = 1;
  completedCurrentExercise: boolean = false; 
  selectedAnswer: string | null = null;
  isMultiLevelGame: boolean = true;
  exerciseStates: any[] = [];

  correctAnswersList: { exerciseId: string, questionText: string; selectedAnswer: string; correctAnswer: string, level: number }[] = [];
  wrongAnswersList: { exerciseId: string, questionText: string; selectedAnswer: string; correctAnswer: string, level:number }[] = [];

  completedExercisesList: Array<{
    exerciseId: string;
    type: 'check-game' | 'refactoring-game';
    level: number;
    data: {
        refactoringResult?: boolean; 
        originalCoverage?: number;  
        refactoredCoverage?: number;
        smellsAllowed?: number;
        smellNumber?: number;
    };
  }> = [];

  refactoringResult: boolean = false; 
  originalCoverage: number = 0;
  refactoredCoverage: number = 0;
  smellsAllowed: number = 0;
  smellNumber: number = 0;



  startTime!: Date; 
  timeLeft: number = 600; // Tempo rimanente
  timer!: any;


  constructor(
    private exerciseService: ExerciseService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private testSummaryService: TestService,
    private translate: TranslateService,
    private snackBar: MatSnackBar
  ){}

  ngOnInit(): void {
    console.log('test iniziato');
   
    this.startTime = new Date();
    const savedState = localStorage.getItem('multiGameTestState');
    if (savedState) {
      const testState = JSON.parse(savedState);

      const message = this.translate.currentLang === 'it' ? 'Hai un test in corso. Vuoi riprendere da dove hai lasciato?' : 'You have a test in progress. Do you want to resume where you left off?'
      const resume = confirm(message);

      if (resume) {
        this.loadSavedState(testState);
      } else {
        this.startNewTest();
      }
    } else {
      this.startNewTest();
    }
    this.startTimer();
 }

 

  loadSavedState(testState: any): void {
    this.currentExerciseIndex = testState.currentExerciseIndex;
    this.currentLevel = testState.currentLevel;
    this.correctAnswersList = testState.correctAnswersList;
    this.wrongAnswersList = testState.wrongAnswersList;
    this.completedExercisesList = testState.completedExercises;
    this.exercises = testState.exercises;
    this.timeLeft = testState.timeLeft || 600;

    console.log('Test ripreso con stato:', testState);
  }

  
  startNewTest(): void {
    localStorage.removeItem('multiGameTestState');
    this.currentLevel = 1;
    this.correctAnswersList = [];
    this.wrongAnswersList = [];
    this.completedExercisesList = [];
    this.loadExercisesByLevel(this.currentLevel);
    console.log('Nuovo test avviato.');
  }
  


  loadExercisesByLevel(level: number): Promise<void> {
    return new Promise((resolve) => {
      this.exerciseService.getExercisesByLevel(level, 3).subscribe({
        next: (data) => {
          if (data.length === 0) {
            console.error(`Nessun esercizio disponibile per il livello ${level}.`);
            resolve();
            return;
          }

          this.exercises = data;
          this.filterExercisesByTypeRandom(2, 2);
          this.currentExerciseIndex = 0;

          resolve();
        },
        error: (err) => {
          console.error('Errore nel caricamento degli esercizi:', err);
          alert('Errore durante il caricamento degli esercizi.');
          resolve();
        }
      });
    });
  }



  normalizeExerciseId(exerciseId: string): string {
    return exerciseId.replace(/_\d+$/, "");
  }
  

  filterExercisesByTypeRandom(checkCount: number = 2, refactoringCount: number = 2): void {
    const shuffledExercises = this.exercises.sort(() => Math.random() - 0.5);

    const checkGameExercises = shuffledExercises.filter((exercise) => !!exercise.check_game_configuration);
    const refactoringGameExercises = shuffledExercises.filter((exercise) => !!exercise.refactoring_game_configuration);

    const selectedCheckGameExercises = checkGameExercises.slice(0, checkCount).map((exercise) => ({
      type: 'check-game',
      data: exercise
    }));

    const selectedRefactoringExercises = refactoringGameExercises.slice(0, refactoringCount).map((exercise) => ({
      type: 'refactoring-game',
      data: exercise
    }));

    this.exercises = [...selectedCheckGameExercises, ...selectedRefactoringExercises];
    this.exercises = this.exercises.sort(() => Math.random() - 0.5);
    this.currentExerciseIndex = 0;
  }


  
   nextExercise(): void {
    this.saveCurrentState();

    if (this.currentExerciseIndex < this.exercises.length - 1){
      this.currentExerciseIndex++;

      this.completedCurrentExercise = false;
      this.selectedAnswer = null;

      const currentExercise = this.exercises[this.currentExerciseIndex];

      if (!currentExercise?.type) {
        console.error('Tipo di esercizio non valido.');
        return;
      }

      this.cdr.detectChanges();

    } else {
        
        if (this.currentLevel >= 3) {
          this.showNotification('Hai completato tutti i livelli del test!');
          this.submitTest();
        } else {
            this.currentLevel++;
            this.loadExercisesByLevel(this.currentLevel);
        }
    }
  }



  selectAnswer(answer: string): void {
    this.selectedAnswer = answer;

    const currentQuestion = this.exercises[this.currentExerciseIndex]?.data?.check_game_configuration?.questions[0];
    const correctAnswer = currentQuestion?.answers.find((ans: any) => ans.isCorrect)?.answerText;

    if (currentQuestion && correctAnswer) {
      if (answer === correctAnswer) {
        this.correctAnswersList.push({
          exerciseId: this.normalizeExerciseId(this.exercises[this.currentExerciseIndex]?.data?.exerciseId),
          questionText: currentQuestion.questionCode,
          selectedAnswer: answer,
          correctAnswer: correctAnswer,
          level: this.currentLevel
        });

      } else {
        this.wrongAnswersList.push({
          exerciseId: this.normalizeExerciseId(this.exercises[this.currentExerciseIndex]?.data?.exerciseId),
          questionText: currentQuestion.questionCode,
          selectedAnswer: answer,
          correctAnswer: correctAnswer,
          level: this.currentLevel
        });
      }
    } else {
      console.error('Errore: Domanda o risposta corretta non trovata.');
    }
  }

  

  previousExercise(): void {
    if (this.currentExerciseIndex > 0) {
      this.saveCurrentState();
      this.currentExerciseIndex--;

      const previousState = this.exerciseStates[this.currentExerciseIndex];
      if (previousState ) {
        this.selectedAnswer = previousState.selectedAnswer || null; // Ripristina la risposta
        this.completedCurrentExercise = previousState.completeCurrentExercise || false;
        if(this.exercises[this.currentExerciseIndex]?.type === 'refactoring-game'){
          this.refactoringGameCore.loadCode();
        }
      }    
    } else {
      console.log('Nessun esercizio precedente.');
    }
  }
  

  submitTest(): void {
    this.showNotification('Test consegnato! Grazie per aver completato il Multi-Level Game.');

    const endTime = new Date();
    const elapsedTime = Math.floor((endTime.getTime() - this.startTime.getTime()) / 1000);
    const remainingTime = 600 - elapsedTime;

    const formattedTime = remainingTime > 0 ? remainingTime : 0;

    this.testSummaryService.setData({
      exerciseName: this.exercises[this.currentExerciseIndex].data.exerciseId || '',
      correctAnswersList: this.correctAnswersList,
      wrongAnswersList: this.wrongAnswersList,
      completedExercisesList: this.completedExercisesList,
      completionTime: this.formatTime(elapsedTime),
      type: this.exercises[this.currentExerciseIndex].type
    });

    localStorage.removeItem('multiGameTestState');
    console.log('Stato del test cancellato.');

    this.router.navigate(['/test-summary']);
  }
  

  saveCurrentState(): void {
    if (this.exercises[this.currentExerciseIndex]?.type === 'refactoring-game'){
      this.refactoringGameCore.restoreCode();
    }

    this.exerciseStates[this.currentExerciseIndex] = {
      selectedAnswer: this.selectedAnswer,
      completeCurrentExercise: this.completedCurrentExercise,
      //codice modificato
      refactorCode: localStorage.getItem(`refactoring-game-${this.exercises[this.currentExerciseIndex]?.data?.exerciseId}`)
    };
    //console.log('stato salvato per:', this.currentExerciseIndex, this.exerciseStates[this.currentExerciseIndex]);

    const testState = {
      currentExerciseIndex: this.currentExerciseIndex,
      currentLevel: this.currentLevel,
      correctAnswersList: this.correctAnswersList,
      wrongAnswersList: this.wrongAnswersList,
      completedExercisesList: this.completedExercisesList,
      exercises: this.exercises,
      timeLeft: this.timeLeft,
      startTime: this.startTime.toISOString()
    };

    localStorage.setItem('multiGameTestState', JSON.stringify(testState));
    console.log('Stato del test salvato:', testState);

  }



startTimer(): void {
  this.timer = setInterval(() => {
    if (this.timeLeft > 0) {
      this.timeLeft--;
    } else {
      clearInterval(this.timer);
      this.timeExpired();
    }
  }, 1000);
}


timeExpired(): void {
  alert('Tempo scaduto! Il test verrà inviato automaticamente.');
  this.submitTest();
}

formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

ngOnDestroy(): void {
  if (this.timer) {
    clearInterval(this.timer);
  }
}



  handleRefactoringGameCompletion(data: any): void {
    console.log('Dati ricevuti dal componente Refactoring Game:', data);
  
    const currentExercise = this.exercises[this.currentExerciseIndex].data;
    this.completedExercisesList.push({
      exerciseId: currentExercise.exerciseId,
      type: 'refactoring-game',
      level: this.currentLevel,
      data: data
    });
  
    console.log('Lista degli esercizi completati aggiornata:', this.completedExercisesList);

    this.nextExercise();
  }


  showNotification(message: string, action: string = 'Close') {
    this.snackBar.open(message, action, {
      duration: 3000, // Tempo in millisecondi
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  } 
  


}
