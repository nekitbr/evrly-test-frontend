import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
})
export class UserHeaderComponent {
  disabled = input(false);
  isSyncing = input(false);
  isClearing = input(false);
  hasData = input(false);
  sync = output();
  clear = output();
}
