import {
  Component, OnInit, Input,
} from '@angular/core';
import { DetailType } from 'src/app/models/detailType.enum';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent implements OnInit {
  @Input() currentPageUrl: Observable<string[]>;
  @Input() currentUrl: string;

  public topMenus;
  public sideMenus;
  public current_path;
  public lastThreeElements = [];

  constructor(
  ) { }

  ngOnInit() {
    //
    // TODO replace on new NavService
    // BUG https://jira.s3betaplatform.com/browse/AC-1590
    //
    // this.menu_service.get_menus('', topMenu)
    //   .then(result => {
    //     // eslint-disable-next-line prefer-destructuring
    //     this.topMenus = result[0];
    //   });

    // this.menu_service.get_menus('', sideMenu)
    //   .then(result => {
    //     // eslint-disable-next-line prefer-destructuring
    //     this.sideMenus = result;
    //     this.currentPageUrl.subscribe(pageUrl => {
    //       this.current_path = pageUrl;
    //       this.checkCurrentPathContainsId();
    //     });

    //     this.current_path = this.currentUrl;
    //     this.checkCurrentPathContainsId();
    //   });
  }


  findValuesInTopMenu() {
    this.topMenus.items.forEach(item => {
      if (item.route === this.current_path) {
        this.lastThreeElements = [];
        this.lastThreeElements.push(item);
      }
    });
  }

  findValuesInSideMenu(url) {
    if (this.sideMenus) {
      this.sideMenus.forEach(item => {
        if (item.items) {
          item.items.forEach(subItem => {
            if (subItem.route === url) {
              this.lastThreeElements = [];
              this.lastThreeElements.push(item);
              this.lastThreeElements.push(subItem);
            }
          });
        }
      });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  getPath(url) {
    // eslint-disable-next-line no-restricted-globals
    const parts = url.split('/').slice(1).map(p => ((isNaN(p)) ? p : ':id'));
    const path = `/${parts.join('/')}`;
    return path;
  }

  getDetailsType(element) {
    switch (element) {
      case 'documents':
        this.lastThreeElements.push({ name: DetailType.documents, route: ' ' });
        break;
      case 'users':
        this.lastThreeElements.push({ name: DetailType.users, route: ' ' });
        break;
      case 'access-policy':
        this.lastThreeElements.push({ name: DetailType.accessPolicy, route: ' ' });
        break;
      case 'projects':
        this.lastThreeElements.push({ name: DetailType.projects, route: ' ' });
        break;
      case 'clients':
        this.lastThreeElements.push({ name: DetailType.clients, route: ' ' });
        break;
      default:
        this.lastThreeElements.push({ name: DetailType.default, route: ' ' });
        break;
    }
  }

  checkCurrentPathContainsId() {
    const parts = this.current_path.split('/').slice(1);
    if (parts[parts.length - 1] === ':id') {
      const partsArrayWithoutId = parts.slice(0, parts.length - 1);
      const partWithoutId = `/${partsArrayWithoutId.join('/')}`;

      this.findValuesInTopMenu();
      this.findValuesInSideMenu(partWithoutId);
      this.getDetailsType(partsArrayWithoutId[partsArrayWithoutId.length - 1]);
    } else {
      this.findValuesInTopMenu();
      this.findValuesInSideMenu(this.current_path);
    }
  }
}
