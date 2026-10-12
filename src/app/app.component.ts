import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Lookups, Todo } from './models';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly api = inject(TodoService);

  readonly todos = signal<Todo[]>([]);
  readonly lookups = signal<Lookups | null>(null);
  readonly error = signal<string | null>(null);
  readonly lookupsError = signal<string | null>(null);
  readonly loading = signal(true);
  readonly pending = computed(() => this.todos().filter((t) => !t.isDone).length);

  title = '';
  categoryId: number | null = null;
  priorityId: number | null = null;

  private refreshTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.load();
    this.loadLookups();
    // The background job adds comments server-side, so poll to show them.
    this.refreshTimer = setInterval(() => this.load(), 30_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshTimer);
  }

  load(): void {
    this.api.list().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.error.set(null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Cannot reach the server. Retrying automatically.');
        this.loading.set(false);
      },
    });
  }

  loadLookups(): void {
    this.api.lookups().subscribe({
      next: (lookups) => {
        this.lookups.set(lookups);
        this.lookupsError.set(null);
        this.categoryId ??= lookups.categories[0]?.id ?? null;
        this.priorityId ??= lookups.priorities[0]?.id ?? null;
      },
      error: () =>
        this.lookupsError.set('Categories are unavailable, so new todos cannot be added right now.'),
    });
  }

  get canAdd(): boolean {
    return !!this.title.trim() && this.categoryId !== null && this.priorityId !== null;
  }

  add(): void {
    if (!this.canAdd) return;
    this.api
      .create({ title: this.title.trim(), categoryId: this.categoryId!, priorityId: this.priorityId! })
      .subscribe({
        next: () => {
          this.title = '';
          this.load();
        },
        error: (e) => this.error.set(e?.error?.detail ?? 'The todo could not be added.'),
      });
  }

  toggle(todo: Todo): void {
    this.api.setDone(todo.id, !todo.isDone).subscribe({
      next: () => this.load(),
      error: () => this.error.set('The todo could not be updated.'),
    });
  }

  remove(todo: Todo): void {
    this.api.remove(todo.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('The todo could not be deleted.'),
    });
  }
}
