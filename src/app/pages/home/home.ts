import {Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectComponent} from '@ng-select/ng-select';
import {Api} from '../../services/api';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgSelectComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private apiService = inject(Api);
  private toastr = inject(ToastrService);
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  selectedFile = signal<File | null>(null);

  databases = signal<{name: string, value: string}[]>([]);

  ngOnInit() {
    this.apiService.getAvailableDatabases().subscribe(data => {
      console.log(data)
      this.databases.set(data.map(db => ({ name: db, value: db })));
    });
  }
  selected = null;

  sortOptions = [
    { name: 'Najnovšie na vrchu', value: 'DESCENDING' },
    { name: 'Najstaršie na vrchu', value: 'ASCENDING' }
  ];
  selectedSort = 'DESCENDING';

  isDragOver = false;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.selectedFile.set(file);
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.selectedFile.set(input.files[0]);
  }


  onSubmit(): void {
    if (!this.selectedFile() || !this.selected) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile()!);
    formData.append('bank', 'TATRABANKA');
    formData.append('sortOrder', this.selectedSort);
    formData.append('db', this.selected);

    this.apiService.uploadFile(formData).subscribe({
      next: () => {
        this.toastr.success('Súbor bol úspešne nahratý', 'Hotovo');
        this.selectedFile.set(null);
        this.fileInputRef.nativeElement.value = '';
      },
      error: (err) => {
        this.toastr.error('Nastala chyba pri nahrávaní', 'Chyba');
        console.error(err);
      }
    });
  }

  shutdown(): void{
    this.apiService.shutdown().subscribe({
      next: () => {
        this.toastr.success('aplikácia úspečne vypnutá', 'Hotovo');
      },
      error: (err) => {
        this.toastr.error('Nastala chyba pri vypínaní', 'Chyba');
        console.error(err);
      }
    });

  }

}
