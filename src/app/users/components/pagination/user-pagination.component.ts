import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-pagination',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-pagination.component.html'
})
export class UserPaginationComponent {
  currentPage = input.required<number>();
  availablePages = input.required<number[]>();
  fetchingNextPages = input(false);
  itemsPerPage = input.required<number>();
  options = input<number[]>([10, 25, 50]);
  hasNext = input(false);

  itemsPerPageChange = output<number>();
  goTo = output<number>();
  prev = output();
  next = output();
}
