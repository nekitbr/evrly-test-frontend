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
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.css'],
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPage implements OnInit {
  private readonly userService = inject(UserService);

  readonly itemsPerPageOptions = [1, 10, 25, 50];
  readonly currentPageUsers = signal<UserData[]>([]);
  readonly currentPage = signal(1);
  readonly itemsPerPage = signal(10);
  readonly isLoading = signal(false);
  readonly isExecuting = signal(false);
  readonly isClearing = signal(false);
  readonly totalElements = signal(0);
  readonly error = signal<string | null>(null);
  readonly cacheVersion = signal(0); // reactivity trigger for canGoNext - runs when cache changes

  readonly pageCache = signal(new Map<number, UserData[]>());

  readonly availablePages = computed(() => {
    this.cacheVersion(); // do not remove - re-computes when cacheVersion changes!
    const pages: number[] = [];
    for (const page of this.pageCache().keys()) {
      pages.push(page);
    }
    return pages.sort((a, b) => a - b);
  });

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.isLoading.set(true);
    this.error.set(null);
    this.currentPage.set(1);
    this.pageCache.set(new Map());
    this.loadPageWithLookAhead(1);
  }

  /**
   * Fetches current page + 2 next pages (3 pages in total with 1 request)
   */
  private loadPageWithLookAhead(pageNumber: number) {
    if (this.pageCache().has(pageNumber)) {
      this.currentPage.set(pageNumber);
      this.currentPageUsers.set(this.pageCache().get(pageNumber)!);
      this.isLoading.set(false);

      // check if we need to fetch the next pages as look-ahead
      if (!this.pageCache().has(pageNumber + 1)) {
        this.fetchNextPagesLookAhead(pageNumber + 1);
      }
      return;
    }

    // page not in cache, need to fetch
    this.isLoading.set(true);
    const start = (pageNumber - 1) * this.itemsPerPage() + 1;
    const limit = this.itemsPerPage() * 3; // fetch current page + 2 next pages (30 items)

    this.userService.getUsersPaginated(start, limit).subscribe({
      next: (response) => {
        this.totalElements.set(response.totalElements);

        const itemsPerPage = this.itemsPerPage();
        const page1 = response.data.slice(0, itemsPerPage);
        const page2 = response.data.slice(itemsPerPage, itemsPerPage * 2);
        const page3 = response.data.slice(itemsPerPage * 2, itemsPerPage * 3);

        this.pageCache.update(map => {
          if (page1.length > 0) {
            map.set(pageNumber, page1);
          }
          if (page2.length > 0) {
            map.set(pageNumber + 1, page2);
          }
          if (page3.length > 0) {
            map.set(pageNumber + 2, page3);
          }
          return map
        })

        this.currentPage.set(pageNumber);
        this.currentPageUsers.set(page1);
        this.isLoading.set(false);
        this.cacheVersion.update(v => v + 1); // trigger reactivity
      },
      error: (err) => {
        this.error.set('Error loading users.');
        this.isLoading.set(false);
      },
    });
  }

  private fetchNextPagesLookAhead(pageNumber: number) {
    if (this.pageCache().has(pageNumber)) {
      return;
    }

    const start = (pageNumber - 1) * this.itemsPerPage() + 1;
    const limit = this.itemsPerPage() * 2;

    this.userService.getUsersPaginated(start, limit).subscribe((response) => {
        this.totalElements.set(response.totalElements);

        const itemsPerPage = this.itemsPerPage();
        const page1 = response.data.slice(0, itemsPerPage);
        const page2 = response.data.slice(itemsPerPage, itemsPerPage * 2);

        this.pageCache.update(map => {
          if (page1.length > 0) {
            map.set(pageNumber, page1);
          }
          if (page2.length > 0) {
            map.set(pageNumber + 1, page2);
          }
          return map;
        })

        this.cacheVersion.update(v => v + 1); // trigger reactivity
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
      error: (err) => {
        this.error.set('Error executing user sync.');
        this.isExecuting.set(false);
      },
    });
  }

  onClear() {
    this.isClearing.set(true);
    this.error.set(null);

    this.userService.truncateUsers().subscribe({
      next: () => {
        this.currentPageUsers.set([]);
        this.currentPage.set(1);
        this.totalElements.set(0);
        this.pageCache.set(new Map());
        this.isClearing.set(false);
      },
      error: (err) => {
        this.error.set('Error clearing users.');
        this.isClearing.set(false);
      },
    });
  }

  nextPage() {
    const nextPageNum = this.currentPage() + 1;

    if (this.pageCache().has(nextPageNum)) {
      this.currentPage.set(nextPageNum);
      this.currentPageUsers.set(this.pageCache().get(nextPageNum)!);

      if (!this.pageCache().has(nextPageNum + 1)) {
        this.fetchNextPagesLookAhead(nextPageNum + 1);
      }
    }
  }

  prevPage() {
    const prevPageNum = this.currentPage() - 1;

    if (prevPageNum >= 1 && this.pageCache().has(prevPageNum)) {
      this.currentPage.set(prevPageNum);
      this.currentPageUsers.set(this.pageCache().get(prevPageNum)!);
    }
  }

  goToPage(pageNumber: number) {
    if (this.pageCache().has(pageNumber)) {
      this.currentPage.set(pageNumber);
      this.currentPageUsers.set(this.pageCache().get(pageNumber)!);

      // Check if we need to fetch look-ahead pages
      if (!this.pageCache().has(pageNumber + 1)) {
        this.fetchNextPagesLookAhead(pageNumber + 1);
      }
    }
  }

}

