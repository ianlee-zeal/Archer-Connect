import { Injectable } from '@angular/core';
import { PermissionTypeEnum, PermissionActionTypeEnum } from '@app/models/enums';
import { PermissionService } from '@app/services';

@Injectable({ providedIn: 'root' })
export class PermissionConsolePrinterService {

    constructor(
        private readonly service: PermissionService
    ) { }

    public printPermissionsCheckToConsole(permissions: string | string[], hasAccess: boolean): void {
        try {
            if (permissions !== undefined) {
                if (!Array.isArray(permissions)) {
                    //single permission
                    this.printSinglePermissionsLine(permissions, false, hasAccess);
                }
                else {
                    if (permissions.length == 1) {
                        //it was sent in as an array but only has a single permission in it.
                        let permission = permissions[0];
                        this.printSinglePermissionsLine(permission, false, hasAccess);
                    }
                    else {
                        //array with multiple permissions in it
                        let arrayHeaderStyle = PermissionConsolePrinterService.getConsoleStyle(hasAccess);
                        console.log(`%cMultiple permissions check result = ${hasAccess}`, arrayHeaderStyle)
                        permissions.forEach(permission => {
                            let hasSingleAccess = this.service.has(permissions)
                            this.printSinglePermissionsLine(permission, true, hasSingleAccess);
                        })
                    }
                }
            }
        }
        catch (err) {
            //this was never seen in testing but is here as a safety net.
            console.log(`error while printing permissions, permissions=${permissions} ,err=${err}`)
        }
    }

    private printSinglePermissionsLine(numberHyphenatedPermission: string, isPartOfAnArray: boolean, hasAccess: boolean) {
        let indent = isPartOfAnArray ? '\t' : '';
        const perArray = numberHyphenatedPermission.split('-');
        const entity: string = PermissionTypeEnum[perArray[0]];
        const action: string = PermissionActionTypeEnum[perArray[1]];

        const style = PermissionConsolePrinterService.getConsoleStyle(hasAccess);
        console.log(indent + `%c${entity}.${action} = ${hasAccess}`, style);
    }

    private static getConsoleStyle(hasPermission: boolean): string {
        return hasPermission ? 'color: green;' : 'color: red;';
    }
}
