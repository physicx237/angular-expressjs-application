import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { takeWhile, tap } from 'rxjs';
import { AuthorizationService } from '../../services/authorization/authorization.service';
import { PRIME_NG_MODULES } from '../../app.config';

interface UserFormValue {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PRIME_NG_MODULES, ReactiveFormsModule],
  providers: [MessageService],
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly messageService = inject(MessageService);
  private readonly authorizationService = inject(AuthorizationService);

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  navigateToMainPage() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  login() {
    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Username and password cannot be empty!',
        life: 5000,
      });

      return;
    }

    const { username, password } = this.loginForm.value as UserFormValue;

    this.authorizationService
      .login(username, password)
      .pipe(
        takeWhile((response) => response.status === 200),
        tap({
          complete: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Invalid username or password!',
              life: 5000,
            });
          },
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.router.navigate(['../', 'user'], { relativeTo: this.activatedRoute });
      });
  }
}
