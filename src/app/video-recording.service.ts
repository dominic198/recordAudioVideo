import { Injectable, NgZone } from '@angular/core';
import * as RecordRTC from 'recordrtc';
import * as moment from 'moment';
import { Observable, Subject } from 'rxjs';
import { isNullOrUndefined } from 'util';
import { DomSanitizer } from '@angular/platform-browser';

interface RecordedVideoOutput {
  blob: Blob;
  title: string;
}
@Injectable()
export class VideoRecordingService {
    private stream;
    private _stream = new Subject<MediaStreamTrack>();
    private recorder;
    private interval;
    private startTime;
    private _recorded = new Subject<RecordedVideoOutput>();
    private _recordingTime = new Subject<string>();
    private _recordingFailed = new Subject<string>();
    private sanitizer: DomSanitizer
  
    getStream():any {
       return this._stream;
    }

    getRecordedBlob(): Observable<RecordedVideoOutput> {
      return this._recorded.asObservable();
    }
  
    getRecordedTime(): Observable<string> {
      return this._recordingTime.asObservable();
    }
  
    recordingFailed(): Observable<string> {
      return this._recordingFailed.asObservable();
    }  
  
    startRecording(video:HTMLVideoElement) {
      console.log('hrer')
      if (this.recorder) {
        // It means recording is already started or it is already recording something       
        return;
      }
  
      this._recordingTime.next('00:00');
      navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(s => {
        this.stream = s; 
        video.srcObject = s;        
        this.record();       
      }).catch(error => {
        this._recordingFailed.next();
      });
      setTimeout(()=>{ video.srcObject = null; this.stopRecording(video)}, 30000);
    }
  
    abortRecording() {
      this.stopMedia();
    }
  
    private record() {  
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
  
    stopRecording(video:HTMLVideoElement) {
     console.log('stopping!')
      if (this.recorder) {
        this.recorder.stop((blob) => {
          if (this.startTime) {
            const webmName = encodeURIComponent('video_' + new Date().getTime() + '.webm');
            this.stopMedia();
            this._recorded.next({ blob: blob, title: webmName });
          }
        }, () => {
          this.stopMedia();
          this._recordingFailed.next();
        });
      }       
    }
  
    private stopMedia() {
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