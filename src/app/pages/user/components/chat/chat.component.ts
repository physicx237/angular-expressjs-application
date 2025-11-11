import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { PRIME_NG_MODULES } from '../../../../app.config';
import {
  channelSelector,
  messagesSelector,
  userSelector,
} from '../../../../store/selectors/user.selectors';
import { sendMessage } from '../../../../store/actions/user-page.actions';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PRIME_NG_MODULES, CommonModule],
})
export class ChatComponent {
  private readonly store = inject(Store);

  user$ = this.store.select(userSelector);
  channel$ = this.store.select(channelSelector);
  messages$ = this.store.select(messagesSelector);

  sendMessage(message: string) {
    this.store.dispatch(sendMessage({ message }));
  }
}
