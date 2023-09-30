import type { LinkedDequeNode } from "../../data-structures/linked-deque";
import { LinkedDeque } from "../../data-structures/linked-deque";
import { describe, expect, it } from "vitest";

describe("LinkedDeque", () => {
  it("should have a size of 0 when created", () => {
    const deque = new LinkedDeque<number>();
    expect(deque.size).toBe(0);
  });

  it("should add nodes to the end of the deque with push()", () => {
    const deque = new LinkedDeque<number>();
    deque.push(1);
    deque.push(2);
    deque.push(3);
    expect(deque.size).toBe(3);
    expect(deque.pop()).toBe(3);
    expect(deque.pop()).toBe(2);
    expect(deque.pop()).toBe(1);
    expect(deque.size).toBe(0);
  });

  it("should add nodes to the beginning of the deque with unshift()", () => {
    const deque = new LinkedDeque<number>();
    deque.unshift(1);
    deque.unshift(2);
    deque.unshift(3);
    expect(deque.size).toBe(3);
    expect(deque.shift()).toBe(3);
    expect(deque.shift()).toBe(2);
    expect(deque.shift()).toBe(1);
    expect(deque.size).toBe(0);
  });

  it("should remove nodes from the end of the deque with pop()", () => {
    const deque = new LinkedDeque<number>();
    deque.push(1);
    deque.push(2);
    deque.push(3);
    expect(deque.pop()).toBe(3);
    expect(deque.pop()).toBe(2);
    expect(deque.pop()).toBe(1);
    expect(deque.pop()).toBeUndefined();
    expect(deque.size).toBe(0);
  });

  it("should remove nodes from the beginning of the deque with shift()", () => {
    const deque = new LinkedDeque<number>();
    deque.push(1);
    deque.push(2);
    deque.push(3);
    expect(deque.shift()).toBe(1);
    expect(deque.shift()).toBe(2);
    expect(deque.shift()).toBe(3);
    expect(deque.shift()).toBeUndefined();
    expect(deque.size).toBe(0);
  });

  it("should clear all nodes from the deque with clear()", () => {
    const deque = new LinkedDeque<number>();
    deque.push(1);
    deque.push(2);
    deque.push(3);
    expect(deque.clear()).toBe(true);
    expect(deque.size).toBe(0);
    expect(deque.pop()).toBeUndefined();
    expect(deque.shift()).toBeUndefined();
  });

  it("should return true if a node is in the deque with has()", () => {
    const deque = new LinkedDeque<number>();
    const node1 = deque.push(1);
    const node2 = deque.push(2);
    const node3 = deque.push(3);
    expect(deque.has(node1)).toBe(true);
    expect(deque.has(node2)).toBe(true);
    expect(deque.has(node3)).toBe(true);
    expect(deque.has(null)).toBe(false);
    expect(deque.has(undefined)).toBe(false);
    expect(deque.has({} as LinkedDequeNode<number>)).toBe(false);
  });

  it("should remove a node from the deque with delete()", () => {
    const deque = new LinkedDeque<number>();
    deque.push(1);
    const node2 = deque.push(2);
    deque.push(3);
    expect(deque.delete(node2)).toBe(true);
    expect(deque.size).toBe(2);
    expect(deque.pop()).toBe(3);
    expect(deque.shift()).toBe(1);
    expect(deque.delete(null)).toBe(false);
    expect(deque.delete(undefined)).toBe(false);
    expect(deque.delete({} as LinkedDequeNode<number>)).toBe(false);
  });

  it("should repush a previously removed node with repush()", () => {
    const deque = new LinkedDeque<number>();

    deque.push(1);
    const node2 = deque.push(2);
    deque.push(3);

    expect(deque.delete(node2)).toBe(true);
    expect(deque.size).toBe(2);
    expect(deque.delete(node2)).toBe(false);
    expect(deque.repush(node2)).toBe(true);

    expect(deque.size).toBe(3);
    expect(deque.pop()).toBe(2);
  });

  it("should reunshift a previously removed node with reunshift()", () => {
    const deque = new LinkedDeque<number>();

    deque.push(1);
    const node2 = deque.push(2);
    deque.push(3);

    expect(deque.delete(node2)).toBe(true);
    expect(deque.size).toBe(2);
    expect(deque.delete(node2)).toBe(false);
    expect(deque.reunshift(node2)).toBe(true);

    expect(deque.size).toBe(3);
    expect(deque.shift()).toBe(2);
  });

  it("should iterate over the values in the deque with values()", () => {
    const deque = new LinkedDeque<number>();
    deque.push(1);
    deque.push(2);
    deque.push(3);
    const values = Array.from(deque.values());
    expect(values).toEqual([1, 2, 3]);
  });

  it("should iterate over the nodes in the deque with nodes()", () => {
    const deque = new LinkedDeque<number>();
    const node1 = deque.push(1);
    const node2 = deque.push(2);
    const node3 = deque.push(3);
    const nodes = Array.from(deque.nodes());
    expect(nodes).toEqual([node1, node2, node3]);
  });

  it("should iterate over the values in the deque with [Symbol.iterator]()", () => {
    const deque = new LinkedDeque<number>();
    deque.push(1);
    deque.push(2);
    deque.push(3);
    const values = Array.from(deque);
    expect(values).toEqual([1, 2, 3]);
  });
});
