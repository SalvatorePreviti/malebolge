import { describe, expect, it } from "vitest";

import {
  linkedList_clear,
  linkedList_insertNodeAfter,
  linkedList_insertNodeBefore,
  linkedList_popNode,
  linkedList_pushNode,
  linkedList_removeNode,
  linkedList_shiftNode,
  linkedList_reverse,
  linkedList_unshiftNode,
  linkedList_size,
  linkedList_everyNode,
  linkedList_findNode,
  linkedList_isEmpty,
  linkedList_forEachNode,
  linkedList_includesNode,
  linkedList_values,
  linkedList_valuesReverse,
  linkedList_nodes,
  linkedList_nodesReverse,
  linkedList_someNode,
  linkedList_mapNodes,
  linkedList_indexOfNode,
  linkedList_indexOfValue,
  linkedList_findNodeIndex,
  linkedList_includesValue,
  linkedList_merge,
  linkedList_pushNodes,
  linkedList_countWhere,
  linkedList_includesNodeInRange,
} from "@malebolge/data-structures";
import { BREAK } from "@malebolge/core";

class Node {
  public prev: Node | null = null;
  public next: Node | null = null;
  constructor(public value: number = 0) {}
}

class List {
  public head: Node | null = null;
  public tail: Node | null = null;
}

describe("LinkedList", () => {
  describe("linkedList_pushNode", () => {
    it("should add a node to an empty list", () => {
      const list = new List();
      const node = new Node(1);
      linkedList_pushNode(list, node);
      expect(list.head).toBe(node);
      expect(list.tail).toBe(node);
    });

    it("should add a node to the end of a non-empty list", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      linkedList_pushNodes(list, node1, node2);
      expect(list.head).toBe(node1);
      expect(list.tail).toBe(node2);
      expect(node1.next).toBe(node2);
      expect(node2.prev).toBe(node1);
    });
  });

  describe("linkedList_isEmpty", () => {
    it("should return true only for an empty list", () => {
      const list = new List();
      expect(linkedList_isEmpty(list)).toBe(true);
      linkedList_pushNode(list, new Node());
      expect(linkedList_isEmpty(list)).toBe(false);
      linkedList_pushNode(list, new Node());
      expect(linkedList_isEmpty(list)).toBe(false);
    });
  });

  describe("linkedList_size", () => {
    it("should return the number of nodes", () => {
      expect(linkedList_size(undefined)).toBe(0);
      expect(linkedList_size(null)).toBe(0);
      const list = new List();
      expect(linkedList_size(list)).toBe(0);
      linkedList_pushNode(list, new Node());
      expect(linkedList_size(list)).toBe(1);
      linkedList_pushNode(list, new Node());
      expect(linkedList_size(list)).toBe(2);
      linkedList_pushNode(list, new Node());
      expect(linkedList_size(list)).toBe(3);
      linkedList_pushNode(list, new Node());
      expect(linkedList_size(list)).toBe(4);
    });
  });

  describe("linkedList_countWhere", () => {
    it("should return the number of nodes that satisfy the predicate", () => {
      expect(linkedList_countWhere(undefined, () => true)).toBe(0);
      expect(linkedList_countWhere(null, () => true)).toBe(0);

      const list = new List();
      expect(linkedList_countWhere(list, () => true)).toBe(0);
      linkedList_pushNodes(list, new Node(1), new Node(2), new Node(3));
      expect(linkedList_countWhere(list, ({ value }) => value > 0)).toBe(3);
      expect(linkedList_countWhere(list, ({ value }) => value > 1)).toBe(2);
      expect(linkedList_countWhere(list, ({ value }) => value > 2)).toBe(1);
      expect(linkedList_countWhere(list, ({ value }) => value > 3)).toBe(0);
    });
  });

  describe("linkedList_popNode", () => {
    it("should return null for an empty list", () => {
      expect(linkedList_popNode(new List())).toBeNull();
    });

    it("should remove and return the last node of a non-empty list", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      linkedList_pushNodes(list, node1, node2);
      expect(linkedList_popNode(list)).toBe(node2);
      expect(list.head).toBe(node1);
      expect(list.tail).toBe(node1);
      expect(node1.next).toBeNull();
      expect(node2.prev).toBeNull();
    });
  });

  describe("linkedList_removeNode", () => {
    it("should remove a node from a list with one node", () => {
      const list = new List();
      const node = new Node(1);
      linkedList_pushNode(list, node);
      linkedList_removeNode(list, node);
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();
      expect(node.prev).toBeNull();
      expect(node.next).toBeNull();
    });

    it("should remove a node from the beginning of a list with multiple nodes", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      const node3 = new Node(3);
      linkedList_pushNodes(list, node1, node2, node3);
      linkedList_removeNode(list, node1);
      expect(list.head).toBe(node2);
      expect(list.tail).toBe(node3);
      expect(node1.prev).toBeNull();
      expect(node1.next).toBeNull();
      expect(node2.prev).toBeNull();
      expect(node2.next).toBe(node3);
      expect(node3.prev).toBe(node2);
      expect(node3.next).toBeNull();
      expect(linkedList_mapNodes(list)).toEqual([node2, node3]);
    });

    it("should remove a node from the end of a list with multiple nodes", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      const node3 = new Node(3);
      linkedList_pushNodes(list, node1, node2, node3);
      linkedList_removeNode(list, node3);
      expect(list.head).toBe(node1);
      expect(list.tail).toBe(node2);
      expect(node3.prev).toBeNull();
      expect(node3.next).toBeNull();
      expect(node1.prev).toBeNull();
      expect(node1.next).toBe(node2);
      expect(node2.prev).toBe(node1);
      expect(node2.next).toBeNull();
      expect(linkedList_mapNodes(list)).toEqual([node1, node2]);
    });
  });

  describe("linkedList_unshiftNode", () => {
    it("should add a node to an empty list", () => {
      const list = new List();
      const node = new Node(1);
      linkedList_unshiftNode(list, node);
      expect(list.head).toBe(node);
      expect(list.tail).toBe(node);
    });

    it("should add a node to the beginning of a non-empty list", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      linkedList_unshiftNode(list, node1);
      linkedList_unshiftNode(list, node2);
      expect(list.head).toBe(node2);
      expect(list.tail).toBe(node1);
      expect(node1.prev).toBe(node2);
      expect(node2.next).toBe(node1);
      expect(linkedList_mapNodes(list)).toEqual([node2, node1]);
    });
  });

  describe("linkedList_shiftNode", () => {
    it("should return null for an empty list", () => {
      const list = new List();
      expect(linkedList_shiftNode(list)).toBeNull();
    });

    it("should remove and return the first node of a non-empty list", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      linkedList_pushNodes(list, node1, node2);
      expect(linkedList_shiftNode(list)).toBe(node1);
      expect(list.head).toBe(node2);
      expect(list.tail).toBe(node2);
      expect(node1.prev).toBeNull();
      expect(node2.next).toBeNull();
      expect(linkedList_mapNodes(list)).toEqual([node2]);
    });
  });

  describe("linkedList_insertNodeAfter", () => {
    it("should add a node after null", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      linkedList_pushNode(list, node1);
      linkedList_insertNodeAfter(list, node2, null);
      expect(list.head).toBe(node1);
      expect(list.tail).toBe(node2);
      expect(node1.next).toBe(node2);
      expect(node2.prev).toBe(node1);
      expect(linkedList_mapNodes(list)).toEqual([node1, node2]);
    });

    it("should add a node after a node", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      const node3 = new Node(3);
      linkedList_pushNodes(list, node1, node2);
      linkedList_insertNodeAfter(list, node3, node1);
      expect(list.head).toBe(node1);
      expect(list.tail).toBe(node2);
      expect(node1.next).toBe(node3);
      expect(node3.prev).toBe(node1);
      expect(node3.next).toBe(node2);
      expect(node2.prev).toBe(node3);
      expect(linkedList_mapNodes(list)).toEqual([node1, node3, node2]);
    });
  });

  describe("linkedList_insertNodeBefore", () => {
    it("should add a node before null", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      linkedList_pushNode(list, node1);
      linkedList_insertNodeBefore(list, node2, null);
      expect(list.head).toBe(node2);
      expect(list.tail).toBe(node1);
      expect(node2.next).toBe(node1);
      expect(node1.prev).toBe(node2);
      expect(linkedList_mapNodes(list)).toEqual([node2, node1]);
    });

    it("should add a node before a node", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      const node3 = new Node(3);
      linkedList_pushNodes(list, node1, node2);
      linkedList_insertNodeBefore(list, node3, node2);
      expect(list.head).toBe(node1);
      expect(list.tail).toBe(node2);
      expect(node1.next).toBe(node3);
      expect(node3.prev).toBe(node1);
      expect(node3.next).toBe(node2);
      expect(node2.prev).toBe(node3);
      expect(linkedList_mapNodes(list)).toEqual([node1, node3, node2]);
    });
  });

  describe("linedList_reverse", () => {
    it("should reverse an empty list", () => {
      const list = new List();
      linkedList_reverse(list);
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();
    });

    it("should reverse a list with one node", () => {
      const list = new List();
      const node = new Node(1);
      linkedList_pushNode(list, node);
      linkedList_reverse(list);
      expect(list.head).toBe(node);
      expect(list.tail).toBe(node);
      expect(node.prev).toBeNull();
      expect(node.next).toBeNull();
    });

    it("should reverse a list with multiple nodes", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      const node3 = new Node(3);
      linkedList_pushNodes(list, node1, node2, node3);
      linkedList_reverse(list);
      expect(list.head).toBe(node3);
      expect(list.tail).toBe(node1);
      expect(node1.prev).toBe(node2);
      expect(node1.next).toBeNull();
      expect(node2.prev).toBe(node3);
      expect(node2.next).toBe(node1);
      expect(node3.prev).toBeNull();
      expect(node3.next).toBe(node2);
    });
  });

  describe("linkedList_clear", () => {
    it("should clear an empty list", () => {
      const list = new List();
      linkedList_clear(list);
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();
      expect(linkedList_size(list)).toBe(0);
    });

    it("should clear a list with one node", () => {
      const list = new List();
      const node = new Node(1);
      linkedList_pushNode(list, node);
      linkedList_clear(list);
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();
      expect(node.prev).toBeNull();
      expect(node.next).toBeNull();
      expect(linkedList_size(list)).toBe(0);
    });

    it("should clear a list with multiple nodes", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      const node3 = new Node(3);
      linkedList_pushNodes(list, node1, node2, node3);
      linkedList_clear(list);
      expect(list.head).toBeNull();
      expect(list.tail).toBeNull();
      expect(node1.prev).toBeNull();
      expect(node1.next).toBeNull();
      expect(node2.prev).toBeNull();
      expect(node2.next).toBeNull();
      expect(node3.prev).toBeNull();
      expect(node3.next).toBeNull();
      expect(linkedList_size(list)).toBe(0);
    });
  });

  describe("linkedList_findNode", () => {
    it("should return the right node", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      expect(linkedList_findNode(list, () => true)).toBeNull();
      linkedList_pushNode(list, node1);
      linkedList_pushNode(list, node2);
      expect(linkedList_findNode(list, ({ value }) => value === 1)).toBe(node1);
      expect(linkedList_findNode(list, ({ value }) => value === 2)).toBe(node2);
      expect(linkedList_findNode(list, ({ value }) => value === 0)).toBeNull();
    });
  });

  describe("linkedList_everyNode", () => {
    it("should return true for an empty list", () => {
      const list = new List();
      expect(linkedList_everyNode(list, () => true)).toBe(true);
    });

    it("should return true only if the callback returns true for all elements", () => {
      const list = new List();
      linkedList_pushNodes(list, new Node(1), new Node(2), new Node(3));
      expect(linkedList_everyNode(list, (n) => n.value > 0)).toBe(true);

      linkedList_pushNodes(list, new Node(0), new Node(4));
      expect(linkedList_everyNode(list, (n) => n.value > 0)).toBe(false);
    });
  });

  describe("linkedList_someNode", () => {
    it("should return false for an empty list", () => {
      const list = new List();
      expect(linkedList_someNode(list, () => true)).toBe(false);
    });

    it("should return true if the callback returns true for any element", () => {
      const list = new List();
      linkedList_pushNodes(list, new Node(1), new Node(2), new Node(3));
      expect(linkedList_someNode(list, (n) => n.value === 2)).toBe(true);
      expect(linkedList_someNode(list, (n) => n.value === 0)).toBe(false);
    });
  });

  describe("linkedList_forEachNode", () => {
    it("should iterate over all nodes", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      const node3 = new Node(3);
      linkedList_pushNodes(list, node1, node2, node3);
      const values: number[] = [];
      linkedList_forEachNode(list, (n) => values.push(n.value));
      expect(values).toEqual([1, 2, 3]);
    });

    it("breaks if the callback returns BREAK", () => {
      const list = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      const node3 = new Node(3);
      linkedList_pushNodes(list, node1, node2, node3);
      const values: number[] = [];
      linkedList_forEachNode(list, (n) => {
        values.push(n.value);
        return n.value === 2 ? BREAK : undefined;
      });
      expect(values).toEqual([1, 2]);
    });
  });

  describe("linkedList_includesNode", () => {
    it("should return false for an empty list", () => {
      expect(linkedList_includesNode(new List(), new Node())).toBe(false);
    });

    it("should return true if the list contains the node", () => {
      const list = new List();
      const node = new Node();
      linkedList_pushNode(list, node);
      expect(linkedList_includesNode(list, node)).toBe(true);
    });

    it("should return false if the list does not contain the node", () => {
      const list = new List();
      const node = new Node();
      linkedList_pushNode(list, new Node());
      expect(linkedList_includesNode(list, node)).toBe(false);
    });
  });

  describe("linkedList_includesNodeInRange", () => {
    it("should return false for an empty list", () => {
      expect(linkedList_includesNodeInRange(new List(), new Node())).toBe(false);
    });

    it("should work for negative startIndex", () => {
      const list = new List();
      const node = new Node();
      linkedList_pushNode(list, node);
      expect(linkedList_includesNodeInRange(list, node, -1)).toBe(true);
      expect(linkedList_includesNodeInRange(list, node, -2)).toBe(true);
    });

    it("should limit by startIndex and endIndex", () => {
      const list = new List();
      const node1 = new Node();
      const node2 = new Node();
      linkedList_pushNode(list, node1);
      linkedList_pushNode(list, node2);

      expect(linkedList_includesNodeInRange(list, node1, 0)).toBe(true);
      expect(linkedList_includesNodeInRange(list, node1, 1)).toBe(false);
      expect(linkedList_includesNodeInRange(list, node1, 2)).toBe(false);
      expect(linkedList_includesNodeInRange(list, node1, 0, 0)).toBe(true);
      expect(linkedList_includesNodeInRange(list, node1, 0, -1)).toBe(false);
      expect(linkedList_includesNodeInRange(list, node2, 0)).toBe(true);
      expect(linkedList_includesNodeInRange(list, node2, 1)).toBe(true);
      expect(linkedList_includesNodeInRange(list, node2, 0, 10)).toBe(true);
      expect(linkedList_includesNodeInRange(list, node2, 0, 0)).toBe(false);
      expect(linkedList_includesNodeInRange(list, node2, 1, 1)).toBe(true);
    });
  });

  describe("linkedList_nodes", () => {
    it("should return an iterator with all nodes", () => {
      const list = new List();
      expect(Array.from(linkedList_nodes(list))).toEqual([]);
      const node1 = new Node(1);
      linkedList_pushNode(list, node1);
      expect(Array.from(linkedList_nodes(list))).toEqual([node1]);
      const node2 = new Node(2);
      linkedList_pushNode(list, node2);
      expect(Array.from(linkedList_nodes(list))).toEqual([node1, node2]);
      const node3 = new Node(3);
      linkedList_pushNode(list, node3);
      expect(Array.from(linkedList_nodes(list))).toEqual([node1, node2, node3]);
    });
  });

  describe("linkedList_nodesReverse", () => {
    it("should return an iterator with all nodes in reverse order", () => {
      const list = new List();
      expect(Array.from(linkedList_nodesReverse(list))).toEqual([]);
      const node1 = new Node(1);
      linkedList_pushNode(list, node1);
      expect(Array.from(linkedList_nodesReverse(list))).toEqual([node1]);
      const node2 = new Node(2);
      linkedList_pushNode(list, node2);
      expect(Array.from(linkedList_nodesReverse(list))).toEqual([node2, node1]);
      const node3 = new Node(3);
      linkedList_pushNode(list, node3);
      expect(Array.from(linkedList_nodesReverse(list))).toEqual([node3, node2, node1]);
    });
  });

  describe("linkedList_values", () => {
    it("should return an iterator with all values", () => {
      const list = new List();
      expect(Array.from(linkedList_values(list))).toEqual([]);
      const node1 = new Node(1);
      linkedList_pushNode(list, node1);
      expect(Array.from(linkedList_values(list))).toEqual([1]);
      const node2 = new Node(2);
      linkedList_pushNode(list, node2);
      expect(Array.from(linkedList_values(list))).toEqual([1, 2]);
      const node3 = new Node(3);
      linkedList_pushNode(list, node3);
      expect(Array.from(linkedList_values(list))).toEqual([1, 2, 3]);
    });
  });

  describe("linkedList_valuesReverse", () => {
    it("should return an iterator with all values in reverse order", () => {
      const list = new List();
      expect(Array.from(linkedList_valuesReverse(list))).toEqual([]);
      const node1 = new Node(1);
      linkedList_pushNode(list, node1);
      expect(Array.from(linkedList_valuesReverse(list))).toEqual([1]);
      const node2 = new Node(2);
      linkedList_pushNode(list, node2);
      expect(Array.from(linkedList_valuesReverse(list))).toEqual([2, 1]);
      const node3 = new Node(3);
      linkedList_pushNode(list, node3);
      expect(Array.from(linkedList_valuesReverse(list))).toEqual([3, 2, 1]);
    });
  });

  describe("linkedList_mapNodes", () => {
    it("should return an empty array for an empty list", () => {
      expect(linkedList_mapNodes(new List(), (n) => n.value + 1)).toEqual([]);
    });

    it("should return an array with the values of all nodes", () => {
      const list = new List();
      const nodes = [new Node(1), new Node(2), new Node(3)] as const;
      linkedList_pushNodes(list, ...nodes);
      expect(linkedList_mapNodes(list, (n) => n.value + 1)).toEqual([2, 3, 4]);
      expect(linkedList_mapNodes(list)).toEqual(nodes);
    });
  });

  describe("linkedList_indexOfNode", () => {
    it("should return -1 for an empty list", () => {
      const list = new List();
      expect(linkedList_indexOfNode(list, new Node())).toBe(-1);
    });

    it("should return the index of the node", () => {
      const list = new List();
      const nodes = [new Node(), new Node(), new Node()] as const;
      expect(linkedList_indexOfNode(list, null)).toBe(-1);
      expect(linkedList_indexOfNode(list, undefined)).toBe(-1);
      expect(linkedList_indexOfNode(list, nodes[0])).toBe(-1);
      linkedList_pushNodes(list, ...nodes);
      expect(linkedList_indexOfNode(list, nodes[0])).toBe(0);
      expect(linkedList_indexOfNode(list, nodes[1])).toBe(1);
      expect(linkedList_indexOfNode(list, nodes[2])).toBe(2);
    });

    it("should return -1 if the node is not in the list", () => {
      const list = new List();
      const node = new Node();
      linkedList_pushNode(list, new Node());
      linkedList_pushNode(list, new Node());
      expect(linkedList_indexOfNode(list, node)).toBe(-1);
    });
  });

  describe("linkedList_indexOfValue", () => {
    it("should return -1 for an empty list", () => {
      const list = new List();
      expect(linkedList_indexOfValue(list, 1)).toBe(-1);
    });

    it("should return the index of the node with the value", () => {
      const list = new List();
      const node = new Node(1);
      linkedList_pushNode(list, new Node(0));
      linkedList_pushNode(list, node);
      linkedList_pushNode(list, new Node(2));
      expect(linkedList_indexOfValue(list, 1)).toBe(1);
    });

    it("should return -1 if the value is not in the list", () => {
      const list = new List();
      linkedList_pushNode(list, new Node(0));
      linkedList_pushNode(list, new Node(1));
      expect(linkedList_indexOfValue(list, 2)).toBe(-1);
    });
  });

  describe("linkedList_findNodeIndex", () => {
    it("should return -1 for an empty list", () => {
      const list = new List();
      expect(linkedList_findNodeIndex(list, () => true)).toBe(-1);
    });

    it("should return the index of the node", () => {
      const list = new List();
      const nodes = [new Node(1), new Node(2), new Node(3)] as const;
      linkedList_pushNodes(list, ...nodes);
      expect(linkedList_findNodeIndex(list, ({ value }) => value === 1)).toBe(0);
      expect(linkedList_findNodeIndex(list, ({ value }) => value === 2)).toBe(1);
      expect(linkedList_findNodeIndex(list, ({ value }) => value === 3)).toBe(2);
    });

    it("should return -1 if the node is not in the list", () => {
      const list = new List();
      linkedList_pushNodes(list, new Node(), new Node());
      expect(linkedList_findNodeIndex(list, () => false)).toBe(-1);
    });
  });

  describe("linkedList_includesValue", () => {
    it("should return false for an empty list", () => {
      const list = new List();
      expect(linkedList_includesValue(list, 1)).toBe(false);
    });

    it("should return true if the list contains the value", () => {
      const list = new List();
      linkedList_pushNode(list, new Node(1));
      expect(linkedList_includesValue(list, 1)).toBe(true);
    });

    it("should return false if the list does not contain the value", () => {
      const list = new List();
      linkedList_pushNode(list, new Node(0));
      expect(linkedList_includesValue(list, 1)).toBe(false);
    });
  });

  describe("linkedList_merge", () => {
    it("should merge two empty lists", () => {
      const list1 = new List();
      const list2 = new List();
      linkedList_merge(list1, list2);
      expect(list1.head).toBeNull();
      expect(list1.tail).toBeNull();
      expect(list2.head).toBeNull();
      expect(list2.tail).toBeNull();
    });

    it("should merge an empty list into a non-empty list", () => {
      const list1 = new List();
      const list2 = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      linkedList_pushNodes(list1, node1, node2);
      linkedList_merge(list1, list2);
      expect(list1.head).toBe(node1);
      expect(list1.tail).toBe(node2);
      expect(list2.head).toBeNull();
      expect(list2.tail).toBeNull();
      expect(node1.prev).toBeNull();
      expect(node1.next).toBe(node2);
      expect(node2.prev).toBe(node1);
      expect(node2.next).toBeNull();
    });

    it("should merge a non-empty list into an empty list", () => {
      const list1 = new List();
      const list2 = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      linkedList_pushNodes(list2, node1, node2);
      linkedList_merge(list1, list2);
      expect(list1.head).toBe(node1);
      expect(list1.tail).toBe(node2);
      expect(list2.head).toBeNull();
      expect(list2.tail).toBeNull();
      expect(node1.prev).toBeNull();
      expect(node1.next).toBe(node2);
      expect(node2.prev).toBe(node1);
      expect(node2.next).toBeNull();
    });

    it("should merge two non-empty lists", () => {
      const list1 = new List();
      const list2 = new List();
      const node1 = new Node(1);
      const node2 = new Node(2);
      const node3 = new Node(3);
      const node4 = new Node(4);
      const node5 = new Node(5);
      linkedList_pushNodes(list1, node1, node2, node3);

      linkedList_pushNode(list2, node4);
      linkedList_pushNode(list2, node5);
      linkedList_merge(list1, list2);

      expect(linkedList_mapNodes(list1)).toEqual([node1, node2, node3, node4, node5]);
      expect(linkedList_mapNodes(list2)).toEqual([]);
      expect(list1.head).toBe(node1);
      expect(list1.tail).toBe(node5);
      expect(list2.head).toBeNull();
      expect(list2.tail).toBeNull();
      expect(node1.prev).toBeNull();
      expect(node1.next).toBe(node2);
      expect(node2.prev).toBe(node1);
      expect(node2.next).toBe(node3);
      expect(node3.prev).toBe(node2);
      expect(node3.next).toBe(node4);
      expect(node4.prev).toBe(node3);
      expect(node4.next).toBe(node5);
      expect(node5.prev).toBe(node4);
      expect(node5.next).toBeNull();
    });
  });
});
