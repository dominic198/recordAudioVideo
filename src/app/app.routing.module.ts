import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AudioComponent } from './audio/audio.component';
import { VideoComponent } from './video/video.component';

const routes: Routes = [
    {  path: '',
       component: AudioComponent,
       pathMatch: 'full',
   }, 
   {  path: 'video',
   component: VideoComponent,
   pathMatch: 'full',
}, 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {


 }