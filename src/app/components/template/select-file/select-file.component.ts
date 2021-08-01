import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-select-file',
  templateUrl: './select-file.component.html',
  styleUrls: ['./select-file.component.css'],
})
export class SelectFileComponent implements OnInit {
  public fileName: string = '';
  public file: File = {} as File;
  public disabled: boolean = true;
  public wrongFile: string = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { btnClose: boolean }) {}

  ngOnInit(): void {}

  public onFileSelected(event: any) {
    this.file = event.target.files[0];

    if (this.file) {
      this.fileName = this.file.name;

      if (!this.file.type.startsWith('application/json')) {
        this.wrongFile = 'The file must have an .json extension';
        this.disabled = true;
      } else {
        this.wrongFile = '';
        this.disabled = false;
      }
    }
  }
}
