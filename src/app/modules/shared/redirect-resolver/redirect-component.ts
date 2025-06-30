import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  template: ''
})
export class RedirectComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const redirectPath = this.route.snapshot.data['redirectPath'];
    this.router.navigate([redirectPath], { replaceUrl: true, relativeTo: this.route.parent });
  }
}