import { Component, input } from '@angular/core';
import { UserData } from '../../user.model';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html'
})
export class UserTableComponent {
  users = input.required<UserData[]>();

  formatPhone(phone: any): string {
    if (!phone) return '';
    const p = phone.toString().replace(/\D/g, '');
    return p.length === 10
      ? `(${p.slice(0, 3)}) ${p.slice(3, 6)} ${p.slice(6)}`
      : p;
  }

}
