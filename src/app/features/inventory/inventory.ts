import { Component } from '@angular/core';

//Components
import { List } from './list/list';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-inventory',
  imports: [List, TabsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class InventoryComponent {

}
