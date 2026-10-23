import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  // Obtenemos la sesión actual de Supabase
  const { data: { session } } = await supabaseService.client.auth.getSession();

  if (session) {
    return true; // El usuario está logueado, puede pasar
  } else {
    // No hay sesión activa, redirigimos al login
    router.navigate(['/login']);
    return false;
  }
};
