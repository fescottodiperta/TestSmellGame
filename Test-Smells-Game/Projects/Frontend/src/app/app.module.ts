import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {AuthComponent} from './components/auth/auth.component';
import {TopbarComponent} from './components/topbar/topbar.component';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {HomeComponent} from './components/home/home.component';
import {AuthService} from "./services/auth/auth.service";
import {CommonModule} from "@angular/common";
import {CodeEditorComponent} from './components/codeeditor/code-editor.component';
import {
  RefactoringGameCoreRouteComponent
} from './routes/refactoring-game/refactoring-game-core/refactoring-game-core-route.component';
import {ProfileRouteComponent} from './routes/profile-route/profile-route.component';
import {CodemirrorModule} from '@ctrl/ngx-codemirror';
import {
  RefactoringGameExListRouteComponent
} from './routes/refactoring-game/refactoring-game-exercise-list/refactoring-game-ex-list-route.component';
import {CheckGameExListRoute} from './routes/check-smell-game/check-smell-exercise-list/check-game-ex-list-route';
import {CheckGameCoreRouteComponent} from './routes/check-smell-game/check-game-core/check-game-core-route.component';
import {AssignmentsListRoute} from './routes/assignments/assignments-list/assignments-list-route';
import {AssignmentsCoreRouteComponent} from './routes/assignments/assignments-core/assignments-core-route.component';
import {SolutionComponent} from './components/solution/solution.component';
import {LeaderboardRouteComponent} from './routes/leaderboard-route/leaderboard-route.component';
import {LoaderComponent} from './components/loader/loader.component';
import {SettingsRouteComponent} from './routes/settings-route/settings-route.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeRouteComponent } from './routes/home-route/home-route.component';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatListModule} from "@angular/material/list";
import {MatIconModule} from "@angular/material/icon";
import {MatTabsModule} from "@angular/material/tabs";
import {MatCardModule} from "@angular/material/card";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { LogtodoComponent } from './components/logs/logtodo/logtodo.component';
import { LogknownissuesComponent } from './components/logs/logknownissues/logknownissues.component';
import { LogviewerComponent } from './components/logs/logviewer/logviewer.component';
import { LogelementComponent } from './components/logs/logviewer/logelement/logelement.component';
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TestGameComponent } from './routes/test-game/test-game.component';
import { TestSummaryComponent } from './routes/test-summary/test-summary.component';
import { TestHistoryComponent } from './routes/test-history/test-history.component';

export function HttpLoaderFactory(http:HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    TopbarComponent,
    HomeComponent,
    CodeEditorComponent,
    RefactoringGameCoreRouteComponent,
    RefactoringGameExListRouteComponent,
    CheckGameExListRoute,
    CheckGameCoreRouteComponent,
    SolutionComponent,
    LeaderboardRouteComponent,
    LoaderComponent,
    SettingsRouteComponent,
    HomeRouteComponent,
    ProfileRouteComponent,
    LogtodoComponent,
    LogknownissuesComponent,
    LogviewerComponent,
    LogelementComponent,
    AssignmentsListRoute,
    AssignmentsCoreRouteComponent,
    TestGameComponent,
    TestSummaryComponent,
    TestHistoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    CommonModule,
    CodemirrorModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    MatTabsModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule,
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      }
    })
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
