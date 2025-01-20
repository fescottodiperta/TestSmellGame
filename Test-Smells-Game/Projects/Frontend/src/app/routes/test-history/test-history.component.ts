import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';
import { TestService } from 'src/app/services/test/test.service.spec';
import { User } from 'src/app/model/user/user.model';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-test-history',
  templateUrl: './test-history.component.html',
  styleUrls: ['./test-history.component.css']
})
export class TestHistoryComponent implements OnInit {
  testHistory: any[] = [];
  scoreChart: any;
  user!: User;
  

  constructor(private http: HttpClient, private testService: TestService, private userService: UserService) {}


  ngOnInit(): void {
    this.loadTestHistory();
    this.renderScoreChart();
  }

  loadTestHistory(): void {
    this.testHistory = this.testService.loadLocalTestHistory();

    this.userService.getCurrentUser().subscribe((user: User | any) => {
      this.user = user;
  });
    //Caricamento da backend, se necessario
    this.testService.loadTestHistoryFromServer(this.user.userId).subscribe({
      next: (data: any) => {
      this.testHistory = [...this.testHistory, ...data];
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
            label: 'Punteggio Totale',
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
    //this.renderScoreChart(); // Aggiorna grafico dopo rimozione

  }

  clearTestHistory(): void {
    localStorage.removeItem('testHistory');
    this.testHistory = []; // Resetta la lista
    if (this.scoreChart) {
      this.scoreChart.destroy(); // Distruggi il grafico se esiste
    }
    console.log('Storico dei test eliminato.');
  }

  deleteHistory() {
    const userConfirmed = confirm('Vuoi eliminare la cronologia anche dal server?');
    if (userConfirmed) {
      this.userService.getCurrentUser().subscribe((user: User | any) => {
        this.user = user;
      });
      this.testService.removeTestFromServer(this.user.userId).subscribe(
        () => {
          alert('Cronologia eliminata con successo.');
        },
        (error) => {
          alert('Si è verificato un errore durante l\'eliminazione della cronologia: ' + error.message);
        }
      );
    }
  }
  

}

