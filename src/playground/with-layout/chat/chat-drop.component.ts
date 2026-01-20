import { Component } from '@angular/core';
import { NbChatMessageFile } from '../../../framework/theme/components/chat/chat-message-file.component';

@Component({
  selector: 'nb-chat-drop',
  styles: [
    `
      ::ng-deep nb-layout-column {
        justify-content: center;
        display: flex;
      }
      nb-chat {
        width: 500px;
        height: 80vw;
      }
    `,
  ],
  templateUrl: './chat-drop.component.html',
  standalone: false,
})
export class ChatDropComponent {
  messages: any[] = [
    {
      text: 'Drag & drop a file or a group of files.',
      date: new Date(),
      reply: true,
      user: {
        name: 'Bot',
        avatar: 'https://i.gifer.com/no.gif',
      },
    },
  ];

  sendMessage(event: { message: string; files: { id: string; file: File; src: string | undefined }[] }) {
    const files: NbChatMessageFile[] = !event.files
      ? []
      : event.files.map((f) => {
          return {
            src: f.src,
            type: f.file.type,
            icon: 'file-text-outline',
          };
        });

    this.messages.push({
      text: event.message,
      date: new Date(),
      files: files,
      type: files.length ? 'file' : 'text',
      reply: true,
      user: {
        name: 'Jonh Doe',
        avatar: 'https://i.gifer.com/no.gif',
      },
    });
  }
}
