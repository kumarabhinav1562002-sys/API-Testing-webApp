import { Component, Input } from '@angular/core';
import { UnifiedApiService, HttpMethod, ApiType } from '../../../main';

@Component({
	selector: 'app-request-panel',
	templateUrl: './request-panel.component.html',
	styleUrls: ['./request-panel.component.scss']
})
export class RequestPanelComponent {
	@Input() type: 'HTTP' | 'WEBSOCKET' | 'SSE' = 'HTTP';

		httpMethods = [
			HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.PATCH, HttpMethod.DELETE
		];
		httpMethod: HttpMethod = HttpMethod.GET;
	httpUrl = '';
	httpBody = '';

	wsUrl = '';
	wsConnected = false;
	wsMessage = '';

	sseUrl = '';
	sseConnected = false;

	constructor(private api: UnifiedApiService) {}

	sendHttp() {
			const req = {
				id: Date.now().toString(),
				type: ApiType.HTTP,
				url: this.httpUrl,
				method: this.httpMethod,
				headers: {},
				body: this.httpBody ? JSON.parse(this.httpBody) : undefined,
				timestamp: new Date()
			};
			this.api.sendHttpRequest(req).subscribe();
	}

	connectWs() {
		this.api.connectWebSocket(this.wsUrl).subscribe();
		this.wsConnected = true;
	}
	sendWs() {
		this.api.sendWebSocketMessage(this.wsMessage);
		this.wsMessage = '';
	}
	disconnectWs() {
		this.api.disconnectWebSocket();
		this.wsConnected = false;
	}

	connectSse() {
		this.api.connectSSE(this.sseUrl).subscribe();
		this.sseConnected = true;
	}
	disconnectSse() {
		this.api.disconnectSSE();
		this.sseConnected = false;
	}
}
