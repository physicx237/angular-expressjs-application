import { inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router } from '@angular/router';

export const authorizationGuard: CanActivateFn = () => {
  const router = inject(Router);

  const mainPageUrl = router.parseUrl('/');

  const isAuthorized = !!sessionStorage.getItem('access_token');

  return isAuthorized || new RedirectCommand(mainPageUrl);
};
