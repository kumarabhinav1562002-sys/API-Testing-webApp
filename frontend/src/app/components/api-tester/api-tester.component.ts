import { Component } from '@angular/core';

@Component({
	selector: 'app-api-tester',
	templateUrl: './api-tester.component.html',
		styleUrls: ['./api-tester.component.scss']
})
export class ApiTesterComponent {
	selectedTab: 'http' | 'ws' | 'sse' = 'http';
}
