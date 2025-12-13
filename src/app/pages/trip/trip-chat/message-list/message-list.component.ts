import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IMessage } from '../../../../interfaces/IMessage';
import { ISurvey } from '../../../../interfaces/ISurvey';
import { MessageItemComponent } from '../message-item/message-item.component';
import { SurveyComponent } from '../../../../shared/components/survey/survey.component';

type CombinedItem = {
  type: 'message' | 'survey';
  data: IMessage | ISurvey;
};

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, MessageItemComponent, SurveyComponent],
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.css']
})
export class MessageListComponent {
  @Input() messages: IMessage[] = [];
  @Input() surveys: ISurvey[] = [];
  @Input() loading: boolean = false;
  @Input() loadingSurveys: boolean = false;
  @Input() currentUserId: number | null = null;
  @Input() isOrganizer: boolean = false;

  @Output() replyToMessage = new EventEmitter<IMessage>();
  @Output() deleteMessage = new EventEmitter<number>();
  @Output() surveyUpdated = new EventEmitter<ISurvey>();
  @Output() surveyError = new EventEmitter<string>();

  get combinedItems(): CombinedItem[] {
    const messageItems = this.messages.map(msg => ({
      type: 'message' as const,
      data: msg,
      createdAt: new Date(msg.created_at)
    }));

    const surveyItems = this.surveys.map(survey => ({
      type: 'survey' as const,
      data: survey,
      createdAt: new Date(survey.created_at)
    }));

    return [...messageItems, ...surveyItems]
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(item => ({ type: item.type, data: item.data }));
  }

  onReply(message: IMessage): void {
    this.replyToMessage.emit(message);
  }

  onDelete(messageId: number): void {
    this.deleteMessage.emit(messageId);
  }

  onSurveyUpdated(survey: ISurvey): void {
    this.surveyUpdated.emit(survey);
  }

  onSurveyError(error: string): void {
    this.surveyError.emit(error);
  }

  asMessage(data: any): IMessage {
    return data as IMessage;
  }

  asSurvey(data: any): ISurvey {
    return data as ISurvey;
  }

  getSortedReplies(replies: IMessage[]): IMessage[] {
    return [...replies].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }
}
