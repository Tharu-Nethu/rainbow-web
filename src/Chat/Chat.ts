export class ChatHandler {
  private conversationService: any;
  private activeConversation: any;

  constructor(rainbowSDK: any) {
    this.conversationService = rainbowSDK.conversationService;
  }

  async loadMessages() {
  try {
    if (!this.activeConversation) return;

    const messages = this.activeConversation.Messages || [];
    const msgBox = document.getElementById('chat-messages')!;
    msgBox.innerHTML = ''; // clear previous

    messages.forEach((msg: any) => {
      const sender = msg.fromJid === this.activeConversation.contact.jid_im ? this.activeConversation.contact.displayName : 'You';
      const div = document.createElement('div');
      div.innerHTML = `<strong>${sender}:</strong> ${msg.content}`;
      msgBox.appendChild(div);
    });

    msgBox.scrollTop = msgBox.scrollHeight;
  } catch (err) {
    console.error("Failed to load messages:", err);
  }
}


 async openConversationWithUser(user: any) {
  try {
    const conv = await this.conversationService.getConversation(user, 'contact');
    this.activeConversation = conv;
    document.getElementById('chat-section')!.style.display = 'block';
    document.getElementById('chat-username')!.textContent = user.displayName;

    await this.loadMessages(); 
  } catch (error) {
    console.error('Failed to open chat:', error);
  }
}

  sendMessage() {
    const input = document.getElementById('chat-input') as HTMLInputElement;
    const message = input.value.trim();
    if (!message || !this.activeConversation) return;
    this.conversationService.sendMessage(this.activeConversation, message);
    this.appendMessageToUI('You', message);
    input.value = '';
  }

  appendMessageToUI(sender: string, text: string) {
    const msgBox = document.getElementById('chat-messages')!;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
    msgBox.appendChild(msgDiv);
    msgBox.scrollTop = msgBox.scrollHeight;
  }

}
