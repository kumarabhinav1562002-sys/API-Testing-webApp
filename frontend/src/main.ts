import { bootstrapApplication } from '@angular/platform-browser';
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppComponent } from './app/app.component';

export enum ApiType {
  HTTP = 'HTTP',
  WEBSOCKET = 'WEBSOCKET',
  SSE = 'SSE'
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

export interface ApiRequest {
  id: string;
  type: ApiType;
  url: string;
  method?: HttpMethod;
  headers: { [key: string]: string };
  body?: any;
  message?: string;
  timestamp: Date;
}

export interface ApiResponse {
  id: string;
  requestId: string;
  type: ApiType;
  status?: number;
  statusText?: string;
  data: any;
  headers?: { [key: string]: string };
  responseTime: number;
  timestamp: Date;
  isLive?: boolean;
}

export interface WebSocketEvent {
  type: 'message' | 'open' | 'close' | 'error';
  data?: any;
  timestamp: Date;
}

export interface SSEEvent {
  type: string;
  data: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class UnifiedApiService {
  private websocket: WebSocket | null = null;
  private eventSource: EventSource | null = null;
  private connectionStatus = new BehaviorSubject<ConnectionState>(ConnectionState.DISCONNECTED);
  private responseSubject = new Subject<ApiResponse>();
  private historySubject = new BehaviorSubject<ApiRequest[]>([]);
  private history: ApiRequest[] = [];

  constructor(private http: HttpClient) {}

  sendHttpRequest(request: ApiRequest): Observable<ApiResponse> {
    const startTime = Date.now();
    const headers = new HttpHeaders(request.headers);

    let httpRequest: Observable<any>;

    switch (request.method) {
      case HttpMethod.GET:
        httpRequest = this.http.get(request.url, { headers, observe: 'response' });
        break;
      case HttpMethod.POST:
        httpRequest = this.http.post(request.url, request.body, { headers, observe: 'response' });
        break;
      case HttpMethod.PUT:
        httpRequest = this.http.put(request.url, request.body, { headers, observe: 'response' });
        break;
      case HttpMethod.DELETE:
        httpRequest = this.http.delete(request.url, { headers, observe: 'response' });
        break;
      case HttpMethod.PATCH:
        httpRequest = this.http.patch(request.url, request.body, { headers, observe: 'response' });
        break;
      default:
        httpRequest = this.http.get(request.url, { headers, observe: 'response' });
    }

    return new Observable(observer => {
      httpRequest.subscribe({
        next: (response: any) => {
          const apiResponse: ApiResponse = {
            id: this.generateId(),
            requestId: request.id,
            type: ApiType.HTTP,
            status: response.status,
            statusText: response.statusText,
            data: response.body,
            headers: this.extractHeaders(response.headers),
            responseTime: Date.now() - startTime,
            timestamp: new Date()
          };
          observer.next(apiResponse);
          observer.complete();
        },
        error: (error) => {
          const apiResponse: ApiResponse = {
            id: this.generateId(),
            requestId: request.id,
            type: ApiType.HTTP,
            status: error.status || 0,
            statusText: error.statusText || 'Error',
            data: error.error || error.message,
            responseTime: Date.now() - startTime,
            timestamp: new Date()
          };
          observer.next(apiResponse);
          observer.complete();
        }
      });
    });
  }

  connectWebSocket(url: string): Observable<WebSocketEvent> {
    return new Observable(observer => {
      this.connectionStatus.next(ConnectionState.CONNECTING);
      this.websocket = new WebSocket(url);

      this.websocket.onopen = () => {
        this.connectionStatus.next(ConnectionState.CONNECTED);
        observer.next({ type: 'open', timestamp: new Date() });
      };

      this.websocket.onmessage = (event) => {
        observer.next({
          type: 'message',
          data: JSON.parse(event.data),
          timestamp: new Date()
        });
      };

      this.websocket.onclose = () => {
        this.connectionStatus.next(ConnectionState.DISCONNECTED);
        observer.next({ type: 'close', timestamp: new Date() });
      };

      this.websocket.onerror = (error) => {
        this.connectionStatus.next(ConnectionState.ERROR);
        observer.next({ type: 'error', data: error, timestamp: new Date() });
      };
    });
  }

  sendWebSocketMessage(message: any): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    }
  }

  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  connectSSE(url: string): Observable<SSEEvent> {
    return new Observable(observer => {
      this.connectionStatus.next(ConnectionState.CONNECTING);
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        this.connectionStatus.next(ConnectionState.CONNECTED);
      };

      this.eventSource.onmessage = (event) => {
        observer.next({
          type: 'message',
          data: JSON.parse(event.data),
          timestamp: new Date()
        });
      };

      this.eventSource.onerror = () => {
        this.connectionStatus.next(ConnectionState.ERROR);
        observer.error('SSE connection error');
      };
    });
  }

  disconnectSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.connectionStatus.next(ConnectionState.DISCONNECTED);
    }
  }

  getConnectionStatus(): Observable<ConnectionState> {
    return this.connectionStatus.asObservable();
  }

  getResponses(): Observable<ApiResponse> {
    return this.responseSubject.asObservable();
  }

  getHistory(): Observable<ApiRequest[]> {
    return this.historySubject.asObservable();
  }

  addToHistory(request: ApiRequest): void {
    this.history.unshift(request);
    if (this.history.length > 100) {
      this.history = this.history.slice(0, 100);
    }
    this.historySubject.next([...this.history]);
  }

  clearHistory(): void {
    this.history = [];
    this.historySubject.next([]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private extractHeaders(headers: any): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    if (headers && headers.keys) {
      headers.keys().forEach((key: string) => {
        result[key] = headers.get(key);
      });
    }
    return result;
  }
}

bootstrapApplication(AppComponent);