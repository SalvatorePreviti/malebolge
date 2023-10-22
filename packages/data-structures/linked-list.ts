import type { UnsafeAny } from "@malebolge/core";
import { BREAK, fnIdentity } from "@malebolge/core";

export interface SinglyLinkedListNode {
  /** The next node in the linked list */
  next: this | null;
}

export interface SinglyLinkedListNodeWithValue<T> extends SinglyLinkedListNode {
  /** The value of the node */
  value: T;
}

export interface ReadonlySinglyLinkedListNode {
  /** The next node in the linked list */
  readonly next: this | null | undefined;
}

export interface ReadonlySinglyLinkedListNodeWithValue<T> extends ReadonlySinglyLinkedListNode {
  /** The value of the node */
  readonly value: T;
}

export interface LinkedListNode extends SinglyLinkedListNode {
  /** The previous node in the linked list */
  prev: this | null;

  /** The next node in the linked list */
  next: this | null;
}

export interface LinkedListNodeWithValue<T> extends LinkedListNode {
  /** The value of the node */
  value: T;
}

export interface ReadonlyLinkedListNode extends ReadonlySinglyLinkedListNode {
  /** The previous node in the linked list */
  readonly prev: this | null | undefined;

  /** The next node in the linked list */
  readonly next: this | null | undefined;
}

export interface ReadonlyLinkedListNodeWithValue<T> extends ReadonlyLinkedListNode {
  /** The value of the node */
  readonly value: T;
}

export interface SinglyLinkedListStructure<TNode extends ReadonlySinglyLinkedListNode = ReadonlySinglyLinkedListNode> {
  /** The first node in the linked list */
  head: TNode | null;
}

export interface ReadonlySinglyLinkedListStructure<
  TNode extends ReadonlySinglyLinkedListNode = ReadonlySinglyLinkedListNode,
> {
  /** The first node in the linked list */
  readonly head: TNode | null | undefined;
}

export interface LinkedListStructure<TNode extends ReadonlyLinkedListNode = ReadonlyLinkedListNode> {
  /** The first node in the linked list */
  head: TNode | null;

  /** The last node in the linked list */
  tail: TNode | null;
}

export interface ReadonlyLinkedListStructure<TNode extends ReadonlyLinkedListNode = ReadonlyLinkedListNode> {
  /** The first node in the linked list */
  readonly head: TNode | null | undefined;

  /** The last node in the linked list */
  readonly tail: TNode | null | undefined;
}

/**
 * Returns true if the linked list is empty, false otherwise.
 * Complexity is O(1).
 *
 * @param list The linked list.
 * @returns True if the linked list is empty, false otherwise.
 */
export const linkedList_isEmpty = (list: { readonly head: unknown } | null | undefined): boolean => !list?.head;

/**
 * Count the number of nodes in the linked list.
 * Complexity is O(n).
 *
 * @param list The linked list.
 * @returns The number of nodes in the linked list.
 */
export const linkedList_size = <TNode extends ReadonlySinglyLinkedListNode = ReadonlySinglyLinkedListNode>(
  list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
): number => {
  let count = 0;
  for (let node = list?.head; node; node = node.next) {
    ++count;
  }
  return count;
};

/**
 * Counts the number of nodes in the linked list that satisfies the given predicate.
 * Complexity is O(n).
 *
 * @param list The linked list
 * @param predicate The predicate to execute to all nodes.
 * @returns The number of nodes in the linked list that satisfies the given predicate.
 */
export const linkedList_countWhere = <TNode extends ReadonlySinglyLinkedListNode = ReadonlySinglyLinkedListNode>(
  list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
  predicate: (node: TNode) => boolean,
): number => {
  let count = 0;
  for (let node = list?.head; node; node = node.next) {
    if (predicate(node)) {
      ++count;
    }
  }
  return count;
};

/**
 * Returns the node at the given index in the linked list, or null if not found.
 * Complexity is O(n).
 *
 * @param list The linked list.
 * @param predicate The predicate to find the node.
 * @returns The node, or null if not found.
 */
export const linkedList_findNode = <TNode extends ReadonlySinglyLinkedListNode = ReadonlySinglyLinkedListNode>(
  list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
  predicate: (node: TNode) => boolean,
): TNode | null => {
  let node = list?.head;
  while (node) {
    const next = node.next;
    if (predicate(node)) {
      return node;
    }
    node = next;
  }
  return null;
};

/**
 * Execute the given callback for each node in the linked list.
 * If the callback returns the symbol BREAK, the iteration will stop.
 *
 * @param list The linked list.
 * @param callback The callback to execute to all nodes.
 */
export const linkedList_forEachNode = <TNode extends ReadonlySinglyLinkedListNode = ReadonlySinglyLinkedListNode>(
  list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
  callback: ((node: TNode, index: number) => void | BREAK | unknown) | null | undefined,
): void => {
  if (callback) {
    let node = list?.head;
    let index = 0;
    while (node) {
      const next = node.next;
      if (callback(node, index++) === BREAK) {
        break;
      }
      node = next;
    }
  }
};

/**
 * Returns true if the given predicate evaluates to true for at least one node in the linked list.
 *
 * @param list The linked list.
 * @param predicate The predicate to find the node.
 * @returns True if the given predicate evaluates to true for at least one node in the linked list.
 */
export const linkedList_someNode = <TNode extends ReadonlySinglyLinkedListNode = ReadonlySinglyLinkedListNode>(
  list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
  predicate: (node: TNode) => boolean,
): boolean => !!linkedList_findNode(list, predicate);

/**
 * Returns true if the given predicate evaluates to true for all nodes in the linked list.
 *
 * Complexity is O(n).
 *
 * @param list The linked list
 * @param predicate The predicate to exetute to all nodes.
 * @returns True if the given predicate evaluates to true for all nodes in the linked list.
 */
export const linkedList_everyNode = <TNode extends ReadonlySinglyLinkedListNode = ReadonlySinglyLinkedListNode>(
  list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
  predicate: (node: TNode) => boolean,
): boolean => {
  let node = list?.head;
  while (node) {
    const next = node.next;
    if (!predicate(node)) {
      return false;
    }
    node = next;
  }
  return true;
};

/**
 * Maps each node in the linked list to a new value and returns an array of the mapped values.
 * If the callback is null or undefined, the function returns an array of the nodes.
 * Complexity is O(n).
 *
 * @param list The linked list.
 * @param callback The callback to map the nodes.
 * @returns An array.
 */
export const linkedList_mapNodes: {
  <TNode extends ReadonlySinglyLinkedListNode, TResult = TNode>(
    list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
    callback: (node: TNode) => TResult,
  ): TResult[];

  <TNode extends ReadonlySinglyLinkedListNode>(
    list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
  ): TNode[];
} = <TNode extends ReadonlySinglyLinkedListNode>(
  list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
  callback: UnsafeAny = fnIdentity,
) => {
  const result = [];
  if (callback) {
    let node = list?.head;
    while (node) {
      const next = node.next;
      result.push(callback(node));
      node = next;
    }
  }
  return result;
};

/**
 * Check if the linked list contains the given node or the given node.
 * Complexity is O(n).
 *
 * @param list The linked list.
 * @param value The node to find.
 * @returns True if the linked list contains the node, false otherwise.
 */
export const linkedList_includesNode = (
  list: ReadonlySinglyLinkedListStructure | null | undefined,
  node: ReadonlySinglyLinkedListNode,
): boolean => {
  for (let n = list?.head; n; n = n.next) {
    if (n === node) {
      return true;
    }
  }
  return false;
};

/**
 * Check if the linked list contains the given node in the given range.
 * Complexity is O(n) and limited by the range maximum value
 *
 * @param list The linked list.
 * @param value The node to find.
 * @returns True if the linked list contains the node, false otherwise.
 */
export const linkedList_includesNodeInRange = (
  list: ReadonlySinglyLinkedListStructure | null | undefined,
  node: ReadonlySinglyLinkedListNode,
  fromIndex: number = 0,
  toIndex: number = Number.MAX_SAFE_INTEGER,
): boolean => {
  let index = 0;
  for (let n = list?.head; n; n = n.next) {
    if (index >= fromIndex && index <= toIndex && n === node) {
      return true;
    }
    ++index;
  }
  return false;
};

/**
 * Check if the linked list contains the given value.
 * Complexity is O(n).
 *
 * @param list The linked list.
 * @param value The value to find.
 * @returns True if the linked list contains the value, false otherwise.
 */
export const linkedList_includesValue = <T>(
  list: ReadonlySinglyLinkedListStructure<ReadonlySinglyLinkedListNodeWithValue<T>> | null | undefined,
  value: T,
): boolean => {
  for (let node = list?.head; node; node = node.next) {
    if (node.value === value) {
      return true;
    }
  }
  return false;
};

/**
 * Returns the index of the given node in the linked list, or -1 if not found.
 * Complexity is O(n).
 *
 * @param list The linked list.
 * @param node The node to find.
 * @returns
 */
export const linkedList_indexOfNode = (
  list: ReadonlySinglyLinkedListStructure | null | undefined,
  node: ReadonlySinglyLinkedListNode | null | undefined,
): number => {
  if (node) {
    for (let index = 0, n = list?.head; n; n = n.next) {
      if (n === node) {
        return index;
      }
      ++index;
    }
  }
  return -1;
};

/**
 * Returns the index of the first node in the linked list that satisfies the given predicate, or -1 if not found.
 * @param list The linked list.
 * @param predicate The predicate to find the node.
 * @returns The index of the first node in the linked list that satisfies the given predicate, or -1 if not found.
 */
export const linkedList_findNodeIndex = <TNode extends ReadonlySinglyLinkedListNode = ReadonlySinglyLinkedListNode>(
  list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
  predicate: (node: TNode) => boolean,
): number => {
  let index = 0;
  for (let node = list?.head; node; node = node.next) {
    if (predicate(node)) {
      return index;
    }
    ++index;
  }
  return -1;
};

export const linkedList_indexOfValue = <T>(
  list: ReadonlySinglyLinkedListStructure<ReadonlySinglyLinkedListNodeWithValue<T>> | null | undefined,
  value: T,
): number => {
  let index = 0;
  let node = list?.head;
  while (node) {
    const next = node.next;
    if (node.value === value) {
      return index;
    }
    ++index;
    node = next;
  }
  return -1;
};

/**
 * Returns an iterable of nodes in the linked list.
 * @param list The linked list.
 * @returns An iterable of nodes in the linked list.
 *
 * @example
 *
 * ```ts
 * for (const node of linkedList_nodes(list)) console.log(node.value);
 * ```
 *
 */
export function* linkedList_nodes<TNode extends ReadonlySinglyLinkedListNode>(
  list: ReadonlySinglyLinkedListStructure<TNode> | null | undefined,
): IterableIterator<TNode> {
  let node = list?.head;
  while (node) {
    const next = node.next;
    yield node;
    node = next;
  }
}

/**
 * Returns an iterable of nodes in the linked list in reverse order.
 *
 * @param list The linked list.
 */
export function* linkedList_nodesReverse<TNode extends ReadonlyLinkedListNode>(
  list: ReadonlyLinkedListStructure<TNode> | null | undefined,
): IterableIterator<TNode> {
  let node = list?.tail;
  while (node) {
    const prev = node.prev;
    yield node;
    node = prev;
  }
}

/**
 * Returns an iterable of values in the linked list.
 *
 * @param list The linked list.
 * @returns An iterable of values in the linked list.
 *
 * @example
 *
 * ```ts
 * for (const value of linkedList_values(list)) console.log(value);
 * ```
 *
 */
export function* linkedList_values<T>(
  list: ReadonlySinglyLinkedListStructure<ReadonlySinglyLinkedListNodeWithValue<T>> | null | undefined,
): IterableIterator<T> {
  let node = list?.head;
  while (node) {
    const next = node.next;
    yield node.value;
    node = next;
  }
}

/**
 * Returns an iterable of values in the linked list in reverse order.
 *
 * @param list The linked list.
 * @returns An iterable of values in the linked list in reverse order.
 *
 * @example
 *
 * ```ts
 * for (const value of linkedList_valuesReverse(list)) console.log(value);
 * ```
 *
 */
export function* linkedList_valuesReverse<T>(
  list: ReadonlyLinkedListStructure<ReadonlyLinkedListNodeWithValue<T>> | null | undefined,
): IterableIterator<T> {
  let node = list?.tail;
  while (node) {
    const prev = node.prev;
    yield node.value;
    node = prev;
  }
}

/** Add the given node to the end of the linked list. Complexity is O(1). */
export const linkedList_pushNode = <TNode extends Partial<LinkedListNode>>(
  list: LinkedListStructure<TNode & LinkedListNode>,
  node: TNode,
): void => {
  node.prev = list.tail ?? null;
  node.next = null;
  if (list.tail) {
    list.tail.next = node as UnsafeAny;
  } else {
    list.head = node as UnsafeAny;
  }
  list.tail = node as UnsafeAny;
};

/**
 * Add the given nodes to the end of the linked list.
 * @param list The linked list to modify.
 * @param nodes The nodes to add.
 */
export const linkedList_pushNodes = <TNode extends LinkedListNode>(
  list: LinkedListStructure<TNode>,
  ...nodes: readonly (TNode | null | undefined)[]
): void => {
  for (const node of nodes) {
    if (node) {
      linkedList_pushNode(list, node);
    }
  }
};

/** Remove the last node from the linked list and returns it. Complexity is O(1). */
export const linkedList_popNode = <TNode extends LinkedListNode>(
  list: LinkedListStructure<TNode> | null | undefined,
): TNode | null => {
  if (!list) {
    return null;
  }
  const node = list.tail || null;
  if (node) {
    const prev = node.prev;
    list.tail = prev;
    if (prev) {
      prev.next = null;
    } else {
      list.head = null;
    }
    node.prev = null;
  }
  return node;
};

/** Add the given node to the beginning of the linked list. Complexity is O(1). */
export const linkedList_removeNode = <TNode extends LinkedListNode>(
  list: LinkedListStructure<TNode>,
  node: TNode,
): void => {
  const { prev, next } = node;
  if (prev) {
    prev.next = next;
  } else {
    list.head = next;
  }
  if (next) {
    next.prev = prev;
  } else {
    list.tail = prev;
  }
  node.prev = null;
  node.next = null;
};

/** linkedList_unshiftNode: Add the given node to the beginning of the linked list. Complexity is O(1). */
export const linkedList_unshiftNode = <TNode extends LinkedListNode>(
  list: LinkedListStructure<TNode>,
  node: TNode,
): void => {
  const head = list.head;
  node.prev = null;
  node.next = head || null;
  if (head) {
    head.prev = node;
  } else {
    list.tail = node;
  }
  list.head = node;
};

/** Remove the first node from the linked list and returns it. Complexity is O(1). */
export const linkedList_shiftNode = <TNode extends LinkedListNode>(
  list: LinkedListStructure<TNode> | null | undefined,
): TNode | null => {
  if (!list) {
    return null;
  }
  const node = list.head;
  if (!node) {
    return null;
  }
  const next = node.next;
  if (next) {
    list.head = next;
    next.prev = null;
  } else {
    list.head = null;
    list.tail = null;
  }
  node.prev = null;
  return node;
};

/** Insert the given node after the given node. Complexity is O(1). */
export const linkedList_insertNodeAfter = <TNode extends LinkedListNode>(
  list: LinkedListStructure<TNode>,
  node: TNode,
  after?: TNode | null | undefined,
): void => {
  if (!after) {
    linkedList_pushNode(list, node);
  } else {
    node.prev = after;
    node.next = after.next ?? null;
    if (after?.next) {
      after.next.prev = node;
    } else {
      list.tail = node;
    }
    after.next = node;
  }
};

/** Insert the given node before the given node. Complexity is O(1). */
export const linkedList_insertNodeBefore = <TNode extends LinkedListNode>(
  list: LinkedListStructure<TNode>,
  node: TNode,
  before?: TNode | null | undefined,
): void => {
  if (!before) {
    linkedList_unshiftNode(list, node);
  } else {
    node.prev = before.prev;
    node.next = before;
    if (before.prev) {
      before.prev.next = node;
    } else {
      list.head = node;
    }
    before.prev = node;
  }
};

/**
 * Reverse the linked list.
 * The first node becomes the last node, and the last node becomes the first node.
 *
 * @param list The linked list.
 */
export const linkedList_reverse = <TNode extends LinkedListNode>(
  list: LinkedListStructure<TNode> | null | undefined,
): void => {
  let node = list?.head;
  while (node) {
    const next = node.next;
    node.next = node.prev;
    node.prev = next;
    node = next;
  }
  const head = list?.head;
  list!.head = list!.tail ?? null;
  list!.tail = head ?? null;
};

/**
 * Clear the linked list, removing all nodes.
 *
 * @param list The linked list to clear.
 */
export const linkedList_clear = <TNode extends LinkedListNode>(
  list: LinkedListStructure<TNode> | null | undefined,
): void => {
  if (list) {
    let node = list.head;
    while (node) {
      const next = node.next;
      node.prev = null;
      node.next = null;
      node = next;
    }
    list.head = null;
    list.tail = null;
  }
};

/**
 * Merges the source linked list into the target linked list.
 * The source linked list is cleared.
 * @param target The target linked list. This will be modified, the source list nodes will be appended to it.
 * @param source The source linked list. This will be cleared.
 */
export const linkedList_merge = <
  TNode extends LinkedListNode,
  TTarget extends LinkedListStructure<TNode> = LinkedListStructure<TNode>,
>(
  target: TTarget,
  source: LinkedListStructure<TNode> | null | undefined,
): TTarget => {
  if (source && source.head) {
    if (target.tail) {
      target.tail.next = source.head;
      source.head.prev = target.tail;
    } else {
      target.head = source.head;
    }
    target.tail = source.tail;
    source.head = null;
    source.tail = null;
  }
  return target;
};
