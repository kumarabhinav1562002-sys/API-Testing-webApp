import { Component, OnInit } from '@angular/core';
import { UnifiedApiService, ApiResponse } from '../../../main';

@Component({
	selector: 'app-response-panel',
	templateUrl: './response-panel.component.html',
	styleUrls: ['./response-panel.component.scss']
})
export class ResponsePanelComponent implements OnInit {
	responses: ApiResponse[] = [];
	constructor(private api: UnifiedApiService) {}
	ngOnInit() {
		this.api.getResponses().subscribe(res => {
			this.responses.unshift(res);
			if (this.responses.length > 20) this.responses = this.responses.slice(0, 20);
		});
	}
}
