import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges  } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { Product, ProductTag, ProductBrand, ProductCategory, ProductStatus } from '../../inventory.types';
import { ProductFormService } from '../product.service';
import { combineLatest, filter, Observable, Subject, Subscription, takeUntil } from 'rxjs';

export interface ProductTagView extends ProductTag {
  checkedControl: UntypedFormControl;
}

@Component({
  selector: 'app-details',
  imports: [Dialog, ToastModule, FormsModule, ReactiveFormsModule, FloatLabelModule, SelectModule, ToggleSwitchModule, InputTextModule, AutoCompleteModule, InputNumberModule, ToggleButtonModule, CheckboxModule, ButtonModule, TagModule, TextareaModule ],
  providers: [MessageService],
  templateUrl: './details.html',
  styleUrl: './details.css'
})
export class DetailsComponent  implements OnInit, AfterViewInit, OnDestroy {
  visible: boolean = false;
  isEditMode: boolean = false;
  product$!: Observable<Product | null>;
  currentProduct: Product | null = null;
  showForm = false;
  checked: boolean = false;
  searchInputControl: UntypedFormControl = new UntypedFormControl();
  selectedProductForm!: UntypedFormGroup;
  tags: ProductTag[] = [];
  filteredTags: ProductTagView[] = [];
  brands: ProductBrand[] = [];
  status: ProductStatus[] = [];
  categories: ProductCategory[] = [];
  tagsEditMode: boolean = false;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  constructor(
    private _formBuilder: UntypedFormBuilder,
    private productFormService: ProductFormService,
    private messageService: MessageService
  )
  {}

  ngOnInit(): void
  {
    // Create the selected product form
    this.selectedProductForm = this._formBuilder.group({
        id               : [''],
        code             : [''],
        name             : ['', [Validators.required]],
        category         : [''],
        location         : ['', [Validators.required]],
        description      : [''],
        tags             : [[]],
        barcode          : [''],
        brand            : [''],
        quantity         : [''],
        status           : [''],
        cost             : [''],
        basePrice        : [''],
        taxPercent       : [''],
        price            : [''],
        thumbnail        : [''],
        images           : [[]],
        currentImageIndex: [0], // Image index that is currently being viewed
        active           : [false],
    });

  // Suscribirse a los cambios
  combineLatest([
    this.productFormService.product$,
    this.productFormService.showForm$
  ])
   .pipe(
    takeUntil(this._unsubscribeAll),
    filter(([_, showForm]) => showForm) // Solo si realmente queremos mostrar el form
  )
    .subscribe(([product]) => {
      this.visible = true;
      if (product) {
        // EDITAR
        this.isEditMode = true;
        this.currentProduct = product;
        this.selectedProductForm.patchValue(product);
        this.initTags(product.tags || []);
      } else {
        // CREAR
        this.isEditMode = false;
        this.selectedProductForm.reset();
        this.currentProduct = null;
        this.initTags([]);
      }
    });

  this.productFormService.tags$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(tags => {
      if (tags) {
        this.tags = tags;
        this.filteredTags = this.tags.map(tag => ({
          ...tag,
          checkedControl: new UntypedFormControl(!!tag.id && this.currentProduct?.tags?.includes(tag.id) || false)
        }));
    }});

  this.productFormService.showForm$
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(show => this.showForm = show);

  }

  ngAfterViewInit(): void
  {}

  ngOnDestroy(): void
  {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }


  closeForm() {
    this.productFormService.closeForm();
    this.visible = false;
  }


  getStatus(status: number | undefined) {
    if(status === undefined) return '';
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

  getSeverity(status: number | undefined) {
    if(status === undefined) return '';
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

  saveChanges() {
  if (this.selectedProductForm.invalid) {
    this.messageService.add({ severity: 'error', summary: 'Formulario inválido' });
    return;
  }

  const formValue = this.selectedProductForm.value;

  if (this.isEditMode) {
    // Lógica de actualización
    this.messageService.add({ severity: 'error', summary: 'Error al Guardar', detail: 'Ocurrió un error al guardar los cambios.', life: 3000 });
    // this.productFormService.updateProduct(formValue);
  } else {
    // Lógica de creación
    // this.productFormService.createProduct(formValue);
    this.messageService.add({ severity: 'success', summary: 'Guardado con éxito', detail: 'Los datos se guardaron con éxito', life: 3000 });
  }
  this.closeForm();
}


  private initTags(selectedTagIds: string[]) {
    this.filteredTags = this.tags.map(tag => ({
      ...tag,
      checkedControl: new UntypedFormControl(selectedTagIds.includes(tag.id || ''))
    }));
  }

  toggleTagsEditMode(): void
  {
    this.tagsEditMode = !this.tagsEditMode;
  }

      /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event: Event): void
    {
      // Get the value
      const input = event.target as HTMLInputElement;
      const value = input.value.toLowerCase();

      // Filter the tags
      const filteredBaseTags = this.tags.filter(tag =>
        (tag.title ?? '').toLowerCase().includes(value)
      );

      this.filteredTags = filteredBaseTags.map(tag => ({
        ...tag,
        checkedControl: new UntypedFormControl(this.currentProduct?.tags?.includes(tag.id ?? '') || false)
      }));
    }

    /**
     * Filter tags input key down event
     *
     * @param event
     */
    filterTagsInputKeyDown(event: KeyboardEvent): void
    {
      const input = event.target as HTMLInputElement;
      
      // Return if the pressed key is not 'Enter'
      if ( event.key !== 'Enter' )
      {
        return;
      }

        // If there is no tag available...
        if ( this.filteredTags.length === 0 )
        {
            // Create the tag
            this.createTag(input.value);

            // Clear the input
            input.value = '';

            // Return
            return;
        }

        // If there is a tag...
        const tag = this.filteredTags[0];
        const isTagApplied = this.currentProduct?.tags?.find(id => id === tag.id);

        // If the found tag is already applied to the product...
        if ( isTagApplied )
        {
            // Remove the tag from the product
            this.removeTagFromProduct(tag);
        }
        else
        {
            // Otherwise add the tag to the product
            this.addTagToProduct(tag);
        }
    }

    /**
     * Create a new tag
     *
     * @param title
     */
    createTag(title: string): void
    {
      const tag = {
          id: "5435",
          title,
      };
        
      // Create tag on the server
      this.addTagToProduct(tag);

      // this._inventoryService.createTag(tag)
      //     .subscribe((response) =>
      //     {
      //         // Add the tag to the product
              
      //     });
    }

    /**
     * Update the tag title
     *
     * @param tag
     * @param event
     */
    updateTagTitle(tag: ProductTag, event: Event): void
    {
      const input = event.target as HTMLInputElement;

      // Update the title on the tag
      tag.title = input.value;

      // Update the tag on the server
      // this._inventoryService.updateTag(tag.id, tag)
      //     .pipe(debounceTime(300))
      //     .subscribe();
    }

    /**
     * Delete the tag
     *
     * @param tag
     */
    deleteTag(tag: ProductTag): void
    {
        // Delete the tag from the server
        // this._inventoryService.deleteTag(tag.id).subscribe();

        // Mark for check
        // this._changeDetectorRef.markForCheck();
    }

        /**
     * Add tag to the product
     *
     * @param tag
     */
    addTagToProduct(tag: ProductTag): void
    {
      if (!this.currentProduct || !this.selectedProductForm || !tag.id ) return;
      // Add the tag
      this.currentProduct?.tags?.unshift(tag.id);

        // Update the selected product form
        this.selectedProductForm.get('tags')?.patchValue(this.currentProduct.tags);

        // Mark for check
        // this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove tag from the product
     *
     * @param tag
     */
    removeTagFromProduct(tag: ProductTag): void
    {
      if (!this.selectedProductForm) return;
        // Remove the tag
        this.currentProduct?.tags?.splice(this.currentProduct.tags.findIndex(item => item === tag.id), 1);

        // Update the selected product form
        this.selectedProductForm.get('tags')?.patchValue(this.currentProduct?.tags);

        // Mark for check
        // this._changeDetectorRef.markForCheck();
    }

    /**
     * Toggle product tag
     *
     * @param tag
     * @param change
     */
    toggleProductTag(tag: ProductTag, change: CheckboxChangeEvent): void
    {
        if ( change.checked )
        {
            this.addTagToProduct(tag);
        }
        else
        {
            this.removeTagFromProduct(tag);
        }
    }

        /**
     * Should the create tag button be visible
     *
     * @param inputValue
     */
    shouldShowCreateTagButton(inputValue: string): boolean
    {
        return !!!(inputValue === '' || this.tags.findIndex(tag => (tag.title ?? '').toLowerCase() === inputValue.toLowerCase()) > -1);
    }
}
