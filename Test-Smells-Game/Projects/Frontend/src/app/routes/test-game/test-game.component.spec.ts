import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestGameComponent } from './test-game.component';

describe('TestGameComponent', () => {
  let component: TestGameComponent;
  let fixture: ComponentFixture<TestGameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestGameComponent]
    });
    fixture = TestBed.createComponent(TestGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
