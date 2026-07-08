import { BaseService } from './base.service'
/** ChatService — present-but-dummy (mirrors litekart-connector); returns dummy data, never throws. */
export class ChatService extends BaseService {
  private static instance: ChatService
  static getInstance(): ChatService { if (!ChatService.instance) ChatService.instance = new ChatService(); return ChatService.instance }
  async list(..._args: any[]): Promise<any> { return this.emptyPage() }
}
export const chatService = ChatService.getInstance()
