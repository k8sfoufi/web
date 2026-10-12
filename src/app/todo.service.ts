import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreateTodo, Lookups, Todo } from './models';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  list() {
    return this.http.get<Todo[]>(`${this.base}/todos`);
  }

  lookups() {
    return this.http.get<Lookups>(`${this.base}/lookups`);
  }

  create(request: CreateTodo) {
    return this.http.post<Todo>(`${this.base}/todos`, request);
  }

  setDone(id: number, isDone: boolean) {
    return this.http.patch<Todo>(`${this.base}/todos/${id}`, { isDone });
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/todos/${id}`);
  }
}
