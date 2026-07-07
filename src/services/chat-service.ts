import { BaseService } from './base.service'

export class ChatService extends BaseService {
  list() { return this.unsupported('chat.list') }
}
