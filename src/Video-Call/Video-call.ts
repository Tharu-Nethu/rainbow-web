import { WEBRTC_P2P_SVC } from "rainbow-web-sdk";



export class VideoCallHandler {
  private rainbowSDK: any;
  private call: any;

    constructor(rainbowSDK: any) {
    this.rainbowSDK = rainbowSDK;
  }

  async startVideoCall(user: any) {
    try {
      const call = await this.rainbowSDK.webRTC[WEBRTC_P2P_SVC].makeCall(user, 'video');
      this.call = call;

      // Show video UI
      document.getElementById('video-call-ui')!.style.display = 'block';
      this.attachMediaStreams();
    } catch (error) {
      console.error("Video call failed:", error);
    }
  }

  async shareScreen() {
    try {
      if (!this.call) return;
      await (this.rainbowSDK as any).webrtcP2PService.addSharingToCall(this.call);
    } catch (err) {
      console.error("Screen sharing failed:", err);
    }
  }

  endCall() {
    if (this.call) {
      (this.rainbowSDK as any).webrtcP2PService.terminateCall(this.call, 'hangup', true);
      document.getElementById('video-call-ui')!.style.display = 'none';
      this.call = null;
    }
  }

  muteCall(mute: boolean) {
    if (this.call) {
      (this.rainbowSDK as any).webrtcP2PService.muteCall(this.call, mute);
    }
  }

  private attachMediaStreams() {
    const localVideo = document.getElementById('local-video') as HTMLVideoElement;
    const remoteVideo = document.getElementById('remote-video') as HTMLVideoElement;

    const session = this.call?.webRtcSession;
    if (session) {
      const localStream = session.getLocalStream();
      const remoteStream = session.getRemoteStream();

      if (localStream) {
        localVideo.srcObject = localStream;
      }

      if (remoteStream) {
        remoteVideo.srcObject = remoteStream;
      }
    }
  }

  bindControls() {
    document.getElementById('btn-end-call')?.addEventListener('click', () => this.endCall());
    document.getElementById('btn-share-screen')?.addEventListener('click', () => this.shareScreen());
    document.getElementById('btn-mute')?.addEventListener('click', () => this.muteCall(true));
  }
}