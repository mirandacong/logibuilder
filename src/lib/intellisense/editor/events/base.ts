import {Builder} from '@logi/base/ts/common/builder'
import {Impl} from '@logi/base/ts/common/mapped_types'
import {Node, SliceExpr} from '@logi/src/lib/hierarchy/core'

/**
 * The base event from the frontend.
 */
export interface Event {
    readonly eventType: EventType
}

export const enum EventType {
    /**
     * Mouse click the textbox or the panel.
     */
    MOUSE,
    /**
     * Keydown event without using input method.
     */
    KEYBOARD,
    /**
     * Using input method editor (IME) like Chinese and is composing.
     *
     * For example, typing `wo de shi jie` and selecting `我的世界` are the
     * composition events.
     */
    COMPOSITION,
    /**
     * Using input method editor but not composing.
     *
     * For example, `，` or `。` are using Chinese IME but is not composing.
     */
    INPUT,
    /**
     * Blur or focus on the editor.
     */
    FOCUS,
    /**
     * When a book is loaded, use this event to init the editor text display.
     */
    INITIAL,
}

export interface EditorLocation {
    readonly node: Readonly<Node>
    readonly sliceExpr?: Readonly<SliceExpr>
    readonly loc: Location
}

class EditorLocationImpl implements Impl<EditorLocation> {
    public node!: Readonly<Node>
    public sliceExpr?: Readonly<SliceExpr>
    /**
     * The left or right value in a editor.
     *
     * (TODO yiliang): rename the `Location`.
     */
    public loc = Location.RIGHT
}

export class EditorLocationBuilder extends
    Builder<EditorLocation, EditorLocationImpl> {
    public constructor(obj?: Readonly<EditorLocation>) {
        const impl = new EditorLocationImpl()
        if (obj)
            EditorLocationBuilder.shallowCopy(impl, obj)
        super(impl)
    }

    public node(node: Readonly<Node>): this {
        this.getImpl().node = node
        return this
    }

    // tslint:disable-next-line: no-optional-parameter
    public sliceExpr(sliceExpr: Readonly<SliceExpr> | undefined): this {
        this.getImpl().sliceExpr = sliceExpr
        return this
    }

    public loc(loc: Location): this {
        this.getImpl().loc = loc
        return this
    }

    protected get daa(): readonly string[] {
        return EditorLocationBuilder.__DAA_PROPS__
    }
    protected static readonly __DAA_PROPS__: readonly string[] = ['node']
}

export function isEditorLocation(obj: object): obj is EditorLocation {
    return obj instanceof EditorLocationImpl
}

/**
 * There are 2 parts in an editor like `A = B`, A is the LEFT,
 * and B is the RIGHT.
 */
export const enum Location {
    LEFT = 0,
    RIGHT = 1,
}
