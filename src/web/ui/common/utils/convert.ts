/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

// tslint:disable: unknown-instead-of-any
// tslint:disable: no-invalid-this
import {coerceBooleanProperty} from '@angular/cdk/coercion'

function toBoolean(value: boolean | string): boolean {
    return coerceBooleanProperty(value)
}

function propDecoratorFactory<T, D>(
    fallback: (v: T) => D,
): (target: any, propName: string) => void {
    function propDecorator(
        target: any,
        propName: string,
        originalDescriptor?: TypedPropertyDescriptor<any>,
    ): any {
        const privatePropName = `$$__${propName}`

        if (Object.prototype.hasOwnProperty.call(target, privatePropName))
            return

        Object.defineProperty(target, privatePropName, {
            configurable: true,
            writable: true,
        })

        return {
            get(): string {
                return originalDescriptor && originalDescriptor.get ?
            originalDescriptor.get.bind(this)() : this[privatePropName]
            },

            set(value: T): void {
                if (originalDescriptor && originalDescriptor.set)
                    originalDescriptor.set.bind(this)(fallback(value))
                this[privatePropName] = fallback(value)
            },
        }
    }

    return propDecorator
}

/**
 * Input decorator that handle a prop to do get/set automatically with toBoolean
 *
 * Why not using @InputBoolean alone without @Input? AOT needs @Input to be visible
 *
 * @howToUse
 * ```
 * @Input() @InputBoolean() visible: boolean = false;
 *
 * // Act as below:
 * // @Input()
 * // get visible() { return this.__visible; }
 * // set visible(value) { this.__visible = value; }
 * // __visible = false;
 * ```
 */
// tslint:disable-next-line: naming-convention ext-variable-name
export function InputBoolean(): any {
    return propDecoratorFactory(toBoolean)
}
