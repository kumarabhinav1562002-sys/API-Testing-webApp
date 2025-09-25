import { Component, OnInit } from '@angular/core';
import { UnifiedApiService, ConnectionState } from '../../../main';

@Component({
	selector: 'app-connection-status',
	templateUrl: './onnection-status.component.html',
		styleUrls: ['./onnection-status.component.scss']
})
export class ConnectionStatusComponent implements OnInit {
	status: string = 'DISCONNECTED';
	constructor(private api: UnifiedApiService) {}
	ngOnInit() {
		this.api.getConnectionStatus().subscribe(state => {
			this.status = state;
		});
	}
}
