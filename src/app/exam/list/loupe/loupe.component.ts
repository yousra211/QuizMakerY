
import { Component, Output } from '@angular/core';
import { FormsModule} from '@angular/forms';
import { ListComponent } from '../list.component';
import { EventEmitter } from '@angular/core';
@Component({
  
  selector: 'app-loupe',
  standalone: true,
  imports: [],
  templateUrl: './loupe.component.html',
  styleUrl: './loupe.component.css'
})
export class LoupeComponent {
 @Output() childEvent = new EventEmitter(); 
 opacity: string
 value: string
 constructor(private listComponent : ListComponent){
 this.opacity="0"
 this.value=""
 }
 afficherInput(){
 this.opacity="1"
 }
 masquerInput(){
 if ((this.value==undefined)||(this.value==""))
  this.opacity="0"
 }
 reload(){
 this.listComponent.ngAfterViewInit()
 }
 filtrerData(){
 this.childEvent.emit(this.value)
 }
}

