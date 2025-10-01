import { Component } from '@angular/core';
import { NbChatMessageFile } from '../../../framework/theme/components/chat/chat-message-file.component';

export const supportedFilesForUpload = [
  'image/*',
  'video/*',
  'application/pdf',
  'application/msword', // Word documents (.doc)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.oasis.opendocument.text',
  'text/plain',
];

@Component({
  selector: 'npg-chat-drop-with-button',
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
  templateUrl: './chat-drop-with-button.component.html',
  standalone: false,
})
export class ChatDropWithButtonComponent {
  mimeMap = new Map<string, { icon: string; pack: string }>([
    ['application/*', { icon: 'file-outline', pack: 'eva' }],
    ['image/!*', { icon: 'image-outline', pack: 'eva' }],
  ]);
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
    {
      text: 'Or you can choose a group of files via the button.',
      date: new Date(),
      reply: true,
      user: {
        name: 'Bot',
        avatar: 'https://i.gifer.com/no.gif',
      },
    },
  ];

  get supportedFilesForUpload() {
    return supportedFilesForUpload;
  }

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

  filesChange(files: { id: string; file: File; src: string | undefined }[]) {
    console.log('filesChange', files);
  }

  trackById(index: number, item: { id: string; file: File; src: string | undefined }) {
    return item.id;
  }
}
