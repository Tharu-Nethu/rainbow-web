import { Call, CALL_SVC, MAIN_SVC, EVENT_SVC, CallEvents, CallsPlugin, ConnectedUser, ConnectionServiceEvents, ConnectionState, Conversation, ConversationServiceEvents, DirectorySearchResults, DirectoryType, LogLevelEnum, RainbowSDK, RBEvent, User, CallLogServiceEvents } from 'rainbow-web-sdk';


// Personnal configuration for the SDK APP; If you need help, please read the starting guides on how to obtain the key / secret
// and update the appConfig in the config file.
import { appConfig } from './config/config';
import { ChatHandler } from './Chat/Chat';
import { VideoCallHandler } from './Video-Call/Video-call';
import { MediaType } from "rainbow-web-sdk";
import { CallServiceRB } from 'rainbow-web-sdk/lib/services/call/call.service';



let chatHandler: ChatHandler;

async function onUserSelected(user: any) {
  if (!chatHandler) {
    chatHandler = new ChatHandler((window as any).testApplication.rainbowSDK);
  }
  await chatHandler.openConversationWithUser(user);
}
document.getElementById('send-chat-btn')!.addEventListener('click', () => {
  chatHandler.sendMessage();
  
});
let videoHandler: VideoCallHandler;

async function onUserSelectedCall(user: any) {
  if (!videoHandler) {
    videoHandler = new VideoCallHandler((window as any).testApplication.rainbowSDK);
  }
  await videoHandler.startVideoCall(user);
}
document.getElementById('send-chat-btn')!.addEventListener('click', () => {
  chatHandler.sendMessage();
  
});




// import { appConfig } from './config/myConfig';

class TestApplication {
    protected rainbowSDK: RainbowSDK;

    private connectedUser: ConnectedUser;

    //will help to manage the list of calls
    private calls: Record<string, any> = {};

    //to beo unsubscribed on log-out to avoid memory leak
    private conversationCallSubscription;

    constructor() {
    }

    public async init() {
        if (appConfig?.applicationId === "applicationId" || appConfig?.secretKey === "secretKey") {
            window.alert("No application ID or secret key are set for this application ! Refer to the README file");
            return;
        }

        this.rainbowSDK = RainbowSDK.create({
            appConfig: {
                server: appConfig.server,
                applicationId: appConfig.applicationId,
                secretKey: appConfig.secretKey
            },
            plugins: [CallsPlugin], 
            autoLogin: true,
            logLevel: LogLevelEnum.WARNING
        });

        this.rainbowSDK.connectionService.subscribe((event: RBEvent) =>
            this.connectionStateChangeHandler(event), ConnectionServiceEvents.RAINBOW_ON_CONNECTION_STATE_CHANGE);


        // Show the loading spinner
        document.getElementById('loading-spinner').style.display = 'block';

        this.connectedUser = await this.rainbowSDK.start();

        //hide loading spinner
        document.getElementById('loading-spinner').style.display = 'none';

        this.managePage();
    }

    private managePage() {
        if (!this.connectedUser) {
            document.getElementById('loginContainer').style.display = 'block';
            document.getElementById('mainPage').style.display = 'none';
            //show your login page here
            this.manageLoginForm();
        }
        else {
            this.showMainPage();
        }
    }

    private connectionStateChangeHandler(event: RBEvent): void {
        const connectionState: ConnectionState = event.data;
        console.info(`[testAppli] onConnectionStateChange ${connectionState.state}`);
    }

    private manageLoginForm() {
        const form = document.getElementById('loginForm') as HTMLFormElement;
        const usernameInput = document.getElementById('username') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const errorMessage = document.getElementById('error-message') as HTMLParagraphElement;

        // Handle form submission
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (!username || !password) {
                // Show error if any field is empty
                errorMessage.textContent = 'Both fields are required!';
            } else {
                // Show the loading spinner
                document.getElementById('loginContainer').style.display = 'none';
                document.getElementById('loading-spinner').style.display = 'block';
                try { this.connectedUser = await this.rainbowSDK.connectionService.logon(username, password, true); }
                catch (error: any) {
                    document.getElementById('loginContainer').style.display = 'block';
                    console.error(`[testAppli] ${error.message}`);
                    alert(`Login error for ${username}`);
                    return;
                }
                // Clear error message and simulate login
                errorMessage.textContent = '';

                //hide loading spinner
                document.getElementById('loading-spinner').style.display = 'none';

                this.showMainPage();
            }
        });
    }
public async getPredefinedUsers(): Promise<{ [key: string]: User }> {
  const directoryService = this.rainbowSDK.directorySearchService;

  const displayNames = {
    frontDesk: "Tharunethu Wanniarachchi",
    receptionist: "Tharunethu Wanniarachchi",
    cleaningStaff: "Tharunethu Wanniarachchi"
  };

  const users: { [key: string]: User } = {};

  for (const [key, name] of Object.entries(displayNames)) {
    const result: DirectorySearchResults = await directoryService.searchByName(name, DirectoryType.RAINBOW_USERS, { limit: 5 });

    // Use a simple name match (or improve this based on real data)
    const matchedUser = result.users.find(u => u.displayName.toLowerCase() === name.toLowerCase());

    if (matchedUser) {
      users[key] = matchedUser;
    } else {
      console.warn(`${key} not found for name ${name}`);
    }
  }

  return users;
}



    private showMainPage() {

        
    document.getElementById('profileToggle').addEventListener('click', () => {
        const container = document.getElementById('profileContainer');
        container.style.display = container.style.display === 'none' ? 'block' : 'none';
    });

        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainPage').style.display = 'flex';
        const usernameElement = document.getElementById('username');
        const companyElement = document.getElementById('company');
        const avatarElement: any = document.getElementById('avatar');

        const logoutButton = document.getElementById('logout-btn');
        logoutButton.addEventListener('click', async () => {
            await this.rainbowSDK.connectionService.logout();
            /** should be managed by the events received here but I take a shortcut
             * this.rainbowSDK.connectionService.subscribe((event: RBEvent) =>
                this.connectionStateChangeHandler(event), ConnectionServiceEvents.RAINBOW_ON_CONNECTION_STATE_CHANGE);
             * 
            */

            this.connectedUser = undefined;
            this.managePage();
        });

        usernameElement.textContent = this.connectedUser.displayName;
        companyElement.textContent = "Test Org";
        avatarElement.src = this.connectedUser.avatar?.src;

        this.manageCalls();

                        (async () => {
            const users = await this.getPredefinedUsers();

            if (users.frontDesk) addStaffButton("Front Desk", users.frontDesk);
            if (users.receptionist) addStaffButton("Receptionist", users.receptionist);
            if (users.cleaningStaff) addStaffButton("Cleaning Staff", users.cleaningStaff);
            })();

        function addStaffButton(name: string, user: User) {
        const container = document.getElementById("staff-cards-container");

        const card = document.createElement("div");
        card.className = "staff-card";
        card.innerHTML = `
            <p><strong>${name}</strong></p>
            <div class="btn-group">
            <button class="chat-btn">💬</button>
            <button class="audio-btn">📞</button>
            <button class="video-btn">📹</button>
            </div>
        `;

        card.querySelector(".chat-btn").addEventListener("click", async () => { await onUserSelected(user);});
        card.querySelector(".audio-btn").addEventListener("click", () => testApplication.makeCall(user));
        card.querySelector(".video-btn").addEventListener("click", () => testApplication.makeVideoCall(user));

        container.appendChild(card);
        }


       

        const searchQueryInput: any = document.getElementById('search-query');
        const searchButton = document.getElementById('search-btn');
        const searchResultsContainer = document.getElementById('search-results');

        // Handle search functionality
        searchButton.addEventListener('click', async () => {
            const searchQuery = searchQueryInput.value.trim();
            searchResultsContainer.innerHTML = '';

            if (!searchQuery) {
                alert('Please enter a search query.');
                return;
            }

            const result: DirectorySearchResults = await this.rainbowSDK.directorySearchService.searchByName(searchQuery, DirectoryType.RAINBOW_USERS, { limit: 5 });

            // The directorySearch engine returns a DirectorySearchResults objevt.
            // It contains an array of User instance which match the criteria 
            // Note that this array can be empty if no matching entity is found.
            // In our case we have already created a "Bob" user in a previous stage, 
            // so, this array should not be empty...
            const users: User[] = result.users;


            users.forEach(result => {
                const resultCard = document.createElement('div');
                resultCard.classList.add('result-card');

                resultCard.innerHTML = `
                    <img src="${result.avatar?.src}" alt="Avatar" />
                    <h4>${result.displayName}</h4>
                    <p>Test Company</p>  <!-- or remove entirely -->
                    <button class="chat-btn">💬</button>
                    <button class="call-btn">📞</button>
                    <button class="video-call-btn">📹</button>
                    
                  

                `;

                searchResultsContainer.appendChild(resultCard);

                const callButton = resultCard.querySelector('.call-btn');
                if (callButton) {
                    callButton.addEventListener('click', () => this.makeCall(result));
                }
                const videoButton = resultCard.querySelector('.video-btn');
                if (videoButton) {
                    videoButton.addEventListener('click', () => this.makeVideoCall(result));
                }
                const chatButton = resultCard.querySelector('.chat-btn');
                    if (chatButton) {
                    chatButton.addEventListener('click', async () => {
                        await onUserSelected(result);
                    });
                }



            const btn = document.createElement('button');
                btn.innerText = `Chat with ${result.displayName}`;
                btn.onclick = () => onUserSelected(result);
                searchResultsContainer.appendChild(btn);

            

            });

            
        });

        const callQueryInput: any = document.getElementById('call-query');
        const callButton = document.getElementById('call-number-btn');

        // Handle call number functionality

        //just a demo on how to make PBX calls, as the management is quite the same as any VoIP call;
        //the real implementation will need to take care of much more things, like if the user can make PBX calls (configuration)
        //if the capability to make a call is true etc etc; But the basic case is like this and it will work if the user is correctly configured.
        callButton.addEventListener('click', async () => {
            const numberToCall = callQueryInput.value.trim();
            if (numberToCall) {
                this.rainbowSDK.callService.makePhoneCall(numberToCall);
            }
        });
    }

    /**
     * NOTE: You should test the capability if we can actually call the user.
     * 
     */
    public async makeCall(user: User) {
        const searchResultsContainer = document.getElementById('search-results');
        searchResultsContainer.innerHTML = '';

        //make call to user
        try {
            await this.rainbowSDK.callService.makeWebCall(user);
        }
        catch (error) {
            //manage error
        }
    }


    public async makeVideoCall(user: User) {
    try {
        const callService = this.rainbowSDK.callService;
        if (!callService) {
        throw new Error("callService is undefined. Make sure it's initialized in SDK plugins.");
        }

        await callService.makeWebCall(user, [MediaType.VIDEO, MediaType.AUDIO]);
        console.log("Video call started.");
    } catch (error) {
        console.error("Video call failed:", error);
    }
    }



    /**
     * Here we manage ALL calls. It's pretty simple : If there's a new call (incoming or outgoing), we'll have an event;
     * If the call is removed (ended/rejected/whatever reason): there's event;
     */
    private manageCalls() {
        this.conversationCallSubscription = this.rainbowSDK.conversationService?.subscribe((event: RBEvent<ConversationServiceEvents>) => {
            try {
                const conversation: Conversation = event.data.conversation;

                switch (event.name) {
                    case ConversationServiceEvents.ON_NEW_CALL_IN_CONVERSATION:
                        this.onCallConversationCreated(conversation);
                        break;

                        

                    case ConversationServiceEvents.ON_REMOVE_CALL_IN_CONVERSATION:
                        this.onCallConversationRemoved(conversation);
                        break;

                    default:
                        break;
                }
            }
            catch (error) {
                //do something 
            }
        }, [ConversationServiceEvents.ON_NEW_CALL_IN_CONVERSATION,
        ConversationServiceEvents.ON_REMOVE_CALL_IN_CONVERSATION]);
    }


    private currentConversation: Conversation;

    

public async openChatWith(user: User) {
  try {
    const existingConversations = this.rainbowSDK[MAIN_SVC].getAllConversations();
    let conversation = existingConversations.find(c => c.contact?.id === user.id);

    if (!conversation) {
      conversation = await this.rainbowSDK[MAIN_SVC].openConversation(user);
    }

    this.currentConversation = conversation;

    const chatSection = document.getElementById("chat-section");
    chatSection.style.display = "block";
    document.getElementById("chat-username").textContent = user.displayName;

    const messagesDiv = document.getElementById("chat-messages");
    messagesDiv.innerHTML = "";
    conversation.messages.forEach(msg => {
      const p = document.createElement("p");
      p.textContent = `${msg.side === "right" ? "You" : user.displayName}: ${msg.body}`;
      messagesDiv.appendChild(p);
    });

    const sendBtn = document.getElementById("send-chat-btn");
    const input = document.getElementById("chat-input") as HTMLInputElement;

    sendBtn.onclick = async () => {
      if (!input.value.trim()) return;
      await this.rainbowSDK[MAIN_SVC].sendMessageToConversation(conversation, input.value);
      const p = document.createElement("p");
      p.textContent = `You: ${input.value}`;
      messagesDiv.appendChild(p);
      input.value = "";
    };

    // File upload
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    const sendFileBtn = document.getElementById("send-file-btn");
    sendFileBtn.onclick = async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      await this.rainbowSDK[MAIN_SVC].sendFileToConversation(conversation, file);
      const p = document.createElement("p");
      p.textContent = `You sent a file: ${file.name}`;
      messagesDiv.appendChild(p);
    };

    // Message listener (only added once)
    this.rainbowSDK[EVENT_SVC].on("rainbow_onmessagereceived", (msg) => {
      if (msg.conversationId === conversation.id) {
        const p = document.createElement("p");
        p.textContent = `${user.displayName}: ${msg.body}`;
        messagesDiv.appendChild(p);
      }
    });
  } catch (error) {
    console.error("Chat open failed:", error);
  }
}


    /**
     * 
     * We build the call cell for the new call. The available buttons should be taken from the CALL capabilities to be sure what actions
     * are allowed for the call, like taking it, releasing, mute, hold, etc etc
     */
    private onCallConversationCreated(conversation: Conversation) {
        //we've new conversation call, build the card and list to updates on the call so that we can update the buttons / status accordingly
        const callCardsContainer: any = document.getElementById('call-cards-container');

        const cardElement = document.createElement('div');
        //give ID to the card
        cardElement.id = conversation.id;
        cardElement.classList.add('call-card');

        cardElement.innerHTML = `
            <img src="${conversation.call?.contact?.avatar?.src}" alt="Avatar" />
            <h4>${conversation.call?.contact?.displayName}</h4>
            <p class="call-status">${conversation.call?.callStatus}</p>
            <button class="call-btn hidden">Answer</button>
            <button class="call-end-btn hidden">End</button>
            <button class="mute-btn hidden">Mute</button>
            <button class="unmute-btn hidden">Unmute</button>
            <button class="hold-btn hidden">Hold</button>
            <button class="unhold-btn hidden">Retrieve</button>
            <button class="video-btn">On Video</button>
        `;

        callCardsContainer.appendChild(cardElement);

        const answerButton = cardElement.querySelector('.call-btn');
        if (answerButton) {
            answerButton.addEventListener('click', () => this.answerCall(conversation.call));
        }

        const callButton = cardElement.querySelector('.call-end-btn');
        if (callButton) {
            callButton.addEventListener('click', () => this.releaseCall(conversation.call));
        };
        
      


        

        //add mute/unmute actions, but only show the buttons if the call capability is TRUE for this action
        const muteButton = cardElement.querySelector('.mute-btn');
        if (muteButton) {
            muteButton.addEventListener('click', () => this.muteCall(conversation.call));
        }

        const unmuteButton = cardElement.querySelector('.unmute-btn');
        if (unmuteButton) {
            unmuteButton.addEventListener('click', () => this.unmuteCall(conversation.call));
        }

        const holdButton = cardElement.querySelector('.hold-btn');
        if (holdButton) {
            holdButton.addEventListener('click', () => this.holdCall(conversation.call));
        }

        const retrieveButton = cardElement.querySelector('.unhold-btn');
        if (retrieveButton) {
            retrieveButton.addEventListener('click', () => this.retrieveCall(conversation.call));
        }

         const videoButton = cardElement.querySelector('.video-btn');
        if (videoButton) {
            retrieveButton.addEventListener('click', () => this.videoCall(conversation.call));
        }

        //update the call buttons based on the capabilities
        this.manageCallButtons(conversation);

        //add listeners for this call so that I can remove it after the call is ended
        //there're 100 ways to do this, so you can do it as you want, just remember to unsubscribe at the end of the call
        //as this might lead to memory leak.
        this.calls[conversation.id] = {}

        this.calls[conversation.id].subcription = conversation.call.subscribe((event: RBEvent<CallEvents>) => {
            switch (event.name) {
                case CallEvents.ON_CALL_STATUS_CHANGE:
                case CallEvents.ON_CALL_CAPABILITIES_UPDATED:
                case CallEvents.ON_CALL_MEDIA_UPDATED:
                case CallEvents.ON_CALL_MUTE_CHANGE:
                    //to make it simple, I'll manage the call status and the call buttons at the same place; For more "fine" management, each event 
                    //contains information that will allow to update any part of the UI / actions separately, if needed.
                    this.manageCallButtons(conversation);
                    break;
                default: break;
            }
        });
    }

    async onCallStarted(conversation: Conversation) {
  const call = conversation.call as any;
  const sdk: any = this.rainbowSDK;
  const webrtcSvc = sdk.services?.WebrtcP2PService as any;
  if (!webrtcSvc) {
    console.error("WebrtcP2PService not found");
    return;
  }

  const localEl = document.getElementById("local-video") as HTMLVideoElement;
  const remoteEl = document.getElementById("remote-video") as HTMLVideoElement;
  const container = document.getElementById("video-container");

  container.style.display = "block";

  // Attach streams
  try {
    webrtcSvc.attachLocalVideoOnlyStreamToElement(call, true, localEl);
    webrtcSvc.attachDistantMediaStreamsUnifiedPlan(call);
  } catch (e) {
    console.error("Attach streams failed", e);
  }

  // Toggle camera
  document.getElementById("toggle-camera").onclick = () =>
    webrtcSvc.addVideoToCall(call, true);

  // Share screen
  document.getElementById("start-share").onclick = () =>
    webrtcSvc.addSharingToCall(call, true);

  // Stop sharing
  document.getElementById("stop-share").onclick = async () =>
    await webrtcSvc.removeMediaFromCall(call, 'sharing');

  // Clean up on end
  conversation.call.subscribe((event: any) => {
    if (event.name === 'ON_CALL_STATUS_CHANGE' && call.callStatus === 'ENDED') {
      container.style.display = "none";
      localEl.srcObject = null;
      remoteEl.srcObject = null;
    }
  });
}


    private manageCallButtons(conversation: Conversation) {
        //for each capability, set the visbility of the button to TRUE or FALSE
        //get the call card by it's id
        //it,s a workaround to use an unique ID;
        const call = conversation.call;
        if (!call) {
            //call is ended and removed
            return;
        }

        const cardElement = document.getElementById(conversation["id"]);

        //update the call status
        const callStatus = cardElement.querySelector('.call-status');
        callStatus.innerHTML = call.callStatus;

        const answerButton = cardElement.querySelector('.call-btn');
        if (answerButton) {
            //if capability answer is true, show button, otherwise hide it
            answerButton.classList.toggle("hidden", !call.capabilities.answer);
        }

        const callButton = cardElement.querySelector('.call-end-btn');
        if (callButton) {
            callButton.classList.toggle("hidden", !call.capabilities.release);
        }

        //add mute/unmute actions, but only show the buttons if the call capability is TRUE for this action
        const muteButton = cardElement.querySelector('.mute-btn');
        if (muteButton) {
            muteButton.classList.toggle("hidden", !call.capabilities.mute);
        }

        const unmuteButton = cardElement.querySelector('.unmute-btn');
        if (unmuteButton) {
            unmuteButton.classList.toggle("hidden", !call.capabilities.unmute);
        }

        //hold / retrieve

        const holdButton = cardElement.querySelector('.hold-btn');
        if (holdButton) {
            holdButton.classList.toggle("hidden", !call.capabilities.hold);
        }

        const retrieveButton = cardElement.querySelector('.unhold-btn');
        if (retrieveButton) {
            retrieveButton.classList.toggle("hidden", !call.capabilities.retrieve);
        }

    }

    private muteCall(call: Call) {
        call.mute();
    }
    private holdCall(call: Call) {
        call.hold();
    }
    private retrieveCall(call: Call) {
        call.retrieve();
    }
    private videoCall (call: Call){
        try {
            call.addVideo();
        } catch (error) {
            
        }
    }
    private muteVideo (call: Call){
        call.removeVideo();
    }
    private unmuteCall(call: Call) {
        call.unmute();
    }

    private async releaseCall(call: Call) {
        //relase call
        try {
            await call.release();
        }
        catch (error) {
            //manage error
        }
    }

    private async answerCall(call: Call) {
        //answer call
        try {
            await call.answer();
        }
        catch (error) {
            //manage error
        }
    }

    //remove the call as it's ended
    private onCallConversationRemoved(conversation) {
        //remove conversation call from the UI, as call is ended
        const cardElement = document.getElementById(conversation.id);

        //remove the card
        cardElement?.remove();
        //remove subscriptions
        this.calls[conversation.id]?.subcription?.unsubscribe();
        delete this.calls[conversation.id];

    }

    
}

const testApplication = new TestApplication();
(window as any).testApplication = testApplication;
testApplication.init();