import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChannelsComponent } from './components/channels/channels.component';
import { UsersComponent } from './components/users/users.component';
import { ChatComponent } from './components/chat/chat.component';
import { InfoComponent } from './components/info/info.component';
import { getUser } from '../../store/actions/user-page.actions';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChannelsComponent, InfoComponent, UsersComponent, ChatComponent],
})
export class UserComponent implements OnInit {
  private readonly store = inject(Store);

  ngOnInit() {
    this.store.dispatch(getUser());
  }
}
