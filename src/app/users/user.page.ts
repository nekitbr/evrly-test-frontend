import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from './user.service';
import { UserData } from './user.model';
import { UserHeaderComponent } from './components/header/user-header.component';
import { UserTableComponent } from './components/table/user-table.component';
import { UserPaginationComponent } from './components/pagination/user-pagination.component';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, UserHeaderComponent, UserTableComponent, UserPaginationComponent],
  templateUrl: './user.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPage implements OnInit {
  private readonly userService = inject(UserService);

  readonly currentPageUsers = signal<UserData[]>([]);
  readonly currentPage = signal(1);
  readonly fetchingNextPages = signal(false);
  readonly itemsPerPage = signal(10);
  readonly isLoading = signal(false);
  readonly isExecuting = signal(false);
  readonly isClearing = signal(false);
  readonly error = signal<string | null>(null);

  readonly pageCache = signal(new Map<number, UserData[]>());
  readonly cacheVersion = signal(0);

  readonly availablePages = computed(() => {
    this.cacheVersion();
    return Array.from(this.pageCache().keys()).sort((a, b) => a - b);
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);
    this.currentPage.set(1);
    this.pageCache.set(new Map());
    this.loadPageWithLookAhead(1);
  }

  updateItemsPerPage(amount: number) {
    this.itemsPerPage.set(amount);
    this.loadUsers();
  }

  private loadPageWithLookAhead(pageNumber: number) {
    if (this.pageCache().has(pageNumber)) {
      this.updateViewState(pageNumber);
      if (!this.pageCache().has(pageNumber + 1)) {
        this.fetchNextPagesLookAhead(pageNumber + 1);
      }
      return;
    }

    this.isLoading.set(true);
    const start = (pageNumber - 1) * this.itemsPerPage() + 1;
    const limit = this.itemsPerPage() * 3;

    this.userService.getUsersPaginated(start, limit).subscribe({
      next: (response) => {
        const size = this.itemsPerPage();
        this.updateCache([
          { nr: pageNumber, data: response.data.slice(0, size) },
          { nr: pageNumber + 1, data: response.data.slice(size, size * 2) },
          { nr: pageNumber + 2, data: response.data.slice(size * 2, size * 3) }
        ]);
        this.updateViewState(pageNumber);
        this.isLoading.set(false);
      },
      error: () => this.handleError('Error loading users.')
    });
  }

  private fetchNextPagesLookAhead(pageNumber: number) {
    const start = (pageNumber - 1) * this.itemsPerPage() + 1;
    const limit = this.itemsPerPage() * 2;

    this.fetchingNextPages.set(true);
    this.userService.getUsersPaginated(start, limit).subscribe((res) => {
      const size = this.itemsPerPage();
      this.updateCache([
        { nr: pageNumber, data: res.data.slice(0, size) },
        { nr: pageNumber + 1, data: res.data.slice(size, size * 2) }
      ]);
      this.fetchingNextPages.set(false);
    });
  }

  onExecute() {
    this.isExecuting.set(true);
    this.error.set(null);
    this.userService.syncUsers().subscribe({
      next: () => {
        this.isExecuting.set(false);
        this.loadUsers();
      },
      error: () => {
        this.handleError('Error executing user sync.');
        this.isExecuting.set(false);
      }
    });
  }

  onClear() {
    this.isClearing.set(true);
    this.userService.truncateUsers().subscribe({
      next: () => {
        this.pageCache.set(new Map());
        this.currentPageUsers.set([]);
        this.isClearing.set(false);
        this.cacheVersion.update(v => v + 1);
      },
      error: () => {
        this.handleError('Error clearing database.');
        this.isClearing.set(false);
      }
    });
  }

  goToPage(page: number) {
    this.loadPageWithLookAhead(page);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  private updateCache(pages: {nr: number, data: UserData[]}[]) {
    this.pageCache.update(map => {
      pages.forEach(p => {
        if (p.data.length > 0) map.set(p.nr, p.data);
      });
      return new Map(map);
    });
    this.cacheVersion.update(v => v + 1);
  }

  private updateViewState(pageNumber: number) {
    this.currentPage.set(pageNumber);
    this.currentPageUsers.set(this.pageCache().get(pageNumber) || []);
  }

  private handleError(msg: string) {
    this.error.set(msg);
    this.isLoading.set(false);
  }
}
