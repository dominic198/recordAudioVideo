import { Component, OnDestroy, ViewChild, AfterViewInit  } from '@angular/core';
import { VideoRecordingService } from '../video-recording.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnDestroy, AfterViewInit{
  title = 'recordingTest';
  isRecording = false;
  recordedTime;
  blobUrl;
  blob;
  stream;
  recordingType;
 
  @ViewChild('video',{static:true}) video: any; 

  constructor(private recordingService: VideoRecordingService){
    this.recordingService.recordingFailed().subscribe(() => {
      this.isRecording = false;
    });

    this.recordingService.getRecordedTime().subscribe((time) => {
      this.recordedTime = time;
    });

    this.recordingService.getRecordedBlob().subscribe((data) => {
      this.blob = data.blob;     
    });
  }

  ngAfterViewInit() {
    let video:HTMLVideoElement = this.video.nativeElement;
      video.muted = false;
      video.controls = true;
      video.autoplay = false; 
      this.startRecording();
  }
 
  startRecording() { 
      this.isRecording = true;      
      let video:HTMLVideoElement = this.video.nativeElement;
      this.recordingService.startRecording(video); 
      this.toggleControls();
      setTimeout(() =>{this.stopRecording()},35000)
  }

  toggleControls() {
     let video: HTMLVideoElement = this.video.nativeElement;
      video.muted = !video.muted;
      video.controls = !video.controls;
      video.autoplay = !video.autoplay;  
  }

  abortRecording() {
    if (this.isRecording) {
      this.isRecording = false;
      this.recordingService.abortRecording();
    }
  }
  
  stopRecording() {    

      this.isRecording = false;      
      let video: HTMLVideoElement = this.video.nativeElement;
      video.srcObject = null;
      video.src = window.URL.createObjectURL(this.blob);
      this.toggleControls();
  }

  clearRecordedData() {
    this.blobUrl = null;
  }

  ngOnDestroy(): void {
    this.abortRecording();
  }
}

