import { Component, OnInit, ViewChild  } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Toolbar } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { SplitButton } from 'primeng/splitbutton';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RatingModule } from 'primeng/rating';
import { CommonModule } from '@angular/common';
import { Product, ProductTag } from '../inventory.types';
import { SortEvent } from 'primeng/api';
import { inventoryProducts } from '../dataExample';
import { DetailsComponent } from './details/details';
import { ProductFormService } from './product.service';
import { FormControl, ReactiveFormsModule  } from '@angular/forms';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list',
  imports: [DetailsComponent, Toolbar, ButtonModule, SplitButton, InputTextModule, IconField, InputIcon, TableModule, TagModule, RatingModule, CommonModule, ConfirmDialog, ToastModule, TooltipModule, ReactiveFormsModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list.html',
  styleUrl: './list.css'
})
export class List implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  expandedRows: { [key: string]: boolean } = {};
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading: boolean = false;
  selectedProduct: Product | null = null;
  deleteProduct: Product | null = null;
  showDialogDelete: boolean = false;
  searchInputControl: FormControl = new FormControl();
  isSorted: boolean | null = null;
  items: MenuItem[] | undefined;

  constructor(
    private productFormService: ProductFormService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.products = inventoryProducts;
    this.filteredProducts = [...inventoryProducts];

    this.items = [
      {
        label: 'Update',
        icon: 'pi pi-refresh',
        command: () => this.updateAction()
      },
      {
        label: 'Delete',
        icon: 'pi pi-times',
        command: () => this.deleteAction()
      }
    ];
    this.searchInputControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.filterProducts(searchTerm || '');
      });
  }

  getStatus(status: number) {
    switch (status) {
      case 1:
        return 'En Stock';
      case 2:
          return 'Agotado';
      case 3:
          return 'Bajo Stock';
      default:
        return 'Desconocido';
    }
  }

  getSeverity(status: number) {
    switch (status) {
      case 1:
        return 'success';
      case 2:
          return 'warn';
      case 3:
          return 'danger';
      default:
        return '';
    }
  }

  setupSearch(): void {
    this.searchInputControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.filterProducts(query);
    });
  }

  filterProducts(searchTerm: string): void {
     console.log('Buscando:', searchTerm);
    if (!searchTerm || searchTerm.trim() === '') {
      this.filteredProducts = [...this.products];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product => product.name.toLowerCase().includes(term) || (product.description && product.description.toLowerCase().includes(term)))
  }

  customSort(event: SortEvent) {
    if (this.isSorted == null || this.isSorted === undefined) {
      this.isSorted = true;
      this.sortTableData(event);
    } else if (this.isSorted == true) {
      this.isSorted = false;
      this.sortTableData(event);
    } else if (this.isSorted == false) {
      this.isSorted = null;
      this.products = [...this.filteredProducts];
      this.dt?.reset();
    }
  }

  sortTableData(event: SortEvent) {
    if (!event.data || !event.field || event.field === undefined || event.order === undefined) {
      return;
    }
    event.data.sort((data1: Product, data2: Product) => {
      let value1 = data1[event.field as keyof Product];
      let value2 = data2[event.field as keyof Product];
      if(event.order === undefined) return -1;
      if (value1 == null && value2 != null) return -1 * event.order;
      if (value1 != null && value2 == null) return 1 * event.order;
      if (value1 == null && value2 == null) return 0;
      if (typeof value1 === 'string' && typeof value2 === 'string') {
        return value1.localeCompare(value2) * event.order;
      }
      if (typeof value1 === 'number' && typeof value2 === 'number') {
        return (value1 < value2 ? -1 : value1 > value2 ? 1 : 0) * event.order;
      }
      return 0;
    });
  }

  addNewProduct(event: MouseEvent) {
    event.stopPropagation();
    this.productFormService.openForm(null, []);
  }

  transformProductTags(tags: string[]): ProductTag[] {
  // Si no hay tags, retornar array vacío
  if (!tags || tags.length === 0) {
    return [];
  }

  // Mapear cada string a un ProductTag
  return tags.map((tagString, index) => ({
    id: `temp-${index}`, // ID temporal (puedes generar UUIDs si lo necesitas)
    title: tagString     // El string del tag se convierte en title
  }));
  }

  editProduct(product: Product, event: MouseEvent) {
    event.stopPropagation();
    const tags = this.transformProductTags(product.tags ?? []);
    this.productFormService.openForm(product, tags);
  }

  
 confirmDelete(event: Event, product: Product) {
    this.confirmationService.confirm({
          target: event.target as EventTarget,
          message: '¿Estás seguro que desea eliminar el producto?',
          header: `Eliminar ${product.name}`,
          closable: true,
          closeOnEscape: true,
          icon: 'pi pi-exclamation-triangle',
          rejectButtonProps: {
              label: 'Cancelar',
              severity: 'secondary',
              outlined: true,
          },
          acceptButtonProps: {
              severity: 'danger',
              label: 'Eliminar',
          },
          accept: () => {
              //deletingProduct(product)
              this.messageService.add({  key: "br", severity: 'info', summary: 'Producto Eliminado', detail: `El producto ${product.name} fue eliminado con éxito`, life: 3000 });
          },
          reject: () => {
              this.messageService.add({
                  key: "br",
                  severity: 'error',
                  summary: 'Cancelado',
                  detail: 'Ha cancelado la eliminación',
                  life: 3000,
              });
          },
      });
  }


  onFormClose() {
    this.selectedProduct = null;
  }

  updateAction() { console.log('Actualizar'); }
  deleteAction() { console.log('Eliminar'); }

}
