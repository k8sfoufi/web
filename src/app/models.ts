export interface Todo {
  id: number;
  title: string;
  isDone: boolean;
  categoryId: number;
  categoryName: string | null;
  categoryColor: string | null;
  priorityId: number;
  priorityName: string | null;
  comment: string | null;
  createdAtUtc: string;
  completedAtUtc: string | null;
  commentedAtUtc: string | null;
}

export interface Category { id: number; name: string; color: string; }
export interface Priority { id: number; name: string; level: number; }
export interface Lookups { categories: Category[]; priorities: Priority[]; }

export interface CreateTodo { title: string; categoryId: number; priorityId: number; }
