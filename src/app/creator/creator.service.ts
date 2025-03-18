import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Creator } from './creator.model';
import { HttpClientModule } from '@angular/common/http'; 
@Injectable({
  providedIn: 'root'
})
export class CreatorService {
	

backEndURL="http://localhost:8080/creators"
creators=signal<Creator[]>([])
constructor(private http:HttpClient){
	this.getCreators()
}
getCreators():void{
	//return this.creators
	this.http.get<Creator[]>(this.backEndURL).subscribe(data=>{
		this.creators.set(data)
	})
	
}

 
 
  addCreator(creator: any, photo: File){
	//this.creator.push(creator)
	const formData=new FormData()
	formData.append('id',creator.get('id')?.value)
	formData.append('fullName',creator.get('fullname')?.value)
	formData.append('userName',creator.get('username')?.value)
	formData.append('email',creator.get('email')?.value)
	formData.append('password',creator.get('password')?.value)
	formData.append('file',photo)

	this.http.post<Creator>(this.backEndURL,formData).subscribe(newCreator=>{
		this.creators.update(state=>[...state,newCreator])
	})
  }
  
  deleteCreator(id:number){
	this.http.delete<boolean>(this.backEndURL+"/"+id).subscribe(retour=>{
		if(retour){
			this.creators.update(state=>state.filter(e=>(e.id!=id)))
		}
	})
  }
  updateCreator(creator:any){
//const index=this.creators.findIndex((currentCreator: { id: any; })=>(currentCreator.id==creator.id))
//this.creators[index]=creator 
this.http.put<Creator>(this.backEndURL,creator).subscribe(updatedCreator=>{
	this.creators.update(state=>state.map(e=>(e.id===creator.id)?updatedCreator:e))

})

}
}