import { Component } from '@angular/core';

//Components
import { List } from './list/list';
import { Reports } from './reports/reports';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-inventory',
  imports: [List, Reports, TabsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class InventoryComponent {

}
