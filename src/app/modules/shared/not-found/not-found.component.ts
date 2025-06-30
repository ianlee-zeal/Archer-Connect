import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { SideNavMenuService } from '@app/services';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private sideNavMenuService: SideNavMenuService) {
  }

  ngOnInit(): void {
    this.sideNavMenuService.hide();

    setTimeout(() => {
      history.length > 5 // 5 - auth redirections + Wrong page + Not Found page
        ? history.go(-2) // 2 - Wrong page + Not Found page
        : this.router.navigate(['claimants']);
    }, 3000);
  }

  ngOnDestroy(): void {
    this.sideNavMenuService.show();
  }
}
