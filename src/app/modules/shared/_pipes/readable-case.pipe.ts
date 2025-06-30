import { Pipe, PipeTransform } from '@angular/core';

//
// Convert CamelCase to Readable Case
// Eaxmple: "SomeItemName" -> "Some Item Name"
//

@Pipe({ name: 'readableCasePipe' })
export class ReadableCasePipe implements PipeTransform {
    transform(value): Object {
        return value.replace(/([A-Z])/g, match => ` ${match}`)
            .replace(/^./, match => match.toUpperCase())
            .trim()
    }
}