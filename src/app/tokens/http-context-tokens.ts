import { HttpContextToken } from '@angular/common/http';

export const BYPASS_SPINNER = new HttpContextToken(() => false);
