import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';
import { TestService } from 'src/app/services/test/test.service.spec';
import { User } from 'src/app/model/user/user.model';
import { UserService } from 'src/app/services/user/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-test-history',
  templateUrl: './test-history.component.html',
  styleUrls: ['./test-history.component.css']
})
export class TestHistoryComponent implements OnInit {
  testHistory: any[] = [];
  scoreChart: any;
  user!: User;
  

  constructor(
    private http: HttpClient,
    private testService: TestService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}


  ngOnInit(): void {
    this.loadTestHistory();
    this.renderScoreChart();
  }

  loadTestHistory(): void {
    //this.testHistory = this.testService.loadLocalTestHistory();

    this.userService.getCurrentUser().subscribe((user: User | any) => {
      this.user = user;
  });

    //Caricamento da backend con filtro duplicati
    this.testService.loadTestHistoryFromServer(this.user.userId).subscribe({
      next: (data: any) => {
        const combinedHistory = [...this.testHistory, ...data];
        this.testHistory = combinedHistory.filter(
          (value, index, self) =>
            index === self.findIndex(
              (t) =>
                t.date === value.date &&
                t.completionTime === value.completionTime &&
                t.refactoringScore === value.refactoringScore
            )
        );
      console.log('Stroico test caricato sal server:', data);
      },
      error: (error) => {
        console.error("Errore durante il caricamento dello storico da server:", error);
      }
    });
  }
  

  renderScoreChart(): void {
    const canvas = document.getElementById('scoreChart') as HTMLCanvasElement;
    if (!canvas) return;

    const scores = this.testHistory.map(test => test.totalScore);
    const dates = this.testHistory.map(test => new Date(test.date).toLocaleDateString());

    /*if (this.scoreChart) {
      this.scoreChart.destroy(); // Distruggi il grafico precedente per evitare duplicati
    }
      */

    this.scoreChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [
          {
            label: 'Total Score',
            data: scores,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Data'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Punteggio Totale'
            },
            beginAtZero: true
          }
        }
      }
    });
  }


  removeTest(index: number): void {
    this.testService.removeLocalTest(index);
    this.testHistory.splice(index, 1);
    //this.renderScoreChart();

  }


  clearTestHistory(): void {
    localStorage.removeItem('testHistory');
    this.testHistory = [];
    if (this.scoreChart) {
      this.scoreChart.destroy();
    }
    console.log('Storico dei test eliminato.');
  }


  deleteHistory() {
    const message = this.translate.currentLang == 'it' ? 'Vuoi eliminare la cronologia anche dal server?' : 'Do you also want to delete the history from the server?'
    const userConfirmed = confirm(message);
    if (userConfirmed) {
      this.userService.getCurrentUser().subscribe((user: User | any) => {
        this.user = user;
      });
      this.testService.removeTestFromServer(this.user.userId).subscribe(
        () => {
          const message = this.translate.currentLang == 'it' ? 'Cronologia eliminata con successo.' : 'History successfully deleted.'
          this.showNotification(message);
        },
        (error) => {
          alert('Si è verificato un errore durante l\'eliminazione della cronologia: ' + error.message);
        }
      );
    }
  }

  showNotification(message: string, action: string = 'Close') {
    this.snackBar.open(message, action, {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  } 
  
  

}

