import {
  linkedList_nodes,
  linkedList_popNode,
  linkedList_pushNode,
  linkedList_removeNode,
  linkedList_shiftNode,
  linkedList_unshiftNode,
  linkedList_values,
} from "./linked-list";
import type {
  LinkedListNodeWithValue,
  LinkedListStructure,
  ReadonlyLinkedListNodeWithValue,
  ReadonlyLinkedListStructure,
} from "./linked-list";

/**
 * A node into LinkedDeque.
 *
 * @see LinkedDeque
 */
export interface LinkedDequeNode<T> extends ReadonlyLinkedListNodeWithValue<T> {
  /** When invoked, the node is removed from the list. */
  (): boolean;

  /** The list that owns this node */
  readonly list: LinkedDeque<T> | null;
}

interface WritableLinkedDequeNode<T> {
  value: T;
  prev: this | null;
  next: this | null;
  list: WritableLinkedDeque<T> | null;
}

interface WritableLinkedDeque<T> {
  head: WritableLinkedDequeNode<T> | null;
  tail: WritableLinkedDequeNode<T> | null;
  size: number;
}

const _newNode = <T>(): WritableLinkedDequeNode<T> => {
  const node = (() => {
    const list = node.list;
    if (!list) {
      return false;
    }
    node.list = null;
    linkedList_removeNode(list, node);
    --list.size;
    return true;
  }) as unknown as WritableLinkedDequeNode<T>;
  return node;
};

/**
 * A doubly-linked list that supports adding and removing nodes from either end of the list in constant time.
 * The node itself is a function that, when invoked, removes the node from the list in constant time.
 *
 * Readonly linkedList_* functions works LinkedDeque.
 *
 * @typeparam T The type of value stored in each node.
 */
export class LinkedDeque<T> implements ReadonlyLinkedListStructure<ReadonlyLinkedListNodeWithValue<T>> {
  /** The first node in the list */
  public readonly head: LinkedDequeNode<T> | null;

  /** The last node in the list */
  public readonly tail: LinkedDequeNode<T> | null;

  /** The number of nodes in the list */
  public readonly size: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  /** Add a node to the end of the list */
  public push(value: T): LinkedDequeNode<T> {
    const node = _newNode();
    node.value = value;
    node.list = this as WritableLinkedDeque<T>;
    linkedList_pushNode(this as WritableLinkedDeque<T>, node);
    ++(this as WritableLinkedDeque<T>).size;
    return node as LinkedDequeNode<T>;
  }

  /** Add a node to the beginning of the list */
  public unshift(value: T): LinkedDequeNode<T> {
    const node = _newNode();
    node.value = value;
    node.list = this as WritableLinkedDeque<T>;
    linkedList_unshiftNode(this as WritableLinkedDeque<T>, node);
    ++(this as WritableLinkedDeque<T>).size;
    return node as LinkedDequeNode<T>;
  }

  /** Remove and return the last node in the list */
  public pop(): T | undefined {
    const node = linkedList_popNode(this as LinkedListStructure<WritableLinkedDequeNode<T>>);
    if (!node) {
      return undefined;
    }
    --(this as WritableLinkedDeque<T>).size;
    node.list = null;
    return node.value;
  }

  /** Remove and return the first node in the list */
  public shift(): T | undefined {
    const node = linkedList_shiftNode(this as LinkedListStructure<WritableLinkedDequeNode<T>>);
    if (!node) {
      return undefined;
    }
    --(this as WritableLinkedDeque<T>).size;
    node.list = null;
    return node.value;
  }

  /** Remove all nodes from the list */
  public clear(): boolean {
    let node = this.head as WritableLinkedDequeNode<T> | null;
    if (!node) {
      return false;
    }
    (this as WritableLinkedDeque<T>).head = null;
    (this as WritableLinkedDeque<T>).tail = null;
    (this as WritableLinkedDeque<T>).size = 0;
    do {
      const next: WritableLinkedDequeNode<T> | null = node.next;
      node.list = null;
      node.prev = null;
      node.next = null;
      node = next;
    } while (node);
    return true;
  }

  /**
   * Returns true if the list contains the given node
   *
   * @param node The node to check
   * @returns true if the list contains the given node
   */
  public has(node: LinkedDequeNode<T> | null | undefined): boolean {
    return node?.list === this;
  }

  /**
   * Remove the given node from the list
   *
   * @param node The node to remove
   * @returns true if the node was removed from the list, false if not.
   */
  public delete(node: LinkedDequeNode<T> | null | undefined): boolean {
    return node?.list === this && node();
  }

  /**
   * Reinsert a previously removed node back at the end of this list.
   *
   * @param node The node to reinsert
   * @returns true if the node was reinserted into the list, false if not.
   */
  public repush(node: LinkedDequeNode<T> | null | undefined): boolean {
    if (!node || node.list !== null) {
      return false;
    }
    linkedList_pushNode(this as LinkedListStructure<LinkedListNodeWithValue<T>>, node as LinkedListNodeWithValue<T>);
    (node as { list: LinkedDeque<T> | null }).list = this;
    ++(this as WritableLinkedDeque<T>).size;
    return true;
  }

  /**
   * Reinsert a previously removed node back at the beginning of this list.
   *
   * @param node The node to reinsert
   * @returns true if the node was reinserted into the list, false if not.
   */
  public reunshift(node: LinkedDequeNode<T> | null | undefined): boolean {
    if (!node || node.list !== null) {
      return false;
    }
    linkedList_unshiftNode(this as LinkedListStructure<LinkedListNodeWithValue<T>>, node as LinkedListNodeWithValue<T>);
    (node as { list: LinkedDeque<T> | null }).list = this;
    ++(this as WritableLinkedDeque<T>).size;
    return true;
  }

  /**
   * Returns an iterator that iterates over the nodes in the list.
   * @returns An iterator that iterates over the nodes in the list.
   */
  public nodes(): IterableIterator<LinkedDequeNode<T>> {
    return linkedList_nodes(this);
  }

  /**
   * Returns an iterator that iterates over the values in the list.
   * @returns An iterator that iterates over the values in the list.
   */
  public values(): IterableIterator<T> {
    return linkedList_values(this);
  }

  /**
   * Returns an iterator that iterates over the values in the list.
   * @returns An iterator that iterates over the values in the list.
   */
  public [Symbol.iterator](): IterableIterator<T> {
    return linkedList_values(this);
  }
}
