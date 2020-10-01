import { Injectable, NgZone } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { isNullOrUndefined } from 'util';

interface RecordedOutput {
    blob: Blob;
    title: string;
  }
  @Injectable()
  export class RecordingService {

    private stream;
    private recorder;
    private interval;
    private startTime;
    private _recorded = new Subject<RecordedOutput>();   
    private _recordingTime = new Subject<string>();
    private _recordingFailed = new Subject<string>();
  
 
     getRecordedBlob(): Observable<RecordedOutput> {
       return this._recorded.asObservable();
     }
   
     getRecordedTime(): Observable<string> {
       return this._recordingTime.asObservable();
     }
   
     recordingFailed(): Observable<string> {
       return this._recordingFailed.asObservable();
     }  

     startRecordingAudio() {  
        if (this.recorder) {
          // It means recording is already started or it is already recording something
          return;
        }
    
        this._recordingTime.next('00:00');
        navigator.mediaDevices.getUserMedia({ audio: true }).then(s => {         
          this.recordAudio();
        }).catch(error => {
          this._recordingFailed.next();         
        });
    
      }

      startRecordingVideo(video:HTMLVideoElement) {        
        if (this.recorder) {
          // It means recording is already started or it is already recording something       
          return;
        }
    
        this._recordingTime.next('00:00');
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(s => {
          this.stream = s; 
          video.srcObject = s;        
          this.recordVideo();       
        }).catch(error => {
          this._recordingFailed.next();
        });
        setTimeout(()=>{ video.srcObject = null; this.stopRecordingVideo(video)}, 30000);
      }

      abortRecording() {
        this.stopMediaVideo();
      }

    
      private recordAudio() {
    
        this.recorder = new RecordRTC.StereoAudioRecorder(this.stream, {
          type: 'audio',
          mimeType: 'audio/webm'
        });
    
        this.recorder.record();
        this.startTime = moment();
        this.interval = setInterval(
          () => {
            const currentTime = moment();
            const diffTime = moment.duration(currentTime.diff(this.startTime));
            const time = this.toString(diffTime.minutes()) + ':' + this.toString(diffTime.seconds());
            this._recordingTime.next(time);
          },
          1000
        );
      }

      private recordVideo() {  
        this.recorder = new RecordRTC.MediaStreamRecorder(this.stream, {
          type: 'video',
          mimeType: 'video/webm'
        });
    
        this.recorder.record();
        this.startTime = moment();
        this.interval = setInterval(
          () => {
            const currentTime = moment();
            const diffTime = moment.duration(currentTime.diff(this.startTime));
            const time = this.toString(diffTime.minutes()) + ':' + this.toString(diffTime.seconds());
            this._recordingTime.next(time);
          },
          1000
        );
      }
    
      private toString(value) {
        let val = value;
        if (!value) {
          val = '00';
        }
        if (value < 10) {
          val = '0' + value;
        }
        return val;
      }

      stopRecordingAudio() {
  
        if (this.recorder) {
          this.recorder.stop((blob) => {
            if (this.startTime) {
              const mp3Name = encodeURIComponent('audio_' + new Date().getTime() + '.mp3');
              this.stopMediaAudio();
              this._recorded.next({ blob: blob, title: mp3Name });
            }
          }, () => {
            this.stopMediaAudio();
            this._recordingFailed.next();
          });
        }
      }

      stopRecordingVideo(video:HTMLVideoElement) {
        console.log('stopping!')
         if (this.recorder) {
           this.recorder.stop((blob) => {
             if (this.startTime) {
               const webmName = encodeURIComponent('video_' + new Date().getTime() + '.webm');
               this.stopMediaVideo();
               this._recorded.next({ blob: blob, title: webmName });
             }
           }, () => {
             this.stopMediaVideo();
             this._recordingFailed.next();
           });
         }       
       }

      
      private stopMediaAudio() {
        if (this.recorder) {
          this.recorder = null;
          clearInterval(this.interval);
          this.startTime = null;
          if (this.stream) {
            this.stream.getAudioTracks().forEach(track => track.stop());
            this.stream = null;
          }
        }
      }   

      private stopMediaVideo() {
        if (this.recorder) {
          this.recorder = null;
          clearInterval(this.interval);
          this.startTime = null;
          if (this.stream) {
            this.stream.getAudioTracks().forEach(track => track.stop());
            this.stream.getVideoTracks().forEach(track => track.stop());
            this.stream = null;
          }
        }
      }   

  }