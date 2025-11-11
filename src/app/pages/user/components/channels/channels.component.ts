import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { PRIME_NG_MODULES } from '../../../../app.config';
import {
  channelSelector,
  channelsSelector,
  userSelector,
} from '../../../../store/selectors/user.selectors';
import {
  addUserChannel,
  getChannelMembers,
  getMessages,
  setChannel,
} from '../../../../store/actions/user-page.actions';
import { ChannelModel } from '../../../../models/channel.model';

interface ChannelFormValue {
  channelName: string;
}

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PRIME_NG_MODULES, CommonModule, ReactiveFormsModule],
})
export class ChannelsComponent {
  private readonly store = inject(Store);

  user$ = this.store.select(userSelector);
  channel$ = this.store.select(channelSelector);
  channels$ = this.store.select(channelsSelector);

  isShowAddChannelModal: boolean = false;

  channelForm = new FormGroup({
    channelName: new FormControl('', Validators.required),
  });

  getChannelMembersAndMessages(channel: ChannelModel) {
    this.store.dispatch(setChannel({ channel }));
    this.store.dispatch(getChannelMembers({ channelId: channel.id }));
    this.store.dispatch(getMessages({ channelId: channel.id }));
  }

  showAddChannelModal() {
    this.isShowAddChannelModal = true;
  }

  hideAddChannelModal() {
    this.isShowAddChannelModal = false;
  }

  addChannel() {
    if (this.channelForm.invalid) {
      return;
    }

    const { channelName } = this.channelForm.value as ChannelFormValue;

    this.store.dispatch(addUserChannel({ channelName }));

    this.channelForm.reset();

    this.hideAddChannelModal();
  }
}
