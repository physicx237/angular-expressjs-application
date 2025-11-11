import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { combineLatest, map } from 'rxjs';
import { PRIME_NG_MODULES } from '../../../../app.config';
import { channelMembersSelector, usersSelector } from '../../../../store/selectors/user.selectors';
import { addChannelMember, getUsers } from '../../../../store/actions/user-page.actions';

interface UserFormValue {
  userId: string;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PRIME_NG_MODULES, CommonModule, ReactiveFormsModule],
})
export class UsersComponent {
  private readonly store = inject(Store);

  channelMembers$ = this.store.select(channelMembersSelector);

  users$ = combineLatest([
    this.store.select(usersSelector),
    this.channelMembers$.pipe(
      map((channelMembers) => channelMembers.map((channelMember) => channelMember.id)),
    ),
  ]).pipe(
    map(([users, channelMembersIds]) => users.filter(({ id }) => !channelMembersIds.includes(id))),
  );

  isShowAddChannelMemberModal: boolean = false;

  userForm = new FormGroup({
    userId: new FormControl('', Validators.required),
  });

  showAddChannelMemberModal() {
    this.isShowAddChannelMemberModal = true;

    this.store.dispatch(getUsers());
  }

  hideAddChannelMemberModal() {
    this.isShowAddChannelMemberModal = false;
  }

  addChannelMember() {
    if (this.userForm.invalid) {
      return;
    }

    const { userId } = this.userForm.value as UserFormValue;

    this.store.dispatch(addChannelMember({ userId }));

    this.userForm.reset();

    this.hideAddChannelMemberModal();
  }
}
