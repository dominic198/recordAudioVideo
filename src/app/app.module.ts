import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AudioRecordingService } from './audio-recording.service';
import { VideoRecordingService } from './video-recording.service';
import { RecordingService } from './recording.service';
import { AppRoutingModule } from './app.routing.module';
import { AppComponent } from './app.component';
import { AudioComponent } from './audio/audio.component';
import { VideoComponent } from './video/video.component';

@NgModule({
  declarations: [
    AppComponent,
    AudioComponent,
    VideoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [AudioRecordingService,VideoRecordingService,RecordingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
