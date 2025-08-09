import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { Product, ProductTag } from '../inventory.types';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProductFormService {
  isEditMode: boolean = false;
  // Subjects con tipos explícitos y valor inicial
  private _product = new BehaviorSubject<Product | null>(null);
  private _tags = new BehaviorSubject<ProductTag[] | null> (null);
  private _products = new BehaviorSubject<Product[] | null>(null);
  private _showForm = new BehaviorSubject<boolean>(false);

  // Observables públicos readonly
  readonly product$: Observable<Product | null> = this._product.asObservable();
  readonly tags$: Observable<ProductTag[] | null> = this._tags.asObservable();
  readonly products$: Observable<Product[] | null> = this._products.asObservable();
  readonly showForm$: Observable<boolean> = this._showForm.asObservable();
  constructor(private _httpClient: HttpClient)
  {
  }

  // Métodos para cambiar el estado (evito usar set accessors por claridad)
  openForm(product: Product | null = null, tags: ProductTag[]): void {
    this.isEditMode = !!product;
    this._product.next(product || null);
    this._showForm.next(true);
    this._tags.next(tags);
  }

  closeForm(): void {
    this._showForm.next(false);
    // opcional: limpiar el product al cerrar
    this._product.next(null);
    this._tags.next(null);
  }

  setProduct(product: Product | null): void {
    this._product.next(product);
  }

  setProducts(products: Product[] | null): void {
    this._products.next(products);
  }
}