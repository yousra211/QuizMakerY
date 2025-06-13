import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit, signal  } from '@angular/core';
import { CreatorsService } from '../creators.service';
import { HttpHeaders } from '@angular/common/http';

import { ConfirmComponent } from './confirm/confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormComponent } from '../form/form.component';
import { Creator } from '../creator.model';
import { LoginService } from '../../login/login.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule , FormsModule], 
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})

export class ListComponent implements OnInit {

creator = signal<Creator[]>([]);
	filteredCreators: any[] = [];  // zitom so admin can see creators list 
	searchTerm: string = '';     //creators list 
  creatorToDelete: number | null = null;

	//searchTerm = signal('');
  //creators = this.creatorService.creators;

	constructor(
		private creatorService : CreatorsService ,
		private modalService: NgbModal , private loginService: LoginService,
		private router: Router
	){}



	ngOnInit():void{
	
		 // Simple admin check - redirect if not admin
		 if (!this.loginService.isAdmin()) {
			this.router.navigate(['/home']);
			return;
		  }
		this.creator= this.creatorService.creator;
      this.filterCreators();
	}

	openModal(){
		this.modalService.open(FormComponent)
	}

  
	
deleteCreator(id: number) {
  //const confirmed = confirm('Are you sure you want to delete this creator?');
 // if (confirmed) {
this.creatorService.deleteCreator(id).subscribe(
       () => {
        console.log('Creator deleted');      
       this.filterCreators();
  
 });
 // }
}

/*deleteCreator(id: number) {
  this.creatorToDelete = id;
  const modal = new (window as any).bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  modal.show();
}*/

confirmDelete() {
  if (this.creatorToDelete) {
    this.creatorService.deleteCreator(this.creatorToDelete).subscribe(
      () => {
        console.log('Creator deleted');      
        this.filterCreators();
        
        // Close modal
        const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
        modal.hide();
        this.creatorToDelete = null;
      }
    );
  }
}
openDeleteModal(creator: any): void {
  const dialogRef = this.modalService.open(ConfirmComponent);
  dialogRef.componentInstance.creatorData = creator;

  dialogRef.result.then(result => {
    if (result === 'ok') {
      this.deleteCreator(creator.id); // proceed with deletion
    }
  }).catch(() => {
    // User cancelled
  });
}

  //  toggle method  zidta
/*toggleStatus(creator: any) {
  creator.active = !creator.active;
  
  this.creatorService.updateCreator(creator).subscribe({
    next: (updatedCreator) => {
      console.log('Status updated successfully');
      this.filterCreators();
    },
    error: (error) => {
      console.error('Failed to update status:', error);
      creator.active = !creator.active;
    }
  });
}*/

/// zidta 


  filterCreators(): void {
  if (!this.searchTerm) {
    this.filteredCreators = [...this.creatorService.creator()];
    return;
  }
  
  this.filteredCreators = this.creatorService.creator().filter(creator =>
    creator.fullname.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
    creator.email.toLowerCase().includes(this.searchTerm.toLowerCase())
  );
}

// In your component
toggleCreatorStatus(creator: any) {
  const newStatus = !creator.active; 
  
  this.creatorService.updateCreatorStatus(creator.id, newStatus).subscribe({
    next: () => {
      console.log(`Creator ${creator.id} status updated to ${newStatus}`);
      this.filterCreators();
    },
    error: (error) => {
      console.error('Error updating creator status:', error);
    }
  });
}

updateCreator(creator:any){
	const dialogRef=this.modalService.open(FormComponent)
	dialogRef.componentInstance.creatorData=creator
	dialogRef.componentInstance.action="Modifier"
}




}