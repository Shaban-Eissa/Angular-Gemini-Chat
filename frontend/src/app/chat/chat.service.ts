import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

export interface AskRequestBody {
  question: string;
}

export interface AskResponseBody {
  answer: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private baseUrl = environment.backendUrl;

  ask(question: string): Observable<AskResponseBody> {
    return this.http.post<AskResponseBody>(`${this.baseUrl}/ask`, { question } satisfies AskRequestBody);
  }
}


