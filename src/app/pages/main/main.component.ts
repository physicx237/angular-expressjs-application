import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PRIME_NG_MODULES } from '../../app.config';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PRIME_NG_MODULES],
})
export class MainComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  navigateToLoginPage() {
    this.router.navigate(['login'], { relativeTo: this.activatedRoute });
  }
}
