import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Creator } from './creator.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreatorsService {
 
backEndURL="http://localhost:8080/creators"
creator =signal<Creator[]>([])
  photo: any;

constructor(private http: HttpClient)
{
	this.getCreators()
}

getCreators():void{
	this.http.get<Creator[]>(this.backEndURL).subscribe(data=>{
		this.creator.set(data)
	})
	
}
 

  addCreator(creator: any, photo: File): Observable<Creator>{
    const formData=new FormData()
    formData.append('id',creator.get('id')?.value)
    formData.append('fullname',creator.get('fullname')?.value)
    formData.append('username',creator.get('username')?.value)
    formData.append('email',creator.get('email')?.value)
    formData.append('password',creator.get('password')?.value)
    formData.append('file',photo)
  
    return this.http.post<Creator>(this.backEndURL,formData).pipe(
      tap(newCreator=>{
      this.creator.update((state: any)=>[...state,newCreator])
    })
   ) }
 /* filtrerCreatorsByNom(fullname:string){
    if ((fullname!="")&&(fullname!=undefined)){
      return this.creators().filter((
        creator: { fullname: string; }
      ) => creator.fullname.toLowerCase().startsWith(fullname.toLowerCase())
    )
    }
 return this.creators
  }
*/
  /*deleteCreator(id:number){
    this.http.delete<boolean>(this.backEndURL+"/"+id).subscribe(retour=>{
      if(retour){
        this.creators.update(state=>state.filter(e=>(e.id!=id)))
      }
    })
    }
   */
  deleteCreator(id: number): Observable<boolean> {
  return this.http.delete<boolean>(this.backEndURL + "/" + id).pipe(
    tap(() => {
      // Update the signal by removing the deleted creator
      this.creator.update(currentCreators => 
        currentCreators.filter(creator => creator.id !== id)
      );
    })
  );
}
 
  /*updateCreator(creator: any){ 
    this.http.put<Creator>(this.backEndURL,creator).subscribe(updatedCreator=>{
     this.creator.update(state=>state.map(e=>(e.id===creator.id)?updatedCreator:e))
    
    })
   }
  */
    updateCreator(creator: any): Observable<Creator> { 
  return this.http.put<Creator>(this.backEndURL, creator).pipe(
    tap(updatedCreator => {
      this.creator.update(state => state.map(e => (e.id === creator.id) ? updatedCreator : e));
    })
  );
}

updateCreatorStatus(creatorId: number, active: boolean): Observable<Creator> {
  const statusUpdate = { id: creatorId, active: active };
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.getToken()}`,
    'Content-Type': 'application/json'
  });
  
  // You created headers but didn't use them! Add { headers } here:
  return this.http.put<Creator>(`${this.backEndURL}/status`, statusUpdate, { headers }).pipe(
    tap(updatedCreator => {
      this.creator.update(state => state.map(e => (e.id === creatorId) ? updatedCreator : e));
    })
  );
}
private getToken(): string {
  return localStorage.getItem('token') || '';
}
  /*
updateCreator(creator: Creator): Observable<Creator> {
  console.log('🔍 Updating creator:', creator);
  return this.http.put<Creator>(`${this.backEndURL}`, creator);
}*/

  


/*updateCreatorStatus(id: number, active: boolean): Observable<any> {
  // Use 'active' instead of 'status' to match your database
  const updateData = { id: id, active: active };
  
  // Change endpoint to match your existing controller
  return this.http.put(`${this.backEndURL}/creator`, updateData).pipe(
    tap(() => {
      // Update the signal with 'active' field
      this.creator.update(currentCreators => 
        currentCreators.map(creator => 
          creator.id === id ? { ...creator, active: active } : creator
        )
      );
    })
  );
}*/
  
}