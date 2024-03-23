import { Routes } from '@angular/router';
import { OwnerComponent } from './owner/owner.component'
import { TenantComponent } from './tenant/tenant.component'

export const routes: Routes = [
    { path: 'owner', component: OwnerComponent },
    { path: 'tenant', component: TenantComponent }
];
