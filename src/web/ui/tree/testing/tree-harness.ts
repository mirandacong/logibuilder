/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
    ComponentHarness,
    HarnessPredicate,
    parallel,
} from '@angular/cdk/testing'

import {TreeNodeHarness} from './node-harness'
import {
    TreeHarnessFilters,
    TreeNodeHarnessFilters,
} from './tree-harness-filters'

export interface TextTree {
    readonly text?: string
    // tslint:disable-next-line: readonly-array readonly-keyword
    children?: TextTree[]
}

export class TreeHarness extends ComponentHarness {
    // tslint:disable-next-line: ext-variable-name
    public static hostSelector = '.logi-tree-host'

  /**
   * Gets a `HarnessPredicate` that can be used to search for a tree with
   * specific attributes.
   * @param options Options for narrowing the search
   * @return a `HarnessPredicate` configured with the given options.
   */
    public static with(
        options: TreeHarnessFilters = {},
    ): HarnessPredicate<TreeHarness> {
        return new HarnessPredicate(TreeHarness, options)
    }

    public async getNodes(
        filter: TreeNodeHarnessFilters = {},
    ): Promise<readonly TreeNodeHarness[]> {
        return this.locatorForAll(TreeNodeHarness.with(filter))()
    }

  /**
   * Gets an object representation for the visible tree structure
   * If a node is under an unexpanded node it will not be included.
   * Eg.
   * Tree (all nodes expanded):
   * `
   * <mat-tree>
   *   <mat-tree-node>Node 1<mat-tree-node>
   *   <mat-nested-tree-node>
   *     Node 2
   *     <mat-nested-tree-node>
   *       Node 2.1
   *       <mat-tree-node>
   *         Node 2.1.1
   *       <mat-tree-node>
   *     <mat-nested-tree-node>
   *     <mat-tree-node>
   *       Node 2.2
   *     <mat-tree-node>
   *   <mat-nested-tree-node>
   * </mat-tree>`
   *
   * Tree structure:
   * {
   *  children: [
   *    {
   *      text: 'Node 1',
   *      children: [
   *        {
   *          text: 'Node 2',
   *          children: [
   *            {
   *              text: 'Node 2.1',
   *              children: [{text: 'Node 2.1.1'}]
   *            },
   *            {text: 'Node 2.2'}
   *          ]
   *        }
   *      ]
   *    }
   *  ]
   * };
   */
    public async getTreeStructure(): Promise<TextTree> {
        const nodes = await this.getNodes()
        const nodeInformation = await parallel(() => nodes.map(node =>
            parallel(
                () => [node.getLevel(), node.getText(), node.isExpanded()],
            )))
        return this._getTreeStructure(nodeInformation, 1, true)
    }

    private _getTreeStructure(
        // tslint:disable-next-line: readonly-array
        nodes: ([number, string, boolean])[],
        level: number,
        parentExpanded: boolean,
    ): TextTree {
        const result: TextTree = {}
        for (let i = 0; i < nodes.length; i++) {
            const [nodeLevel, text, expanded] = nodes[i]
            const nextNodeLevel = nodes[i + 1]?.[0] ?? -1

            if (nodeLevel < level)
                return result
            if (nodeLevel > level)
                continue
            if (parentExpanded)
                if (nextNodeLevel === level)
                    addChildToNode(result, {text})
                else if (nextNodeLevel > level) {
                    const children = this._getTreeStructure(
                        nodes.slice(i + 1),
                        nextNodeLevel,
                        expanded,
                    )?.children
                    const child = children ? {text, children} : {text}
                    addChildToNode(result, child)
                } else {
                    addChildToNode(result, {text})
                    return result
                }
        }
        return result
    }
}

function addChildToNode(result: TextTree, child: TextTree): void {
    result.children ? result.children.push(child) : result.children = [child]
}
