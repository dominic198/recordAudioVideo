import { Component, OnDestroy, ViewChild, AfterViewInit  } from '@angular/core';
import { AudioRecordingService } from './audio-recording.service';
import { VideoRecordingService } from './video-recording.service';
import { RecordingService } from './recording.service';

import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy, AfterViewInit{
  title = 'recordingTest';
  isRecording = false;
  recordedTime;
  blobUrl;
  blob;
  stream;
  recordingType;

  @ViewChild('audio',{static:true}) audio: any;
  @ViewChild('video',{static:true}) video: any;
  @ViewChild('recordingtype',{static:true}) recordingtype: any;

  constructor(private recordingService: RecordingService,private sanitizer: DomSanitizer){
    this.recordingService.recordingFailed().subscribe(() => {
      this.isRecording = false;
    });

    this.recordingService.getRecordedTime().subscribe((time) => {
      this.recordedTime = time;
    });

    this.recordingService.getRecordedBlob().subscribe((data) => {
      this.blob = data.blob;
      this.blobUrl = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(data.blob));
    });
  }

  ngAfterViewInit() {
    // set the initial state of the video
    if(this.video != undefined){
    
      let video:HTMLVideoElement = this.video.nativeElement;
      video.muted = false;
      video.controls = true;
      video.autoplay = false;     
    }
  }

  chooseType(){
    this.recordingType = this.recordingtype.nativeElement.value;
    this.startRecording();
  }

  startRecording() {
   this.clearRecordedData();
    if(!this.isRecording && this.recordingType == 'audio'){     
      this.isRecording = true;
      this.recordingService.startRecordingAudio();    
    }else if (!this.isRecording && this.recordingType == 'video') {     
      this.isRecording = true;      
      let video:HTMLVideoElement = this.video.nativeElement;
      this.recordingService.startRecordingVideo(video); 
      this.toggleControls();
      setTimeout(() =>{this.stopRecording()},50000)
     
    }
  }

  toggleControls() {
    if(this.video != undefined){
      let video: HTMLVideoElement = this.video.nativeElement;
      video.muted = !video.muted;
      video.controls = !video.controls;
      video.autoplay = !video.autoplay;
    }   
  }

  abortRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.recordingService.abortRecording();
    }
  }
  
  stopRecording() {    

    if (this.isRecording && this.recordingType == 'video' && this.video != undefined) {
      //this.videoRecordingService.stopRecording();
      this.isRecording = false;      
      let video: HTMLVideoElement = this.video.nativeElement;
      video.srcObject = null;
      video.src = window.URL.createObjectURL(this.blob);
      this.toggleControls();
    }else if(this.isRecording && this.recordingType == 'audio'){
      this.recordingService.stopRecordingAudio();
      this.isRecording = false; 
      let audio: HTMLAudioElement = this.audio.nativeElement;
      audio.src = this.blobUrl;
      console.log('stopped')
    }
  }

  clearRecordedData() {
    this.blobUrl = null;
  }

  ngOnDestroy(): void {
    this.abortRecording();
  }
}
