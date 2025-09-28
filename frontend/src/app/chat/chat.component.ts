import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from './chat.service'
import { environment } from '../../environments/environment';
import { marked } from 'marked';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  constructor(@Inject(ChatService) private chatService: ChatService) { }

  messages = signal<ChatMessage[]>([]);
  input = signal<string>('');
  isSending = signal<boolean>(false);

  readonly modelName = 'gemini-2.5-flash';
  readonly embeddingModel = 'text-embedding-004';
  readonly topK = 3;
  readonly backendUrl = environment.backendUrl;

  canSend = computed(() => !this.isSending() && this.input().trim().length > 0);

  renderedContent(message: ChatMessage): string {
    if (message.role === 'assistant') {
      return marked.parse(message.content, { async: false }) as string;
    }
    return message.content;
  }

  onTextareaInput(event: Event) {
    const target = event.target as HTMLTextAreaElement | null;
    if (!target) return;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  }

  onTextareaEnter(event: Event) {
    const e = event as KeyboardEvent;
    if (e.shiftKey) return;
    if (!this.canSend()) return;
    e.preventDefault();
    void this.send();
  }

  async send() {
    const text = this.input().trim();
    if (!text) return;
    this.isSending.set(true);
    this.messages.update((m) => [...m, { role: 'user', content: text }]);
    this.input.set('');
    try {
      const reply = await this.chatService.ask(text).toPromise();
      const answer = reply?.answer ?? 'No answer.';
      this.messages.update((m) => [...m, { role: 'assistant', content: answer }]);
    } catch (err) {
      this.messages.update((m) => [...m, { role: 'assistant', content: '⚠️ Something went wrong, try again.' }]);
    } finally {
      this.isSending.set(false);
    }
  }
}


